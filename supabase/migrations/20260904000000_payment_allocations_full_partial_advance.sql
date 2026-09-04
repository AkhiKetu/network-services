-- A collection is the cash receipt; allocations state which monthly invoices it paid.
-- Existing collections are retained and backfilled into this ledger exactly once.
alter table public.collections
  add column if not exists payment_type text not null default 'full';

create table if not exists public.collection_allocations (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete restrict,
  billing_id uuid not null references public.billings(id) on delete restrict,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now(),
  unique (collection_id, billing_id)
);

create index if not exists collection_allocations_billing_idx on public.collection_allocations (billing_id);
create index if not exists collection_allocations_collection_idx on public.collection_allocations (collection_id);

insert into public.collection_allocations (collection_id, billing_id, amount, created_at)
select c.id, c.billing_id, c.amount, c.created_at
from public.collections c
where c.billing_id is not null
  and c.amount > 0
  and not exists (select 1 from public.collection_allocations a where a.collection_id = c.id);

-- Older projects used a two-value CHECK constraint. Replace only status checks,
-- preserving all other constraints and allowing the new partial state.
do $$
declare constraint_name text;
declare status_type text;
declare status_schema text;
begin
  select udt_name, udt_schema into status_type, status_schema
  from information_schema.columns
  where table_schema = 'public' and table_name = 'billings' and column_name = 'status';
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = status_type and n.nspname = status_schema and t.typtype = 'e') then
    execute format('alter type %I.%I add value if not exists ''partial''', status_schema, status_type);
  end if;
  for constraint_name in
    select conname from pg_constraint
    where conrelid = 'public.billings'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.billings drop constraint %I', constraint_name);
  end loop;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = status_type and n.nspname = status_schema and t.typtype = 'e') then
    alter table public.billings add constraint billings_status_check check (status in ('unpaid', 'partial', 'paid'));
  end if;
end $$;

update public.billings b
set status = case
  when coalesce(a.paid_amount, 0) >= b.amount then 'paid'
  when coalesce(a.paid_amount, 0) > 0 then 'partial'
  else 'unpaid'
end,
paid_at = case when coalesce(a.paid_amount, 0) >= b.amount then coalesce(b.paid_at, a.last_collected_at) else null end
from (
  select a.billing_id, sum(a.amount) as paid_amount, max(c.created_at) as last_collected_at
  from public.collection_allocations a
  join public.collections c on c.id = a.collection_id
  group by a.billing_id
) a
where a.billing_id = b.id;

