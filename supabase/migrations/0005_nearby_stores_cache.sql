-- Shared Overpass API cache for Nearby Stores, keyed by rounded coordinates.
-- Table was already created manually in the dashboard; this file just brings
-- it into version control so the rest of the team has it documented.
-- No automatic cleanup of stale rows yet - deliberately deferred.

-- If you're running this fresh (table doesn't exist yet): matches the table
-- as already created by hand in the dashboard - a uuid primary key plus a
-- separate unique constraint on the coordinate pair, which is what the
-- frontend's .upsert(..., { onConflict: "lat_rounded,lng_rounded" }) targets.
create table if not exists nearby_stores_cache (
  id uuid primary key default gen_random_uuid(),
  lat_rounded numeric(5, 2) not null,
  lng_rounded numeric(6, 2) not null,
  stores_json jsonb not null,
  fetched_at timestamptz not null default now(),
  unique (lat_rounded, lng_rounded)
);

alter table nearby_stores_cache enable row level security;

-- Shared, non-sensitive cache of public store listings - readable and
-- writable by anyone (the frontend upserts it directly with the anon key).
drop policy if exists "nearby stores cache is publicly readable" on nearby_stores_cache;
create policy "nearby stores cache is publicly readable" on nearby_stores_cache
  for select using (true);

drop policy if exists "nearby stores cache is publicly writable" on nearby_stores_cache;
create policy "nearby stores cache is publicly writable" on nearby_stores_cache
  for insert with check (true);

drop policy if exists "nearby stores cache is publicly updatable" on nearby_stores_cache;
create policy "nearby stores cache is publicly updatable" on nearby_stores_cache
  for update using (true);

drop policy if exists "nearby stores cache is publicly deletable" on nearby_stores_cache;
create policy "nearby stores cache is publicly deletable" on nearby_stores_cache
  for delete using (true);
