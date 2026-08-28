-- Customer Name remains profiles.name; Username is a separate unique login label.
alter table public.profiles
  add column if not exists username text;

alter table public.connections
  add column if not exists connection_date date,
  add column if not exists onu_receive_power text,
  add column if not exists onu_mac_address text,
  add column if not exists pon_number text,
  add column if not exists mikrotik_password text;

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;
