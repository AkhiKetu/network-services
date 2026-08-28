-- Billing cycles are retained permanently.  The snapshot fields make old
-- reports independent of later customer/package edits or soft deletes.
alter table public.connections
  add column if not exists billing_start_date date;

alter table public.billings
  add column if not exists customer_id_snapshot text,
  add column if not exists customer_name_snapshot text,
  add column if not exists zone_snapshot text,
  add column if not exists package_name_snapshot text;

update public.connections
set billing_start_date = coalesce(billing_start_date, start_date)
where billing_start_date is null;

update public.billings b
set customer_id_snapshot = coalesce(b.customer_id_snapshot, p.customer_id),
    customer_name_snapshot = coalesce(b.customer_name_snapshot, p.name),
    zone_snapshot = coalesce(b.zone_snapshot, p.zone),
    package_name_snapshot = coalesce(b.package_name_snapshot, c.package_name)
from public.profiles p
join public.connections c on c.id = b.connection_id
where p.id = b.user_id;

-- Customers entered before the billing launch all begin on 1 September 2026.
-- The INSERT is idempotent and does not alter any already-created invoice.
update public.connections
set billing_start_date = date '2026-09-01',
    start_date = date '2026-09-01',
    renewal_date = date '2026-10-01'
where created_at < timestamptz '2026-09-01 00:00:00+00'
  and deleted_at is null
  and billing_start_date < date '2026-09-01';

insert into public.billings (
  user_id, connection_id, amount, billing_month, due_date, status, paid_at,
  customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot
)
select p.id, c.id, c.monthly_price, date '2026-09-01', c.renewal_date, 'unpaid', null,
       p.customer_id, p.name, p.zone, c.package_name
from public.profiles p
join public.connections c on c.user_id = p.id
where p.role = 'user'
  and p.deleted_at is null
  and c.deleted_at is null
  and c.billing_start_date = date '2026-09-01'
  and not exists (
    select 1 from public.billings b
    where b.connection_id = c.id and b.billing_month = date '2026-09-01'
  );

create unique index if not exists billings_connection_month_unique
  on public.billings (connection_id, billing_month);
create index if not exists billings_month_idx on public.billings (billing_month);
create index if not exists collections_billing_idx on public.collections (billing_id);