create or replace function public.record_collection_payment_v2(
  p_user_id uuid,
  p_connection_id uuid,
  p_amount numeric,
  p_payment_type text,
  p_payment_method text,
  p_reference_note text,
  p_collected_by uuid
)
returns table (collection_id uuid, allocated_amount numeric, paid_through date)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer record;
  v_connection record;
  v_bill record;
  v_first_billing_id uuid;
  v_collection_id uuid;
  v_remaining numeric;
  v_to_allocate numeric;
  v_cash_left numeric := p_amount;
  v_next_month date;
  v_paid_through date;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Payment amount must be greater than zero.'; end if;
  if p_payment_type not in ('full', 'partial', 'advance') then raise exception 'Choose Full Payment, Partial Payment, or Advance Payment.'; end if;
  if p_payment_method not in ('cash', 'bkash', 'nagad', 'bank') then raise exception 'Choose a valid payment method.'; end if;

  select id, customer_id, name, zone into v_customer
  from profiles where id = p_user_id and role = 'user' and deleted_at is null;
  select * into v_connection from connections
  where id = p_connection_id and user_id = p_user_id and deleted_at is null for update;
  if not found or v_customer.id is null then raise exception 'This customer does not have an active business record.'; end if;
  if not exists (select 1 from profiles where id = p_collected_by and role in ('owner','admin','collector') and deleted_at is null) then
    raise exception 'Collector profile is unavailable.';
  end if;

  -- Lock all existing invoices for this connection. The connection lock above
  -- serializes two collectors even when a future invoice needs to be created.
  for v_bill in select id from billings where connection_id = p_connection_id for update loop end loop;

  select b.*, b.amount - coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0) as remaining
  into v_bill
  from billings b where b.connection_id = p_connection_id
  and b.amount > coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0)
  order by b.billing_month limit 1;

  if p_payment_type in ('full', 'partial') and not found then
    raise exception 'There is no remaining bill available for this customer.';
  end if;
  if p_payment_type = 'full' and p_amount <> v_bill.remaining then
    raise exception 'Full Payment must equal the current remaining due.';
  end if;
  if p_payment_type = 'partial' and p_amount >= v_bill.remaining then
    raise exception 'Partial Payment must be less than the current remaining due.';
  end if;
  v_first_billing_id := v_bill.id;

  insert into collections (user_id, billing_id, connection_id, amount, payment_type, payment_method, reference_note, collected_by, billing_month, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot)
  values (p_user_id, v_first_billing_id, p_connection_id, p_amount, p_payment_type, p_payment_method, nullif(trim(p_reference_note), ''), p_collected_by,
          v_bill.billing_month, v_customer.customer_id, v_customer.name, v_customer.zone, v_connection.package_name)
  returning id into v_collection_id;

  if p_payment_type in ('full', 'partial') then
    insert into collection_allocations (collection_id, billing_id, amount) values (v_collection_id, v_bill.id, p_amount);
    v_cash_left := 0;
  else
    while v_cash_left > 0 loop
      select b.*, b.amount - coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0) as remaining
      into v_bill
      from billings b where b.connection_id = p_connection_id
      and b.amount > coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0)
      order by b.billing_month limit 1;

      if not found then
        select coalesce(max(billing_month) + interval '1 month', date_trunc('month', current_date)::date) into v_next_month
        from billings where connection_id = p_connection_id;
        insert into billings (user_id, connection_id, amount, billing_month, due_date, status, paid_at, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot)
        values (p_user_id, p_connection_id, v_connection.monthly_price, v_next_month, v_next_month, 'unpaid', null, v_customer.customer_id, v_customer.name, v_customer.zone, v_connection.package_name)
        returning id, amount, billing_month into v_bill;
        v_bill.remaining := v_bill.amount;
        if v_first_billing_id is null then
          v_first_billing_id := v_bill.id;
          update collections set billing_id = v_bill.id, billing_month = v_bill.billing_month where id = v_collection_id;
        end if;
      end if;
      v_to_allocate := least(v_cash_left, v_bill.remaining);
      insert into collection_allocations (collection_id, billing_id, amount) values (v_collection_id, v_bill.id, v_to_allocate);
      v_cash_left := v_cash_left - v_to_allocate;
      update billings set status = case when v_to_allocate = v_bill.remaining then 'paid' else 'partial' end,
        paid_at = case when v_to_allocate = v_bill.remaining then now() else null end where id = v_bill.id;
    end loop;
  end if;

  update billings b set status = case when coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0) >= b.amount then 'paid' else 'partial' end,
    paid_at = case when coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0) >= b.amount then coalesce(b.paid_at, now()) else null end
  where b.connection_id = p_connection_id and exists (select 1 from collection_allocations a where a.collection_id = v_collection_id and a.billing_id = b.id);

  select max(billing_month) into v_paid_through from billings where connection_id = p_connection_id and status = 'paid';
  if v_paid_through is not null then
    update connections set renewal_date = (v_paid_through + interval '1 month')::date,
      status = case when (v_paid_through + interval '1 month')::date >= current_date then 'active' else status end
    where id = p_connection_id;
  end if;
  return query select v_collection_id, p_amount, v_paid_through;
end;
$$;

revoke all on function public.record_collection_payment_v2(uuid, uuid, numeric, text, text, text, uuid) from public;
grant execute on function public.record_collection_payment_v2(uuid, uuid, numeric, text, text, text, uuid) to service_role;
