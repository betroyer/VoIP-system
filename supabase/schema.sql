-- Customer Contact System — Phase 1 data layer
-- Run this in the Supabase SQL editor after creating a new project.
-- Then: Authentication → Providers → Email: keep email/password on.
-- Authentication → Settings: turn OFF "Allow new users to sign up".
-- Authentication → Users: create exactly two staff accounts.

create extension if not exists pgcrypto;

create table if not exists public.staff (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_number text not null,
  network text not null check (network in ('tnt', 'smart', 'globe', 'other')),
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  parcel_status text not null default 'pending' check (
    parcel_status in (
      'pending',
      'packed',
      'in_transit',
      'out_for_delivery',
      'awaiting_customer',
      'delayed',
      'delivered',
      'cancelled'
    )
  ),
  tracking_number text,
  notes text,
  needs_contact boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  staff_id uuid not null references public.staff (id) on delete restrict,
  contact_type text not null check (contact_type in ('call', 'sms')),
  timestamp timestamptz not null default now(),
  outcome text not null check (
    outcome in (
      'answered',
      'no_answer',
      'busy',
      'confirmed',
      'declined',
      'wrong_number',
      'sent',
      'failed'
    )
  ),
  notes text,
  recording_link text
);

create index if not exists orders_needs_contact_idx on public.orders (needs_contact, updated_at desc);
create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists contact_logs_order_id_idx on public.contact_logs (order_id, timestamp desc);
create index if not exists contact_logs_timestamp_idx on public.contact_logs (timestamp desc);
create index if not exists customers_phone_idx on public.customers (phone_number);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.staff (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        name = excluded.name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

insert into public.staff (id, name, email)
select
  id,
  coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  email
from auth.users
on conflict (id) do nothing;

alter table public.staff enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.contact_logs enable row level security;

drop policy if exists "staff_select" on public.staff;
drop policy if exists "staff_update_self" on public.staff;
drop policy if exists "customers_all" on public.customers;
drop policy if exists "orders_all" on public.orders;
drop policy if exists "contact_logs_all" on public.contact_logs;

create policy "staff_select"
  on public.staff for select
  to authenticated
  using (true);

create policy "staff_update_self"
  on public.staff for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "customers_all"
  on public.customers for all
  to authenticated
  using (true)
  with check (true);

create policy "orders_all"
  on public.orders for all
  to authenticated
  using (true)
  with check (true);

create policy "contact_logs_all"
  on public.contact_logs for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('call-recordings', 'call-recordings', false)
on conflict (id) do nothing;

drop policy if exists "recordings_select" on storage.objects;
drop policy if exists "recordings_insert" on storage.objects;
drop policy if exists "recordings_update" on storage.objects;
drop policy if exists "recordings_delete" on storage.objects;

create policy "recordings_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'call-recordings');

create policy "recordings_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'call-recordings');

create policy "recordings_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'call-recordings')
  with check (bucket_id = 'call-recordings');

create policy "recordings_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'call-recordings');
