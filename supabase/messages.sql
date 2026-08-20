-- Inbox / call-center messages (run in Supabase SQL editor)
-- PH SMS threads for staff working from a PC.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  customer_id uuid references public.customers (id) on delete set null,
  staff_id uuid references public.staff (id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  created_at timestamptz not null default now(),
  provider_sid text
);

create index if not exists messages_phone_idx on public.messages (phone_number, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "messages_all" on public.messages;
create policy "messages_all"
  on public.messages for all
  to authenticated
  using (true)
  with check (true);

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
