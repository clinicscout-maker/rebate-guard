-- Enable the pg_trgm extension for fuzzy search (optional but recommended for 'ilike' performance)
create extension if not exists pg_trgm;

create table if not exists equipment (
  id uuid default gen_random_uuid() primary key,
  brand text,
  model_number text,
  indoor_model_number text,
  ahri_number text,
  seer2 float,
  hspf2_region_v float,
  hspf2_region_iv float,
  cop_at_minus_15 float,
  is_cold_climate boolean default false,
  source text,
  created_at timestamptz default now()
);

-- Index for faster search on model_number (using pg_trgm for partial match)
create index if not exists idx_equipment_model_trgm on equipment using gin (model_number gin_trgm_ops);

-- Index for AHRI lookups
create index if not exists idx_equipment_ahri on equipment (ahri_number);
