# DressCode — Backend Architecture (Python / FastAPI)

Backend-ul e stratul din mijloc: frontend-ul (React, `frontend/`) nu vorbește NICIODATĂ direct cu Hugging Face sau cu OpenAI — toate cheile API stau doar aici, server-side, în `.env`-ul deja completat de tine în `backend/`. Backend-ul vorbește și cu Supabase-ul colegului (pentru DB/auth), dar acolo poate merge și direct din frontend pentru citiri simple — detalii mai jos.

**Notă:** varianta inițială a acestui document propunea Node.js, dar backend-ul a fost deja pornit în **Python**, deci documentul e actualizat pe stack-ul ăsta.

---

## 1. De ce avem nevoie de backend (nu doar frontend + Supabase)

Trei motive concrete:

1. **Securitatea cheilor** — un API key de Hugging Face sau de OpenAI (GPT-5 mini) NU trebuie să ajungă niciodată în codul frontend, pentru că orice cheie pusă în React/Vite e vizibilă oricui deschide DevTools. Cheile astea trebuie apelate doar dintr-un server.
2. **Logica de business** — calculul de "câte credite AI mai are userul", validarea inputurilor înainte să dai bani pe un apel către un model plătit, combinarea datelor din Supabase cu răspunsul de la AI.
3. **Generarea de imagini durează** — un try-on poate dura 5-30 secunde. Nu poți ține un request HTTP simplu deschis atât fără riscuri de timeout; ai nevoie de un pattern de job asincron (secțiunea 8).

---

## 2. Stack

- **Python 3.11+**, **FastAPI** (ASGI, async nativ — potrivit exact pentru apelurile lente către Hugging Face/OpenAI fără să blocheze serverul), rulat cu **Uvicorn**.
- **Pydantic v2** — validare de input/output (echivalentul lui `zod` din lumea Node), plus **pydantic-settings** pentru citirea și validarea variabilelor din `.env`.
- Folder separat `backend/`, la același nivel cu `frontend/` în repo, complet independent (propriul `requirements.txt`/`pyproject.toml`, propriul `.env`).
- `supabase-py` — clientul oficial Python pentru Supabase, folosit server-side cu service role key.
- `openai` (SDK oficial Python) — pentru apelurile către GPT-5 mini.
- `httpx` (async) — pentru apelul către endpoint-ul de Hugging Face.
- `slowapi` — rate limiting (echivalentul `express-rate-limit`).

---

## 3. Diagramă de arhitectură (text)

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────────────────┐
│  Frontend   │──HTTP─▶│     Backend       │──HTTP─▶│  Hugging Face Endpoint   │
│  (React,    │        │  (Python/FastAPI) │        │  (Virtual Try-On model) │
│  frontend/) │◀──JSON─│                   │◀──JSON─│                         │
└─────────────┘        │                   │        └─────────────────────────┘
       │                │                   │        ┌─────────────────────────┐
       │ (citiri        │                   │──HTTP─▶│   OpenAI API            │
       │  directe        │                   │◀──JSON─│   (model: gpt-5-mini)   │
       │  simple,        │                   │        └─────────────────────────┘
       │  opțional)      │                   │
       ▼                │                   │──SQL──▶┌─────────────────────────┐
