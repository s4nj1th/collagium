-- Collagium MVP schema
-- Run this in Supabase SQL editor.

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  x double precision not null default 0,
  y double precision not null default 0,
  rotation double precision not null default 0,
  scale double precision not null default 1,
  z_index integer not null default 0,
  locked boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- Helpful index for moderation/ordering
create index if not exists images_status_created_at_idx on public.images (status, created_at desc);
create index if not exists images_status_z_idx on public.images (status, z_index desc);

