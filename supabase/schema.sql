-- Create the images table
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
  frame text not null default 'none',
  created_at timestamptz not null default now()
);

-- Add indexes for performance
create index if not exists images_status_created_at_idx on public.images (status, created_at desc);
create index if not exists images_status_z_idx on public.images (status, z_index desc);

-- Enable Realtime for this table (Required for the live updates we added)
alter publication supabase_realtime add table images;
