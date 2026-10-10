-- ============================================================
-- Istoric Auto AVF - schema Supabase
-- proiect: nou-separat (ref rrhuerxdmomuvstnxoyt)
-- ruleaza in SQL Editor sau via Management API
-- ============================================================

-- ---- Masini ----
create table if not exists public.vehicles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  make               text,
  model              text,
  year               integer,
  vin                text,
  plate              text,
  current_km         integer not null default 0,
  oil_interval_km    integer not null default 15000,   -- alerta la km
  oil_interval_months integer not null default 12,      -- alerta la timp
  created_at         timestamptz default now()
);

-- ---- Schimburi ulei + filtre ----
create table if not exists public.oil_changes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  vehicle_id    uuid not null references public.vehicles(id) on delete cascade,
  date          date not null default current_date,
  km            integer not null,
  oil_brand     text,          -- ex: Motul, Shell
  oil_spec      text,          -- ex: 5W-30
  oil_quantity  numeric,       -- litri
  filter_oil    text,
  filter_air    text,
  filter_cabin  text,
  part_cost     numeric default 0,
  labor_cost    numeric default 0,
  shop          text,          -- service unde s-a facut
  notes         text,
  receipt_url   text,
  created_at    timestamptz default now()
);

-- ---- Noti piese/reparatii ----
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  vehicle_id  uuid references public.vehicles(id) on delete cascade,
  date        date not null default current_date,
  km          integer,
  title       text not null,
  body        text,
  created_at  timestamptz default now()
);

-- ---- Abonamente Push (Web Push / VAPID) ----
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text,
  auth        text,
  created_at  timestamptz default now()
);

-- ---- Indexuri ----
create index if not exists oil_changes_vehicle_idx on public.oil_changes(vehicle_id, date desc);
create index if not exists oil_changes_user_idx    on public.oil_changes(user_id);
create index if not exists notes_vehicle_idx       on public.notes(vehicle_id, date desc);
create index if not exists vehicles_user_idx       on public.vehicles(user_id);
create index if not exists push_sub_user_idx       on public.push_subscriptions(user_id);

-- ---- RLS: fiecare user isi vede doar datele lui ----
alter table public.vehicles           enable row level security;
alter table public.oil_changes         enable row level security;
alter table public.notes               enable row level security;
alter table public.push_subscriptions  enable row level security;

drop policy if exists own on public.vehicles;
create policy own on public.vehicles for all to authenticated
  using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

drop policy if exists own on public.oil_changes;
create policy own on public.oil_changes for all to authenticated
  using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

drop policy if exists own on public.notes;
create policy own on public.notes for all to authenticated
  using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

drop policy if exists own on public.push_subscriptions;
create policy own on public.push_subscriptions for all to authenticated
  using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));
