-- Row Level Security for the contract schema (0003_rebuild_per_contract.sql).
-- Supersedes 0002_rls_policies.sql, which targeted tables that no longer exist.
-- Rules per dresscode-db-frontend-contract.md section 5:
--   - any authenticated user can read public outfits/profiles/stores/items
--   - a user can only write/edit/delete their own outfits, likes, ratings,
--     saved_outfits, tryon_sessions
--   - only store accounts can post sponsored outfits or edit their own store row

alter table profiles enable row level security;
alter table stores enable row level security;
alter table outfits enable row level security;
alter table outfit_items enable row level security;
alter table likes enable row level security;
alter table ratings enable row level security;
alter table saved_outfits enable row level security;
alter table tryon_sessions enable row level security;
alter table recommendations enable row level security;

-- profiles: readable by any authenticated user, editable only by the owner
create policy "profiles readable by authenticated users" on profiles
  for select using (auth.role() = 'authenticated');

create policy "users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- stores: readable by any authenticated user, editable only by the store's own account
create policy "stores readable by authenticated users" on stores
  for select using (auth.role() = 'authenticated');

create policy "store owners can update their own store row" on stores
  for update using (auth.uid() = id);

-- outfits: readable by any authenticated user; only the author can write their own;
-- sponsored posts require a store account
create policy "outfits readable by authenticated users" on outfits
  for select using (auth.role() = 'authenticated');

create policy "users can post their own outfits" on outfits
  for insert with check (
    auth.uid() = author_id
    and (
      is_sponsored = false
      or exists (select 1 from profiles where id = auth.uid() and account_type = 'store')
    )
  );

create policy "users can update their own outfits" on outfits
  for update using (auth.uid() = author_id);

create policy "users can delete their own outfits" on outfits
  for delete using (auth.uid() = author_id);

-- outfit_items: readable by any authenticated user; only the parent outfit's author can write
create policy "outfit items readable by authenticated users" on outfit_items
  for select using (auth.role() = 'authenticated');

create policy "outfit authors can add items to their own outfit" on outfit_items
  for insert with check (
    exists (select 1 from outfits where id = outfit_id and author_id = auth.uid())
  );

create policy "outfit authors can update items on their own outfit" on outfit_items
  for update using (
    exists (select 1 from outfits where id = outfit_id and author_id = auth.uid())
  );

create policy "outfit authors can delete items from their own outfit" on outfit_items
  for delete using (
    exists (select 1 from outfits where id = outfit_id and author_id = auth.uid())
  );

-- likes / ratings / saved_outfits: readable by any authenticated user,
-- writable only by the acting user for their own row
create policy "likes readable by authenticated users" on likes
  for select using (auth.role() = 'authenticated');

create policy "users can like as themselves" on likes
  for insert with check (auth.uid() = user_id);

create policy "users can unlike as themselves" on likes
  for delete using (auth.uid() = user_id);

create policy "ratings readable by authenticated users" on ratings
  for select using (auth.role() = 'authenticated');

create policy "users can rate as themselves" on ratings
  for insert with check (auth.uid() = user_id);

create policy "users can update their own rating" on ratings
  for update using (auth.uid() = user_id);

create policy "users can delete their own rating" on ratings
  for delete using (auth.uid() = user_id);

create policy "saved outfits readable by authenticated users" on saved_outfits
  for select using (auth.role() = 'authenticated');

create policy "users can save as themselves" on saved_outfits
  for insert with check (auth.uid() = user_id);

create policy "users can unsave as themselves" on saved_outfits
  for delete using (auth.uid() = user_id);

-- tryon_sessions / recommendations: strictly private to the owning user
-- (the Python backend writes/reads these via the service role key, bypassing RLS)
create policy "users can read their own tryon sessions" on tryon_sessions
  for select using (auth.uid() = user_id);

create policy "users can read their own recommendations" on recommendations
  for select using (auth.uid() = user_id);
