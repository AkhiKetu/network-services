-- Collector accounts authenticate normally through Supabase Auth. Their name is
-- resolved from profiles when history is displayed; collections stores only UUID.
do $$
declare
  role_type text;
  constraint_name text;
begin
  select c.udt_name into role_type
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'profiles' and c.column_name = 'role';

  if exists (select 1 from pg_type where typname = role_type and typtype = 'e') then
    execute format('alter type public.%I add value if not exists ''collector''', role_type);
  end if;

  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end loop;

  if not exists (select 1 from pg_type where typname = role_type and typtype = 'e') then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('owner', 'admin', 'collector', 'user'));
  end if;
end $$;

alter table public.collections
  add column if not exists collected_by uuid references public.profiles(id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.collections'::regclass
      and contype = 'f'
      and conkey @> array[(select attnum::smallint from pg_attribute where attrelid = 'public.collections'::regclass and attname = 'collected_by')]::smallint[]
  ) then
    alter table public.collections
      add constraint collections_collected_by_fkey foreign key (collected_by) references public.profiles(id);
  end if;
end $$;

create or replace function public.record_collection_payment(
  p_user_id uuid,
  p_billing_id uuid,
  p_connection_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_reference_note text,
  p_collected_by uuid
)
returns table (collection_id uuid, total_paid numeric, remaining_amount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  bill record;
  customer record;
  connection record;
  paid numeric;
  new_collection_id uuid;
begin
  select id, user_id, connection_id, amount, billing_month, status
    into bill
    from billings
    where id = p_billing_id and user_id = p_user_id and connection_id = p_connection_id
    for update;

  if not found or bill.status <> 'unpaid' then
    raise exception 'Bill already fully collected for this month.';
  end if;

  select id, customer_id, name, zone into customer
    from profiles where id = p_user_id and role = 'user' and deleted_at is null;
  select id, package_name into connection from connections where id = p_connection_id and user_id = p_user_id and deleted_at is null;
  if not found or customer.id is null then
    raise exception 'This customer does not have an active business record.';
  end if;
  if not exists (select 1 from profiles where id = p_collected_by and role in ('owner', 'admin', 'collector') and deleted_at is null) then
    raise exception 'Collector profile is unavailable.';
  end if;

  select coalesce(sum(amount), 0) into paid from collections where billing_id = bill.id;
  if paid >= bill.amount then raise exception 'Bill already fully collected for this month.'; end if;
  if p_amount <= 0 or p_amount > bill.amount - paid then raise exception 'Payment cannot be greater than the remaining bill amount.'; end if;

  insert into collections (user_id, billing_id, connection_id, amount, payment_method, reference_note, collected_by, billing_month, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot)
  values (p_user_id, bill.id, p_connection_id, p_amount, p_payment_method, nullif(trim(p_reference_note), ''), p_collected_by, bill.billing_month, customer.customer_id, customer.name, customer.zone, connection.package_name)
  returning id into new_collection_id;

  return query select new_collection_id, paid + p_amount, bill.amount - paid - p_amount;
end;
$$;

revoke all on function public.record_collection_payment(uuid, uuid, uuid, numeric, text, text, uuid) from public;
grant execute on function public.record_collection_payment(uuid, uuid, uuid, numeric, text, text, uuid) to service_role;
