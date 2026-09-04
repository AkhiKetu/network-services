-- Qualify all table columns so PL/pgSQL output variables (collection_id and
-- connection_id) can never be mistaken for table columns.
create
or replace function public.record_collection_payment_v2(
  p_user_id uuid,
  p_connection_id uuid,
  p_amount numeric,
  p_payment_type text,
  p_payment_method text,
  p_reference_note text,
  p_collected_by uuid,
  p_billing_id uuid
) returns table (
  collection_id uuid,
  allocated_amount numeric,
  paid_through date
) language plpgsql security definer
set
  search_path = public as $$
declare v_customer record;

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

begin if p_amount is null
or p_amount <= 0 then raise exception 'Payment amount must be greater than zero.';

end if;

if p_payment_type not in ('full', 'partial', 'advance') then raise exception 'Choose Full Payment, Partial Payment, or Advance Payment.';

end if;

if p_payment_method not in ('cash', 'bkash', 'nagad', 'bank') then raise exception 'Choose a valid payment method.';

end if;

select
  p.id,
  p.customer_id,
  p.name,
  p.zone into v_customer
from
  public.profiles p
where
  p.id = p_user_id
  and p.role = 'user'
  and p.deleted_at is null;

select
  cn.* into v_connection
from
  public.connections cn
where
  cn.id = p_connection_id
  and cn.user_id = p_user_id
  and cn.deleted_at is null for
update
;

if not found
or v_customer.id is null then raise exception 'This customer does not have an active business record.';

end if;

if not exists (
  select
    1
  from
    public.profiles p
  where
    p.id = p_collected_by
    and p.role in ('owner', 'admin', 'collector')
    and p.deleted_at is null
) then raise exception 'Collector profile is unavailable.';

end if;

perform 1
from
  public.billings b_lock
where
  b_lock.connection_id = p_connection_id for
update
;

select
  b.id,
  b.amount,
  b.billing_month,
  b.amount - coalesce(
    (
      select
        sum(a.amount)
      from
        public.collection_allocations a
      where
        a.billing_id = b.id
    ),
    0
  ) into v_bill_id,
  v_bill_amount,
  v_bill_month,
  v_remaining
from
  public.billings b
where
  b.connection_id = p_connection_id
  and (
    p_payment_type = 'advance'
    or b.id = p_billing_id
  )
  and b.amount > coalesce(
    (
      select
        sum(a.amount)
      from
        public.collection_allocations a
      where
        a.billing_id = b.id
    ),
    0
  )
order by
  b.billing_month
limit
  1;

if p_payment_type in ('full', 'partial')
and v_bill_id is null then raise exception 'This bill is already fully paid for this month.';

end if;

if p_payment_type = 'full'
and p_amount <> v_remaining then raise exception 'Full Payment must equal the current remaining due.';

end if;

if p_payment_type = 'partial'
and p_amount >= v_remaining then raise exception 'Partial Payment must be less than the current remaining due.';

end if;

v_first_billing_id := v_bill_id;

insert into
  public.collections as c (
    user_id,
    billing_id,
    connection_id,
    amount,
    payment_type,
    payment_method,
    reference_note,
    collected_by,
    billing_month,
    customer_id_snapshot,
    customer_name_snapshot,
    zone_snapshot,
    package_name_snapshot
  )
values
  (
    p_user_id,
    v_first_billing_id,
    p_connection_id,
    p_amount,
    p_payment_type,
    p_payment_method,
    nullif(trim(p_reference_note), ''),
    p_collected_by,
    v_bill_month,
    v_customer.customer_id,
    v_customer.name,
    v_customer.zone,
    v_connection.package_name
  ) returning c.id into v_collection_id;

if p_payment_type in ('full', 'partial') then
insert into
  public.collection_allocations as a (collection_id, billing_id, amount)
values
  (v_collection_id, v_bill_id, p_amount);

else while v_cash_left > 0 loop
select
  b.id,
  b.amount,
  b.billing_month,
  b.amount - coalesce(
    (
      select
        sum(a.amount)
      from
        public.collection_allocations a
      where
        a.billing_id = b.id
    ),
    0
  ) into v_bill_id,
  v_bill_amount,
  v_bill_month,
  v_remaining
from
  public.billings b
where
  b.connection_id = p_connection_id
  and b.amount > coalesce(
    (
      select
        sum(a.amount)
      from
        public.collection_allocations a
      where
        a.billing_id = b.id
    ),
    0
  )
order by
  b.billing_month
limit
  1;

if v_bill_id is null then
select
  coalesce(
    max(b.billing_month) + interval '1 month',
    date_trunc('month', current_date) :: date
  ) into v_next_month
from
  public.billings b
where
  b.connection_id = p_connection_id;

insert into
  public.billings as b (
    user_id,
    connection_id,
    amount,
    billing_month,
    due_date,
    status,
    paid_at,
    customer_id_snapshot,
    customer_name_snapshot,
    zone_snapshot,
    package_name_snapshot
  )
