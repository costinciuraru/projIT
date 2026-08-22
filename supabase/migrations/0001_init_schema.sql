-- SUPERSEDED: written before dresscode-db-frontend-contract.md existed.
-- 0003_rebuild_per_contract.sql drops these tables and rebuilds to match the
-- contract. Kept only for history — do not run this file.
--
-- DressCode initial schema
-- Run this once in the Supabase Dashboard -> SQL Editor (or via `supabase db push`
-- if you set up the CLI later). Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE.

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────
-- One row per auth.users row. Created automatically by the trigger below.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  location text,
  avatar_url text,
  preferred_styles text[] not null default '{}',
  ai_credits int not null default 12,
  created_at timestamptz not null default now()
);

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── follows ─────────────────────────────────────────────────────────────
create table if not exists follows (
  follower_id uuid not null references profiles (id) on delete cascade,
  following_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

-- ── outfits (feed posts) ────────────────────────────────────────────────
create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  tag text not null check (tag in ('Casual', 'Office', 'Elegant', 'Streetwear', 'Summer', 'Winter')),
  rating numeric(2, 1) not null default 0,
  likes_count int not null default 0,
  saves_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists outfits_author_id_idx on outfits (author_id);
create index if not exists outfits_tag_idx on outfits (tag);

create table if not exists outfit_likes (
  user_id uuid not null references profiles (id) on delete cascade,
  outfit_id uuid not null references outfits (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, outfit_id)
);

create table if not exists outfit_saves (
  user_id uuid not null references profiles (id) on delete cascade,
  outfit_id uuid not null references outfits (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, outfit_id)
);

-- keep outfits.likes_count / saves_count in sync
create function sync_outfit_counts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_outfit_id uuid := coalesce(new.outfit_id, old.outfit_id);
  target_table text := tg_argv[0];
  count_column text := tg_argv[1];
begin
  execute format(
    'update outfits set %I = (select count(*) from %I where outfit_id = $1) where id = $1',
    count_column, target_table
  ) using target_outfit_id;
  return null;
end;
$$;

drop trigger if exists on_outfit_like_change on outfit_likes;
create trigger on_outfit_like_change
  after insert or delete on outfit_likes
  for each row execute procedure sync_outfit_counts('outfit_likes', 'likes_count');

drop trigger if exists on_outfit_save_change on outfit_saves;
create trigger on_outfit_save_change
  after insert or delete on outfit_saves
  for each row execute procedure sync_outfit_counts('outfit_saves', 'saves_count');

-- ── garment_items (catalog used by Outfit Builder + Try-On) ────────────
create table if not exists garment_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (
    category in ('Jacket', 'Top', 'Bottoms', 'Bag', 'Shoes', 'Dresses', 'Tops', 'Outerwear', 'Bags')
  ),
  price numeric(10, 2) not null,
  image_url text not null,
  preview_image_url text,
  created_at timestamptz not null default now()
);

-- ── tryon_sessions (see backend_architecture.md section 8) ──────────────
create table if not exists tryon_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  user_photo_url text not null,
  garment_item_id uuid references garment_items (id) on delete set null,
  garment_image_url text not null,
  status text not null default 'processing' check (status in ('processing', 'done', 'failed')),
  result_image_url text,
  credits_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tryon_sessions_user_id_idx on tryon_sessions (user_id);

-- ── recommendations (AI "For You" results, persisted per request) ──────
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  outfit_id uuid references outfits (id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  match_percent int not null check (match_percent between 0 and 100),
  price numeric(10, 2),
  mood text,
  occasion text,
  style text,
  created_at timestamptz not null default now()
);

create index if not exists recommendations_user_id_idx on recommendations (user_id);

-- ── stores (nearby stores map) ───────────────────────────────────────────
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  address text not null,
  lat double precision,
  lng double precision,
  is_open boolean not null default true,
  hours_label text,
  created_at timestamptz not null default now()
);

-- ── notifications ────────────────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on notifications (user_id);
