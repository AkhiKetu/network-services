-- Supersedes the earlier allocation RPC without changing existing ledger data.
-- Scalar variables are deliberate: a PL/pgSQL record cannot be extended with
-- an ad-hoc `remaining` field.
drop function if exists public.record_collection_payment_v2(uuid, uuid, numeric, text, text, text, uuid);

create function public.record_collection_payment_v2(
  p_user_id uuid,
  p_connection_id uuid,
  p_amount numeric,
  p_payment_type text,
  p_payment_method text,
  p_reference_note text,
  p_collected_by uuid,
  p_billing_id uuid
)
returns table (collection_id uuid, allocated_amount numeric, paid_through date)
language plpgsql security definer set search_path = public
as $$
declare
  v_customer record;
  v_connection record;
  v_bill_id uuid;
  v_bill_amount numeric;
  v_bill_month date;
  v_remaining numeric;
  v_first_billing_id uuid;
  v_collection_id uuid;
  v_to_allocate numeric;
  v_cash_left numeric := p_amount;
  v_next_month date;
  v_paid_through date;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Payment amount must be greater than zero.'; end if;
  if p_payment_type not in ('full', 'partial', 'advance') then raise exception 'Choose Full Payment, Partial Payment, or Advance Payment.'; end if;
  if p_payment_method not in ('cash', 'bkash', 'nagad', 'bank') then raise exception 'Choose a valid payment method.'; end if;

  select id, customer_id, name, zone into v_customer from profiles where id = p_user_id and role = 'user' and deleted_at is null;
  select * into v_connection from connections where id = p_connection_id and user_id = p_user_id and deleted_at is null for update;
  if not found or v_customer.id is null then raise exception 'This customer does not have an active business record.'; end if;
  if not exists (select 1 from profiles where id = p_collected_by and role in ('owner', 'admin', 'collector') and deleted_at is null) then raise exception 'Collector profile is unavailable.'; end if;

  -- The connection lock serializes payment and reversal attempts for this customer.
  -- Invoice locks additionally protect every existing monthly row.
  perform 1 from billings where connection_id = p_connection_id for update;

  select b.id, b.amount, b.billing_month,
         b.amount - coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0)
    into v_bill_id, v_bill_amount, v_bill_month, v_remaining
  from billings b
  where b.connection_id = p_connection_id
    and (p_payment_type = 'advance' or b.id = p_billing_id)
    and b.amount > coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0)
  order by b.billing_month
  limit 1;

  if p_payment_type in ('full', 'partial') and v_bill_id is null then
    raise exception 'This bill is already fully paid for this month.';
  end if;
  if p_payment_type = 'full' and p_amount <> v_remaining then raise exception 'Full Payment must equal the current remaining due.'; end if;
  if p_payment_type = 'partial' and p_amount >= v_remaining then raise exception 'Partial Payment must be less than the current remaining due.'; end if;

  v_first_billing_id := v_bill_id;
  insert into collections (user_id, billing_id, connection_id, amount, payment_type, payment_method, reference_note, collected_by, billing_month, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot)
  values (p_user_id, v_first_billing_id, p_connection_id, p_amount, p_payment_type, p_payment_method, nullif(trim(p_reference_note), ''), p_collected_by, v_bill_month, v_customer.customer_id, v_customer.name, v_customer.zone, v_connection.package_name)
  returning id into v_collection_id;

  if p_payment_type in ('full', 'partial') then
    insert into collection_allocations (collection_id, billing_id, amount) values (v_collection_id, v_bill_id, p_amount);
  else
    while v_cash_left > 0 loop
      select b.id, b.amount, b.billing_month,
             b.amount - coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0)
        into v_bill_id, v_bill_amount, v_bill_month, v_remaining
      from billings b
      where b.connection_id = p_connection_id
        and b.amount > coalesce((select sum(a.amount) from collection_allocations a where a.billing_id = b.id), 0)
      order by b.billing_month
      limit 1;

      if v_bill_id is null then
        select coalesce(max(billing_month) + interval '1 month', date_trunc('month', current_date)::date) into v_next_month from billings where connection_id = p_connection_id;
        insert into billings (user_id, connection_id, amount, billing_month, due_date, status, paid_at, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot)
        values (p_user_id, p_connection_id, v_connection.monthly_price, v_next_month, v_next_month, 'unpaid', null, v_customer.customer_id, v_customer.name, v_customer.zone, v_connection.package_name)
        returning id, amount, billing_month into v_bill_id, v_bill_amount, v_bill_month;
        v_remaining := v_bill_amount;
        if v_first_billing_id is null then
          v_first_billing_id := v_bill_id;
          update collections set billing_id = v_bill_id, billing_month = v_bill_month where id = v_collection_id;
        end if;
      end if;
      v_to_allocate := least(v_cash_left, v_remaining);
      insert into collection_allocations (collection_id, billing_id, amount) values (v_collection_id, v_bill_id, v_to_allocate);
      v_cash_left := v_cash_left - v_to_allocate;
    end loop;
  end if;

  update billings b
  set status = case when x.paid_amount >= b.amount then 'paid' when x.paid_amount > 0 then 'partial' else 'unpaid' end,
      paid_at = case when x.paid_amount >= b.amount then coalesce(b.paid_at, x.last_paid_at) else null end
  from (
    select a.billing_id, sum(a.amount) as paid_amount, max(c.created_at) as last_paid_at
    from collection_allocations a join collections c on c.id = a.collection_id
    where a.billing_id in (select billing_id from collection_allocations where collection_id = v_collection_id)
    group by a.billing_id
  ) x
  where b.id = x.billing_id;

  select max(billing_month) into v_paid_through from billings where connection_id = p_connection_id and status = 'paid';
  if v_paid_through is not null then
    update connections set renewal_date = (v_paid_through + interval '1 month')::date,
      status = case when (v_paid_through + interval '1 month')::date >= current_date then 'active' else status end
    where id = p_connection_id;
  end if;
  return query select v_collection_id, p_amount, v_paid_through;