values
  (
    p_user_id,
    p_connection_id,
    v_connection.monthly_price,
    v_next_month,
    v_next_month,
    'unpaid',
    null,
    v_customer.customer_id,
    v_customer.name,
    v_customer.zone,
    v_connection.package_name
  ) returning b.id,
  b.amount,
  b.billing_month into v_bill_id,
  v_bill_amount,
  v_bill_month;

v_remaining := v_bill_amount;

if v_first_billing_id is null then v_first_billing_id := v_bill_id;

update
  public.collections c
set
  billing_id = v_bill_id,
  billing_month = v_bill_month
where
  c.id = v_collection_id;

end if;

end if;

v_to_allocate := least(v_cash_left, v_remaining);

insert into
  public.collection_allocations as a (collection_id, billing_id, amount)
values
  (v_collection_id, v_bill_id, v_to_allocate);

v_cash_left := v_cash_left - v_to_allocate;

end loop;

end if;

update
  public.billings b
set
  status = case
    when x.paid_amount >= b.amount then 'paid'
    when x.paid_amount > 0 then 'partial'
    else 'unpaid'
  end,
  paid_at = case
    when x.paid_amount >= b.amount then coalesce(b.paid_at, x.last_paid_at)
    else null
  end
from
  (
    select
      a.billing_id,
      sum(a.amount) as paid_amount,
      max(c.created_at) as last_paid_at
    from
      public.collection_allocations a
      join public.collections c on c.id = a.collection_id
    where
      a.billing_id in (
        select
          affected_a.billing_id
        from
          public.collection_allocations affected_a
        where
          affected_a.collection_id = v_collection_id
      )
    group by
      a.billing_id
  ) x
where
  b.id = x.billing_id;

select
  max(b.billing_month) into v_paid_through
from
  public.billings b
where
  b.connection_id = p_connection_id
  and b.status = 'paid';

if v_paid_through is not null then
update
  public.connections cn
set
  renewal_date = (v_paid_through + interval '1 month') :: date,
  status = case
    when (v_paid_through + interval '1 month') :: date >= current_date then 'active'
    else cn.status
  end
where
  cn.id = p_connection_id;

end if;

return query
select
  v_collection_id as collection_id,
  p_amount as allocated_amount,
  v_paid_through as paid_through;

end;

$$;

create
or replace function public.reverse_collection_payment_v2(p_collection_id uuid, p_deleted_by uuid) returns table (connection_id uuid, deleted_collection_id uuid) language plpgsql security definer
set
  search_path = public as $$
declare v_collection record;

v_connection_id uuid;

v_paid_through date;

begin if not exists (
  select
    1
  from
    public.profiles p
  where
    p.id = p_deleted_by
    and p.role in ('owner', 'admin')
    and p.deleted_at is null
) then raise exception 'Only an owner or admin can delete a collection.';

end if;

select
  c.* into v_collection
from
  public.collections c
where
  c.id = p_collection_id for
update
;

if not found then raise exception 'Collection was not found.';

end if;

v_connection_id := v_collection.connection_id;

perform 1
from
  public.connections cn
where
  cn.id = v_connection_id for
update
;

perform 1
from
  public.billings b_lock
where
  b_lock.connection_id = v_connection_id for
update
;

delete from
  public.collection_allocations a
where
  a.collection_id = p_collection_id;

delete from
  public.collections c
where
  c.id = p_collection_id;

update
  public.billings b
set
  status = case
    when coalesce(x.paid_amount, 0) >= b.amount then 'paid'
    when coalesce(x.paid_amount, 0) > 0 then 'partial'
    else 'unpaid'
  end,
  paid_at = case
    when coalesce(x.paid_amount, 0) >= b.amount then x.last_paid_at
    else null
  end
from
  (
    select
      b2.id as billing_id,
      sum(a.amount) as paid_amount,
      max(c.created_at) as last_paid_at
    from
      public.billings b2
      left join public.collection_allocations a on a.billing_id = b2.id
      left join public.collections c on c.id = a.collection_id
    where
      b2.connection_id = v_connection_id
    group by
      b2.id
  ) x
where
  b.id = x.billing_id;

select
  max(b.billing_month) into v_paid_through
from
  public.billings b
where
  b.connection_id = v_connection_id
  and b.status = 'paid';

if v_paid_through is not null then
update
  public.connections cn
set
  renewal_date = (v_paid_through + interval '1 month') :: date,
  status = case
    when (v_paid_through + interval '1 month') :: date >= current_date then 'active'
    else cn.status
  end
where
  cn.id = v_connection_id;

end if;

return query
select
  v_connection_id as connection_id,
  p_collection_id as deleted_collection_id;

end;

$$;

revoke all on function public.record_collection_payment_v2(
  uuid,
  uuid,
  numeric,
  text,
  text,
  text,
  uuid,
  uuid
)
from
  public;

grant execute on function public.record_collection_payment_v2(
  uuid,
  uuid,
  numeric,
  text,
  text,
  text,
  uuid,
  uuid
) to service_role;

revoke all on function public.reverse_collection_payment_v2(uuid, uuid)
from
  public;

grant execute on function public.reverse_collection_payment_v2(uuid, uuid) to service_role;
