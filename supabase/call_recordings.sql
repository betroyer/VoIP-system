-- Call recordings for parcel proof (Android staff app).
-- Run in Supabase SQL editor if not already applied.
-- Bucket `call-recordings` already exists from schema.sql.

create table if not exists public.call_recordings (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete restrict,
  phone_number text not null,
  customer_id uuid references public.customers (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  storage_path text not null,
  duration_seconds int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists call_recordings_phone_idx
  on public.call_recordings (phone_number, created_at desc);
create index if not exists call_recordings_staff_idx
  on public.call_recordings (staff_id, created_at desc);

alter table public.call_recordings enable row level security;

drop policy if exists "call_recordings_all" on public.call_recordings;
create policy "call_recordings_all"
  on public.call_recordings for all
  to authenticated
  using (true)
  with check (true);