end;
$$;

create or replace function public.reverse_collection_payment_v2(p_collection_id uuid, p_deleted_by uuid)
returns table (connection_id uuid, deleted_collection_id uuid)
language plpgsql security definer set search_path = public
as $$
declare
  v_collection record;
  v_connection_id uuid;
  v_paid_through date;
begin
  if not exists (select 1 from profiles where id = p_deleted_by and role in ('owner', 'admin') and deleted_at is null) then
    raise exception 'Only an owner or admin can delete a collection.';
  end if;
  select * into v_collection from collections where id = p_collection_id for update;
  if not found then raise exception 'Collection was not found.'; end if;
  v_connection_id := v_collection.connection_id;
  perform 1 from connections where id = v_connection_id for update;
  perform 1 from billings where connection_id = v_connection_id for update;

  delete from collection_allocations where collection_id = p_collection_id;
  delete from collections where id = p_collection_id;

  update billings b
  set status = case when coalesce(x.paid_amount, 0) >= b.amount then 'paid' when coalesce(x.paid_amount, 0) > 0 then 'partial' else 'unpaid' end,
      paid_at = case when coalesce(x.paid_amount, 0) >= b.amount then x.last_paid_at else null end
  from (
    select b2.id as billing_id, sum(a.amount) as paid_amount, max(c.created_at) as last_paid_at
    from billings b2
    left join collection_allocations a on a.billing_id = b2.id
    left join collections c on c.id = a.collection_id
    where b2.connection_id = v_connection_id
    group by b2.id
  ) x
  where b.id = x.billing_id;

  select max(billing_month) into v_paid_through from billings where connection_id = v_connection_id and status = 'paid';
  if v_paid_through is not null then
    update connections set renewal_date = (v_paid_through + interval '1 month')::date,
      status = case when (v_paid_through + interval '1 month')::date >= current_date then 'active' else status end
    where id = v_connection_id;
  end if;
  return query select v_connection_id, p_collection_id;
end;
$$;

revoke all on function public.record_collection_payment_v2(uuid, uuid, numeric, text, text, text, uuid, uuid) from public;
grant execute on function public.record_collection_payment_v2(uuid, uuid, numeric, text, text, text, uuid, uuid) to service_role;
revoke all on function public.reverse_collection_payment_v2(uuid, uuid) from public;
grant execute on function public.reverse_collection_payment_v2(uuid, uuid) to service_role;