┌─────────────┐        │                   │        │       Supabase          │
│  Supabase   │◀───────┴───────────────────┴───────▶│  (DB / Auth / Storage)  │
│  (Auth+DB)  │                                       └─────────────────────────┘
└─────────────┘
```

Frontend-ul poate citi direct din Supabase (feed, profil, etc. — vezi documentul `dresscode-db-frontend-contract.md`), dar orice acțiune care implică un apel AI (try-on, recomandări generate de model, auto-tagging) trece obligatoriu prin backend.

---

## 4. Structura de foldere (reală, în repo)

**Notă:** o versiune anterioară a acestei secțiuni propunea `app/` + `routers/` + `dependencies/`, dar implementarea reală (deja scrisă și testată) a folosit `src/` + `routes/` + `middleware/`, plus un layer suplimentar `controllers/` (orchestrare business logic — verificare credite, rezolvare `garmentItemId`, pornirea task-ului de fundal — separat de `routes/`, care rămâne doar HTTP in/out). Structura de mai jos e cea reală; dacă preferați convenția `app/`/`routers/`, e o redenumire mecanică (fișiere + importuri + `Dockerfile`/`docker-compose.yml`), nu o rescriere de logică.

```
backend/
├── src/
│   ├── main.py                        # entry point, creează instanța FastAPI + CORS + lifespan
│   ├── config/
│   │   └── env.py                     # pydantic-settings, citește .env
│   ├── routes/
│   │   ├── tryon_routes.py
│   │   ├── health_routes.py           # GET /api/db-check (conexiune Supabase)
│   │   ├── recommendations_routes.py  # stub, neimplementat încă
│   │   └── tagging_routes.py          # stub, neimplementat încă
│   ├── controllers/
│   │   ├── tryon_controller.py        # orchestrare: credite, Supabase, task de fundal
│   │   ├── recommendations_controller.py  # stub
│   │   └── tagging_controller.py          # stub
│   ├── services/
│   │   ├── huggingface_service.py     # apel HTTP (httpx, async) către HF — vezi secțiunea 6
│   │   ├── openai_service.py          # stub, neimplementat încă
│   │   └── supabase_service.py        # client Supabase cu service role key
│   ├── middleware/
│   │   ├── auth_middleware.py         # placeholder auth (header X-User-Id) — vezi secțiunea 7
│   │   └── error_handler_middleware.py    # stub, neimplementat încă
│   └── models/
│       └── schemas.py                 # modele Pydantic pentru request/response
├── .env                # NU se comite — l-ai completat deja manual
├── .env.example        # se comite, doar cu numele variabilelor, fără valori
├── requirements.txt
└── Dockerfile
```

---

## 5. Variabile de mediu (`.env`)

**Implementat și verificat** — toate cele 9 chei există în `backend/.env`, cu valori completate, și corespund exact câmpurilor din `src/config/env.py` (confirmat printr-un pas de verificare: `get_missing_config()` întoarce listă goală).

```bash
# ── Server (opționale — au valori implicite dacă rămân goale) ────────────
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173

# ── Hugging Face (Virtual Try-On) ─────────────────────
HF_API_KEY=
HF_TRYON_ENDPOINT_URL=https://yisol-idm-vton.hf.space   # implicit dacă lipsește

# ── LLM (GPT-5 mini via Azure AI Foundry) ─────────────
# Numele reale din .env — nu OPENAI_API_KEY/OPENAI_MODEL. config/env.py leagă
# aceste nume (nu invers) la câmpurile azure_openai_* via `validation_alias`.
MODEL_NAME=gpt-5-mini
API_KEY=
AZURE_ENDPOINT=

