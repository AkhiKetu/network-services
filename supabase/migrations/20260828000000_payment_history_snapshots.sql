-- Every collection remains independently reportable even if the customer,
-- connection, zone, or package is later changed or soft-deleted.
alter table public.collections
  add column if not exists connection_id uuid references public.connections(id),
  add column if not exists billing_month date,
  add column if not exists customer_id_snapshot text,
  add column if not exists customer_name_snapshot text,
  add column if not exists zone_snapshot text,
  add column if not exists package_name_snapshot text;

update public.collections c
set connection_id = coalesce(c.connection_id, b.connection_id),
    billing_month = coalesce(c.billing_month, b.billing_month),
    customer_id_snapshot = coalesce(c.customer_id_snapshot, b.customer_id_snapshot, p.customer_id),
    customer_name_snapshot = coalesce(c.customer_name_snapshot, b.customer_name_snapshot, p.name),
    zone_snapshot = coalesce(c.zone_snapshot, b.zone_snapshot, p.zone),
    package_name_snapshot = coalesce(c.package_name_snapshot, b.package_name_snapshot, cn.package_name)
from public.billings b
left join public.profiles p on p.id = c.user_id
left join public.connections cn on cn.id = b.connection_id
where b.id = c.billing_id;

create index if not exists collections_billing_month_idx
  on public.collections (billing_month);
create index if not exists collections_connection_idx
  on public.collections (connection_id);
