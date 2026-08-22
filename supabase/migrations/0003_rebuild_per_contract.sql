-- Rebuild schema to match dresscode-db-frontend-contract.md, the shared contract
-- doc your teammate added on main. 0001/0002 were an earlier guess made before
-- that contract existed; no real data was ever stored, so we drop and rebuild
-- cleanly instead of layering ALTERs on top of a wrong shape.

drop table if exists notifications cascade;
drop table if exists follows cascade;
drop table if exists recommendations cascade;
drop table if exists tryon_sessions cascade;
drop table if exists garment_items cascade;
drop table if exists outfit_saves cascade;
drop table if exists outfit_likes cascade;
drop table if exists outfits cascade;
drop table if exists stores cascade;
drop table if exists profiles cascade;
drop function if exists sync_outfit_counts() cascade;
drop function if exists handle_new_user() cascade;

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────
-- 1-to-1 with auth.users. account_type distinguishes personal vs. store accounts.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  account_type text not null default 'user' check (account_type in ('user', 'store')),
  height_cm int,
  weight_kg int,
  preferred_styles text[] not null default '{}',
  budget_min int,
  budget_max int,
  location text,
  bio text,
  ai_credits int not null default 12, -- see backend_architecture.md section 9
  created_at timestamptz not null default now()
);

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── stores ──────────────────────────────────────────────────────────────
-- One row per profile with account_type = 'store'. id doubles as the FK.
create table stores (
  id uuid primary key references profiles (id) on delete cascade,
  store_name text not null,
  logo_url text,
  subscription_status text not null default 'trial' check (subscription_status in ('active', 'trial', 'expired')),
  subscription_plan text,
  address text,
  lat double precision,
  lng double precision,
  opening_hours jsonb
);

-- ── outfits (feed posts, by users or stores) ────────────────────────────
create table outfits (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  outfit_type text not null check (
    outfit_type in ('Office', 'Casual', 'Going Out', 'Elegant', 'Streetwear', 'Summer', 'Winter')
  ),
  location text,
  price_total int,
  is_sponsored boolean not null default false,
  created_at timestamptz not null default now()
);

create index outfits_author_id_idx on outfits (author_id);
create index outfits_outfit_type_idx on outfits (outfit_type);

-- ── outfit_items (pieces within an outfit, multi-vendor) ────────────────
create table outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits (id) on delete cascade,
  item_name text not null,
  brand text,
  category text not null check (category in ('Tops', 'Bottoms', 'Shoes', 'Bags', 'Outerwear', 'Dresses')),
  price int,
  image_url text,
  store_id uuid references stores (id) on delete set null
);

create index outfit_items_outfit_id_idx on outfit_items (outfit_id);
create index outfit_items_store_id_idx on outfit_items (store_id);

-- ── likes ───────────────────────────────────────────────────────────────
create table likes (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (outfit_id, user_id)
);

-- ── ratings ─────────────────────────────────────────────────────────────
create table ratings (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  score numeric(2, 1) not null check (score between 0 and 5),
  created_at timestamptz not null default now(),
  unique (outfit_id, user_id)
);

-- frontend reads the average rating from this view instead of a stored column
create view outfit_ratings_avg as
  select outfit_id, round(avg(score), 1) as avg_score, count(*) as ratings_count
  from ratings
  group by outfit_id;

-- ── saved_outfits ───────────────────────────────────────────────────────
create table saved_outfits (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (outfit_id, user_id)
);

-- ── tryon_sessions ──────────────────────────────────────────────────────
create table tryon_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  user_photo_url text not null,
  garment_item_id uuid references outfit_items (id) on delete set null,
  garment_image_url text,
  result_image_url text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  credits_used int not null default 0,
  created_at timestamptz not null default now()
);

create index tryon_sessions_user_id_idx on tryon_sessions (user_id);

-- ── recommendations ─────────────────────────────────────────────────────
create table recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  outfit_id uuid not null references outfits (id) on delete cascade,
  match_score int check (match_score between 0 and 100),
  generated_at timestamptz not null default now()
);

create index recommendations_user_id_idx on recommendations (user_id);

-- ── storage buckets (see contract section 3) ────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('outfit-images', 'outfit-images', true),
  ('user-photos', 'user-photos', false),
  ('tryon-results', 'tryon-results', false),
  ('store-logos', 'store-logos', true)
on conflict (id) do nothing;
