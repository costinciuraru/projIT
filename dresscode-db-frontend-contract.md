# DressCode — Contract Frontend ↔ Supabase (Bază de Date)

Acest fișier e gândit să fie dat lui Claude (din VSCode-ul colegului) ca reper când construiește schema în Supabase, ca să iasă compatibilă cu frontend-ul care se construiește în paralel (folder separat `frontend/`, Vite + React + TypeScript + Tailwind, deocamdată cu date mock).

Scopul: să nu trebuiască rescris frontend-ul când vine backend-ul — doar înlocuim sursa datelor mock cu query-uri Supabase, păstrând aceleași "shape"-uri de date.

---

## 1. Context rapid despre aplicație

DressCode = social media de fashion (feed tip Instagram/Pinterest) + recomandări personalizate + magazine/branduri cu conturi speciale + Outfit Builder (combini piese de la mai mulți vendori) + AI Virtual Try-On.

Două tipuri de conturi: **Utilizatori** (persoane fizice) și **Magazine/Branduri** (Zara, H&M, Mango etc., cu abonament lunar + postări sponsorizate).

Paginile frontend deja definite (fiecare are nevoie de date din DB): Home/Feed, Search, AI Try-On, For You, Nearby Stores, Outfit Builder, Profile.

---

## 2. Cum va vorbi frontend-ul cu Supabase

