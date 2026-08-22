-- SUPERSEDED: 0001/0002 were written before dresscode-db-frontend-contract.md
-- existed. 0003_rebuild_per_contract.sql drops these tables and 0004_rls_policies.sql
-- replaces the policies below. Kept only for history — do not run this file.
--
-- Row Level Security. Run after 0001_init_schema.sql.
-- Frontend reads directly with the anon key (see frontend/src/lib/supabaseClient.ts);
-- backend uses the service role key, which bypasses RLS entirely.

alter table profiles enable row level security;
alter table follows enable row level security;
alter table outfits enable row level security;
alter table outfit_likes enable row level security;
alter table outfit_saves enable row level security;
alter table garment_items enable row level security;
alter table tryon_sessions enable row level security;
alter table recommendations enable row level security;
alter table stores enable row level security;
alter table notifications enable row level security;

-- profiles: everyone can read (public profile info), only the owner can edit
create policy "profiles are publicly readable" on profiles
  for select using (true);

create policy "users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- follows: public read, only the follower can create/remove their own follow
create policy "follows are publicly readable" on follows
  for select using (true);

create policy "users can follow as themselves" on follows
  for insert with check (auth.uid() = follower_id);

create policy "users can unfollow as themselves" on follows
  for delete using (auth.uid() = follower_id);

-- outfits: public read (feed), only the author can write/edit/delete their own
create policy "outfits are publicly readable" on outfits
  for select using (true);

create policy "users can post their own outfits" on outfits
  for insert with check (auth.uid() = author_id);

create policy "users can update their own outfits" on outfits
  for update using (auth.uid() = author_id);

create policy "users can delete their own outfits" on outfits
  for delete using (auth.uid() = author_id);

-- outfit_likes / outfit_saves: public read (counts), only the acting user can insert/delete their own row
create policy "likes are publicly readable" on outfit_likes
  for select using (true);

create policy "users can like as themselves" on outfit_likes
  for insert with check (auth.uid() = user_id);

create policy "users can unlike as themselves" on outfit_likes
  for delete using (auth.uid() = user_id);

create policy "saves are publicly readable" on outfit_saves
  for select using (true);

create policy "users can save as themselves" on outfit_saves
  for insert with check (auth.uid() = user_id);

create policy "users can unsave as themselves" on outfit_saves
  for delete using (auth.uid() = user_id);

-- garment_items / stores: public catalog data, read-only from the frontend
create policy "garment items are publicly readable" on garment_items
  for select using (true);

create policy "stores are publicly readable" on stores
  for select using (true);

-- tryon_sessions: strictly private to the owning user (backend writes via service role)
create policy "users can read their own tryon sessions" on tryon_sessions
  for select using (auth.uid() = user_id);

-- recommendations: strictly private to the owning user
create policy "users can read their own recommendations" on recommendations
  for select using (auth.uid() = user_id);

-- notifications: strictly private to the owning user
create policy "users can read their own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "users can mark their own notifications read" on notifications
  for update using (auth.uid() = user_id);