# ── Supabase (server-side, privilegii complete) ───────
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=     # NU e aceeași cu cheia anon din frontend!
```

**Notă despre `HF_TRYON_ENDPOINT_URL`**: `huggingface_service.py` alege singur protocolul după forma URL-ului. `*.endpoints.huggingface.cloud` → Inference Endpoint dedicat, POST simplu async cu `Authorization: Bearer <HF_API_KEY>`. `*.hf.space` → Space public, pattern de queue Gradio (`POST /call/<api_name>` → `event_id` → poll SSE) — ambele implementate și testate.

---

## 6. Endpoint-uri expuse de backend

Toate cer header `Authorization: Bearer <supabase_jwt>` (vezi secțiunea 7), în afară de `/health` și `GET /api/db-check` (verifică rapid conexiunea la Supabase, query pe `profiles`) — acelea rămân publice.

### `POST /api/tryon`
Pornește o sesiune de try-on. **Async** — nu așteaptă rezultatul (vezi secțiunea 8).

Request:
```json
{
  "userPhotoUrl": "https://.../user-photos/xyz.jpg",
  "garmentItemId": "uuid-optional",
  "garmentImageUrl": "https://.../outfit-images/abc.jpg"
}
```

Response (imediat, status 202):
```json
{ "sessionId": "uuid", "status": "processing" }
```

### `GET /api/tryon/{session_id}`
Poll pentru rezultat.

Response:
```json
{ "sessionId": "uuid", "status": "done", "resultImageUrl": "https://...", "creditsUsed": 1 }
```

### `POST /api/recommendations`
Cere recomandări generate/rescored de GPT-5 mini pe baza profilului + filtrelor din pagina For You.

Request:
```json
{
  "mood": "Confident",
  "occasion": "Office",
  "budgetMin": 300,
  "budgetMax": 800,
  "style": "Minimalist"
}
```

Response:
```json
{
  "recommendations": [
    { "outfitId": "uuid", "matchPercent": 92, "reason": "Se potrivește cu stilul minimalist și bugetul indicat." }
  ]
}
```

Implementare: backend-ul ia din Supabase o listă de outfituri candidate (filtrate grosier pe SQL — buget, tag), apoi trimite lista + profilul userului către GPT-5 mini, care le scorează semantic. Nu trimiți toată baza de date — doar un set rezonabil (top 30-50 candidați).

### `POST /api/tagging`
Auto-tag la postarea unui outfit nou.

Request:
```json
{ "imageUrl": "https://.../outfit-images/new.jpg", "descriptionHint": "opțional, text scris de user" }
```

Response:
```json
{ "suggestedType": "Casual", "suggestedTags": ["denim", "streetwear", "neutral tones"] }
```

### `POST /api/weather-suggestion` (opțional, feature din brief)
Primește locația userului, ia vremea (API extern separat, de ales ulterior), trimite context la GPT-5 mini pentru sugestie de ținută.

---

## 7. Autentificare

**Implementat.** Frontend-ul trebuie să trimită la fiecare request header-ul:
```
Authorization: Bearer <access_token de la Supabase Auth>
```

`src/middleware/auth_middleware.py` expune `get_current_user`, folosită cu `Depends(get_current_user)` pe toate rutele protejate (`/api/tryon`, `/api/tryon/{session_id}`, `/api/recommendations`, `/api/tagging` — `/health` și `/api/db-check` rămân publice). Validează token-ul prin `supabase.auth.get_user(token)` și întoarce un `CurrentUser { id, account_type }`. `account_type` vine din `user_metadata` dacă există, altfel dintr-un query pe `profiles.account_type` — schema aplicată (`0001_init_schema.sql`) nu are încă această coloană, așa că se degradează la `"user"` dacă query-ul eșuează, în loc să crape. Dacă header-ul lipsește sau token-ul e invalid/expirat, `HTTPException(401, ...)`.

Testat cu un user real creat temporar via `supabase.auth.admin.create_user` (șters imediat după test) — confirmat: `current_user.id` ajunge corect în `tryon_sessions.user_id`, 401 fără token, 401 cu token invalid, 200/202 cu token valid pe toate cele 4 rute.

---

## 8. Pattern async pentru try-on (generare lentă)

Nu ține requestul HTTP deschis 20-30 de secunde. Flow recomandat, folosind `BackgroundTasks` din FastAPI (suficient pentru MVP; pentru scalare reală se poate trece la o coadă dedicată — Celery/RQ — mai târziu):

1. `POST /api/tryon` → creează un rând `tryon_sessions` (status `processing`) în Supabase, pornește apelul către Hugging Face ca `BackgroundTask` (nu blochează răspunsul), și răspunde imediat cu `sessionId`.
2. Frontend face polling la `GET /api/tryon/{session_id}` la fiecare 2-3 secunde (sau, mai târziu, Supabase Realtime pe tabela `tryon_sessions`).
3. Când task-ul de fundal primește răspunsul de la Hugging Face, actualizează rândul: `status = 'done'`, `result_image_url = ...`, decrementează creditele userului.
4. Dacă apelul eșuează, `status = 'failed'`, frontend-ul afișează eroare + nu se consumă credit.

---

## 9. Credite AI

**Implementat.** Coloana `ai_credits` (int, default 12) există deja pe `profiles` (`0001_init_schema.sql`).

- `src/services/supabase_service.py` expune `get_ai_credits(user_id)` și `decrement_ai_credits(user_id, amount=1)` — restul codului (controllere) folosește doar aceste helper-e, nu mai face query-uri brute pe `profiles`.
- `tryon_controller.create_session` verifică `get_ai_credits(user_id) >= 1` înainte de a crea rândul `tryon_sessions`; dacă nu are credite, ridică `ValueError`, iar `tryon_routes.py` îl transformă în `HTTPException(402, ...)` — try-on-ul nu pornește deloc.
- `tryon_controller.run_and_update` cheamă `decrement_ai_credits` **doar** pe ramura de succes (`status = 'done'`), niciodată pe eșec.
- Notă: `decrement_ai_credits` face read-then-write, nu e atomic — suficient la volumul actual, dar o cerere concurentă pentru același user ar putea "pierde" un decrement. De revizuit cu o funcție RPC Postgres dacă devine relevant.
- Testat cu un user real (creat/șters temporar): 0 credite → `402`, sesiune eșuată → credite neschimbate, `decrement_ai_credits` apelat direct → scade corect.
- Reset periodic/achiziție de credite — logică separată, nu e nevoie acum pentru MVP.

---

## 10. Securitate — reguli obligatorii

- `backend/.env` **niciodată** în git (verifică `.gitignore`).
- CORS configurat strict pe `FRONTEND_ORIGIN` (middleware `CORSMiddleware` din FastAPI) — nu lăsa `*` în producție.
- Cheia `SUPABASE_SERVICE_ROLE_KEY` ocolește RLS — folosește-o doar în backend, niciodată în frontend.
- Toate inputurile validate automat prin modele Pydantic (FastAPI face asta implicit dacă declari body-ul ca model) — nu accepta `dict` liber pe rutele care ajung la Hugging Face/OpenAI.
- **Implementat**: rate-limiting cu `slowapi` pe endpoint-urile care costă bani — `POST /api/tryon`, `POST /api/recommendations`, `POST /api/tagging`, limită `20/oră` per IP (`src/middleware/rate_limiter.py`, keyed pe `get_remote_address` — per user ar necesita decodarea JWT-ului direct în key function-ul lui slowapi, nefăcut încă). Peste limită → `429`. Testat live (limită coborâtă temporar la 2/minut, confirmat `429` la a treia cerere, apoi revenit la 20/oră).

---

## 11. Deployment (notă rapidă)

`backend/` se deployuiește separat de `frontend/` (Railway, Render, Fly.io, sau un VPS), rulat cu `uvicorn src.main:app --host 0.0.0.0 --port $PORT` (sau `gunicorn` cu workeri Uvicorn în producție). Variabilele din `.env` se setează în panoul serviciului de hosting, nu se urcă fișierul `.env` propriu-zis.

---

### Ce ai completat deja
Toate cele 9 variabile din secțiunea 5 au valori reale în `backend/.env` (`MODEL_NAME`, `API_KEY`, `AZURE_ENDPOINT`, `HF_API_KEY`, `HF_TRYON_ENDPOINT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, plus `PORT`/`FRONTEND_ORIGIN` opționale) — verificat printr-un pas de verificare dedicat, `get_missing_config()` nu (mai) semnalează nimic lipsă. Restul (structura de foldere, servicii, rute, auth, credite, rate limiting) e deja implementat — vezi secțiunile 4, 6-10.
