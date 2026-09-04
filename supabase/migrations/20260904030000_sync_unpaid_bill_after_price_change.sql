-- Keeps the current uncollected invoice in sync with an Edit Customer price
-- change, while preserving every invoice that already has an allocation.
create or replace function public.update_connection_monthly_price_v2(
  p_user_id uuid,
  p_connection_id uuid,
  p_monthly_price numeric,
  p_package_name text
)
returns table (connection_id uuid, billing_id uuid)
language plpgsql security definer set search_path = public
as $$
declare
  v_billing_id uuid;
  v_paid_amount numeric;
begin
  if p_monthly_price is null or p_monthly_price < 0 then
    raise exception 'Monthly bill amount must be zero or greater.';
  end if;

  -- This is the same connection lock used by collection/reversal functions.
  perform 1 from public.connections c
  where c.id = p_connection_id and c.user_id = p_user_id and c.deleted_at is null
  for update;
  if not found then raise exception 'This customer does not have an active connection.'; end if;

  perform 1 from public.billings b where b.connection_id = p_connection_id for update;
  update public.connections c
  set monthly_price = p_monthly_price, package_name = p_package_name
  where c.id = p_connection_id;

  select b.id into v_billing_id
  from public.billings b
  where b.connection_id = p_connection_id and b.status <> 'paid'
  order by b.billing_month
  limit 1;

  if v_billing_id is not null then
    select coalesce(sum(a.amount), 0) into v_paid_amount
    from public.collection_allocations a
    where a.billing_id = v_billing_id;
    if v_paid_amount = 0 then
      update public.billings b set amount = p_monthly_price where b.id = v_billing_id;
    end if;
  end if;

  return query select p_connection_id, v_billing_id;
end;
$$;

revoke all on function public.update_connection_monthly_price_v2(uuid, uuid, numeric, text) from public;
grant execute on function public.update_connection_monthly_price_v2(uuid, uuid, numeric, text) to service_role;
