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

Ai completat deja `backend/.env` cu valorile reale — șablonul de mai jos e doar referința de nume, ca să confirmi că `config.py` citește exact aceste chei (dacă la tine numele diferă puțin, aliniază `config.py` la ce ai deja, nu invers).

```bash
# ── Server ─────────────────────────────────────────────
PORT=8000
FRONTEND_ORIGIN=http://localhost:5173   # pentru CORS, ajustezi la URL-ul real în producție

# ── Hugging Face (Virtual Try-On) ─────────────────────
HF_API_KEY=
HF_TRYON_ENDPOINT_URL=

# ── OpenAI (GPT-5 mini) ───────────────────────────────
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini

# ── Supabase (server-side, privilegii complete) ───────
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=     # NU e aceeași cu cheia anon din frontend!
```

**Notă despre `HF_TRYON_ENDPOINT_URL`**: dacă e un Hugging Face Inference Endpoint dedicat (URL de forma `https://xxxxx.endpoints.huggingface.cloud`), `huggingface_service.py` face un POST simplu, sincron, cu `Authorization: Bearer <HF_API_KEY>`. Dacă e un Space public (URL de forma `https://<user>-<space>.hf.space`), implementarea trebuie să folosească pattern-ul de queue al Gradio (POST la `/call/<api_name>`, apoi poll pe `event_id`) — vezi secțiunea 6.

---

## 6. Endpoint-uri expuse de backend

Toate cer, pe termen lung, header `Authorization: Bearer <supabase_jwt>` (vezi secțiunea 7) — **momentan** `/api/tryon` cere în schimb un placeholder simplu, header `X-User-Id: <uuid din profiles>`, până se implementează auth-ul real. `/health` și `GET /api/db-check` (verifică rapid conexiunea la Supabase, query pe `profiles`) nu cer nimic.

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

**Stare actuală (placeholder):** `src/middleware/auth_middleware.py` expune `get_current_user_id`, folosită cu `Depends(get_current_user_id)` în `tryon_routes.py` — citește pur și simplu header-ul `X-User-Id` și îl trimite ca atare, fără nicio verificare. E doar cât să meargă fluxul cap-coadă înainte să existe auth real; nu oferă nicio garanție de securitate (oricine poate pretinde orice `user_id`).

**Țintă (de implementat):** frontend-ul trimite la fiecare request header-ul:
```
Authorization: Bearer <access_token de la Supabase Auth>
```

`get_current_user_id` (sau o nouă `get_current_user`) va valida token-ul prin `supabase.auth.get_user(token)` și va întoarce `{ id, account_type }` real. Dacă token-ul lipsește sau e invalid, FastAPI răspunde automat 401 (via `HTTPException`).

---

## 8. Pattern async pentru try-on (generare lentă)

Nu ține requestul HTTP deschis 20-30 de secunde. Flow recomandat, folosind `BackgroundTasks` din FastAPI (suficient pentru MVP; pentru scalare reală se poate trece la o coadă dedicată — Celery/RQ — mai târziu):

1. `POST /api/tryon` → creează un rând `tryon_sessions` (status `processing`) în Supabase, pornește apelul către Hugging Face ca `BackgroundTask` (nu blochează răspunsul), și răspunde imediat cu `sessionId`.
2. Frontend face polling la `GET /api/tryon/{session_id}` la fiecare 2-3 secunde (sau, mai târziu, Supabase Realtime pe tabela `tryon_sessions`).
3. Când task-ul de fundal primește răspunsul de la Hugging Face, actualizează rândul: `status = 'done'`, `result_image_url = ...`, decrementează creditele userului.
4. Dacă apelul eșuează, `status = 'failed'`, frontend-ul afișează eroare + nu se consumă credit.

---

## 9. Credite AI

Din mockup: „AI Credits: 12” afișat în UI la Try-On.

- Coloană `ai_credits` (int) pe `profiles` (adaugă-o în schema Supabase, dacă nu există deja).
- Înainte de a porni un try-on, backend verifică `ai_credits > 0`; dacă nu, răspunde 402 cu mesaj clar.
- La `status = 'done'`, decrementezi cu 1 (sau cu costul real, dacă diferă pe tip de generare).
- Reset periodic/achiziție de credite — logică separată, nu e nevoie acum pentru MVP.

---

## 10. Securitate — reguli obligatorii

- `backend/.env` **niciodată** în git (verifică `.gitignore`).
- CORS configurat strict pe `FRONTEND_ORIGIN` (middleware `CORSMiddleware` din FastAPI) — nu lăsa `*` în producție.
- Cheia `SUPABASE_SERVICE_ROLE_KEY` ocolește RLS — folosește-o doar în backend, niciodată în frontend.
- Toate inputurile validate automat prin modele Pydantic (FastAPI face asta implicit dacă declari body-ul ca model) — nu accepta `dict` liber pe rutele care ajung la Hugging Face/OpenAI.
- Rate-limiting (`slowapi`) pe endpoint-urile care costă bani (try-on, recomandări, tagging).

---

## 11. Deployment (notă rapidă)

`backend/` se deployuiește separat de `frontend/` (Railway, Render, Fly.io, sau un VPS), rulat cu `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (sau `gunicorn` cu workeri Uvicorn în producție). Variabilele din `.env` se setează în panoul serviciului de hosting, nu se urcă fișierul `.env` propriu-zis.

---

### Ce ai completat deja
`HF_API_KEY`, `HF_TRYON_ENDPOINT_URL`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` — toate în `backend/.env`. Restul (structura de foldere, servicii, rute) e ce urmează să scaffold-uiască Claude din VSCode conform documentului ăsta, pe stack Python/FastAPI.