- Client: `@supabase/supabase-js`, instanțiat o singură dată în `src/lib/supabaseClient.ts`.
- Variabile de mediu așteptate de frontend (pune-le într-un `.env.example` în root-ul proiectului Supabase/backend, ca să știe toată lumea numele exacte):
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  ```
- Auth: Supabase Auth (email/password + eventual OAuth). Frontend-ul va folosi `supabase.auth.signUp / signInWithPassword / getSession`.
- Convenție de naming: **în DB (Postgres/Supabase) — `snake_case`** pentru tabele și coloane (e default-ul Postgres și al Supabase). **În frontend (TypeScript) — `camelCase`**. Cine scrie query-urile poate fie mapa manual în frontend, fie generăm tipuri automat cu `supabase gen types typescript` și mapăm la un nivel de adapter — decideți împreună, dar frontend-ul presupune că primește obiecte curate, deja mapate la forma din secțiunea 4.

---

## 3. Schema propusă (tabele + coloane + relații)

Astea sunt entitățile minime necesare ca să acopere ce există deja în mockup și în frontend. Numele sunt sugestii — dacă schimbați ceva, actualizați și tabelul de mapare din secțiunea 4.

### `profiles`
Extensie peste `auth.users` (1-la-1, `id` = `auth.users.id`).

| coloană | tip | note |
|---|---|---|
| id | uuid (PK, FK → auth.users.id) | |
| username | text | unic |
| display_name | text | |
| avatar_url | text | link către Storage |
| account_type | text | `'user'` sau `'store'` |
| height_cm | int | doar pt. `account_type = user` |
| weight_kg | int | doar pt. `account_type = user` |
| preferred_styles | text[] | ex: `['Minimalist','Elegant']` |
| budget_min | int | RON |
| budget_max | int | RON |
| location | text | oraș/zonă, sau `geography(point)` dacă vreți query-uri reale de distanță |
| bio | text | |
| created_at | timestamptz | default now() |

### `stores`
Info suplimentară pentru conturile de magazin (FK către `profiles`).

| coloană | tip | note |
|---|---|---|
| id | uuid (PK, FK → profiles.id) | |
| store_name | text | |
| logo_url | text | |
| subscription_status | text | `'active' \| 'trial' \| 'expired'` |
| subscription_plan | text | |
| address | text | |
| lat / lng | float8 | pentru Nearby Stores |
| opening_hours | jsonb | ex: `{ "mon": "10:00-21:00", ... }` |

### `outfits`
Postările din feed (de la utilizatori SAU magazine — verifici `profiles.account_type` al autorului).

| coloană | tip | note |
|---|---|---|
| id | uuid (PK) | |
| author_id | uuid (FK → profiles.id) | |
| title | text | |
| description | text | |
| image_url | text | Storage |
| outfit_type | text | `'Office' \| 'Casual' \| 'Going Out' \| 'Elegant' \| ...` — enum recomandat |
| location | text | opțional |
| price_total | int | RON, calculat/sumă din `outfit_items` |
| is_sponsored | bool | pt. postări plătite de magazine |
| created_at | timestamptz | |

### `outfit_items`
Piesele individuale dintr-un outfit (pentru Outfit Builder — multi-vendor).

| coloană | tip | note |
|---|---|---|
| id | uuid (PK) | |
| outfit_id | uuid (FK → outfits.id) | |
| item_name | text | |
| brand | text | |
| category | text | `'Tops' \| 'Bottoms' \| 'Shoes' \| 'Bags' \| 'Outerwear' \| 'Dresses'` |
| price | int | RON |
| image_url | text | |
| store_id | uuid (FK → stores.id, nullable) | dacă piesa vine dintr-un magazin cu cont pe platformă |

### `outfit_tags`
Dacă vreți tag-uri libere pe lângă `outfit_type` (ex: brand-uri menționate). Opțional — poate fi și doar un `text[]` direct pe `outfits`.

| coloană | tip |
|---|---|
| id | uuid (PK) |
| outfit_id | uuid (FK) |
| tag | text |

### `likes`
| coloană | tip |
|---|---|
| id | uuid (PK) |
| outfit_id | uuid (FK → outfits.id) |
| user_id | uuid (FK → profiles.id) |
| created_at | timestamptz |

Unique constraint pe `(outfit_id, user_id)`.

### `ratings`
| coloană | tip | note |
|---|---|---|
| id | uuid (PK) | |
| outfit_id | uuid (FK) | |
| user_id | uuid (FK) | |
| score | numeric(2,1) | 0.0–5.0 |

Unique pe `(outfit_id, user_id)`. Frontend-ul afișează media (`avg(score)`), calculată printr-un view sau la query.

### `saved_outfits`
| coloană | tip |
|---|---|
| id | uuid (PK) |
| outfit_id | uuid (FK) |
| user_id | uuid (FK) |
| created_at | timestamptz |

### `tryon_sessions`
Pentru AI Virtual Try-On (indiferent ce API/model folosiți la generare — vezi discuția separată despre FASHN/fal.ai/IDM-VTON).

| coloană | tip | note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| user_photo_url | text | Storage, poza încărcată de user |
| garment_item_id | uuid (FK → outfit_items.id, nullable) | sau `garment_image_url` dacă nu vine dintr-un item existent |
| result_image_url | text | rezultatul generat |
| status | text | `'pending' \| 'processing' \| 'done' \| 'failed'` |
| credits_used | int | |
| created_at | timestamptz | |

### `recommendations` (opțional, poate fi și doar logică server-side fără tabel dedicat)
Dacă vreți să persistați recomandările generate (nu doar calculate on-the-fly):

| coloană | tip |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| outfit_id | uuid (FK) |
| match_score | int | procent, 0-100 |
| generated_at | timestamptz |

### Storage buckets recomandate
- `outfit-images` — poze de outfituri postate
- `user-photos` — pozele încărcate de useri pentru try-on
- `tryon-results` — rezultatele generate de AI
- `store-logos` — logo-uri magazine

---

## 4. Mapare pagină frontend → date necesare

Asta e contractul concret: ce query trebuie să răspundă cu ce formă de date, ca să înlocuiască direct mock-urile din `src/data/`.

| Pagină frontend | Tabele implicate | Shape de date așteptat (aprox., camelCase) |
|---|---|---|
| **Home/Feed** (`/`) | `outfits` + `profiles` (autor) + `likes` (count) + `ratings` (avg) | `{ id, imageUrl, tag, author: { name, avatarUrl }, rating, title, description, likesCount, isSaved }` |
| **Search** (`/search`) | `outfits`, `outfit_items`, `stores` (full-text sau `ilike` pe title/brand/tag) | listă mixtă de outfituri + branduri + categorii, cu `type: 'outfit' \| 'brand' \| 'category'` |
| **AI Try-On** (`/try-on`) | `tryon_sessions`, `outfit_items` (pt. lista de articole selectabile) | items grupate pe `category`, plus `{ sessionId, resultImageUrl, status }` după generare |
| **For You** (`/for-you`) | `recommendations` sau calcul live pe `profiles` (buget/stil/locație) + `outfits` | `{ id, imageUrl, matchPercent, title, description, priceTotal, isSaved }` |
| **Outfit Builder** (`/outfit-builder`) | `outfit_items` (piese selectate de user, posibil salvate temporar client-side până la Save), apoi insert în `outfits` + `outfit_items` la Save | `{ items: [{ id, name, imageUrl, price, category }], totalPrice }` |
| **Nearby Stores** (`/nearby-stores`) | `stores` (query geografic pe `lat/lng` din `profiles.location` al userului) | `{ id, name, logoUrl, distanceKm, isOpen, closesAt }` |
| **Profile** (`/profile`) | `profiles`, `saved_outfits` (count + listă), `tryon_sessions` (count), `ratings` (count date de user) | `{ displayName, avatarUrl, location, preferredStyles, stats: { savedCount, tryOnCount, reviewsCount }, savedOutfits: [...] }` |

---

## 5. Auth & roluri (pentru RLS în Supabase)

Recomandare de reguli (colegul decide exact politica RLS, dar logica de business e asta):

- Oricine autentificat poate **citi** outfituri publice, magazine, produse.
- Un user poate **scrie/edita/șterge** doar propriile `outfits`, `likes`, `ratings`, `saved_outfits`, `tryon_sessions`.
- Doar conturile cu `account_type = 'store'` pot crea outfituri marcate `is_sponsored = true` sau pot edita rândul din `stores` care le corespunde.
- `profiles` — fiecare user își editează doar propriul rând; restul e citit public (pentru afișare autor/avatar în feed).

---

## 6. Ce trebuie decis împreună (open questions)

- Locație: string simplu (oraș) sau `lat/lng` real pentru calcule de distanță la Nearby Stores? (recomand `lat/lng` de la început, altfel Nearby Stores rămâne mock permanent)
- Recomandările din For You: calculate live la fiecare request, sau job/cron care populează `recommendations`?
- Cine generează `match_score`-ul — o funcție SQL simplă (scor pe baza suprapunerii buget/stil), sau se leagă mai târziu de un model AI separat?
- Try-on: unde se apelează API-ul extern de generare imagine (FASHN/fal.ai/self-hosted) — dintr-un Supabase Edge Function (recomandat, ține cheia API secretă server-side) sau dintr-un backend separat?

---

### Notă pentru Claude-ul colegului
Frontend-ul e deja construit cu date mock care respectă shape-urile din secțiunea 4 (fișiere în `frontend/src/data/`). Dacă schema finală din Supabase diferă (nume de coloane, structură), cel mai simplu e să scrieți un layer subțire de adaptare (`src/lib/adapters/*.ts`) care transformă răspunsul Supabase exact în shape-ul așteptat de componente, ca să nu trebuiască umblat prin toate componentele UI.
