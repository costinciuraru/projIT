# DressCode — Backend Architecture

Backend-ul e stratul din mijloc: frontend-ul (React, `frontend/`) nu vorbește NICIODATĂ direct cu Hugging Face sau cu OpenAI — toate cheile API stau doar aici, server-side, într-un `.env` pe care îl completezi tu manual (nu se comite în git). Backend-ul vorbește și cu Supabase-ul colegului (pentru DB/auth), dar acolo poate merge și direct din frontend pentru citiri simple — detalii mai jos.

---

## 1. De ce avem nevoie de backend (nu doar frontend + Supabase)

Trei motive concrete:

1. **Securitatea cheilor** — un API key de Hugging Face sau de OpenAI (GPT-5 mini) NU trebuie să ajungă niciodată în codul frontend, pentru că orice cheie pusă în React/Vite e vizibilă oricui deschide DevTools. Cheile astea trebuie apelate doar dintr-un server.
2. **Logica de business** — calculul de "câte credite AI mai are userul", validarea inputurilor înainte să dai bani pe un apel către un model plătit, combinarea datelor din Supabase cu răspunsul de la AI.
3. **Generarea de imagini durează** — un try-on poate dura 5-30 secunde. Nu poți ține un request HTTP simplu deschis atât fără riscuri de timeout; ai nevoie de un pattern de job asincron (secțiunea 6).

---

## 2. Stack

- **Node.js + Express** (sau Fastify, dar Express e mai simplu de citit/menținut pentru cineva care vine din frontend), **TypeScript** — ca să fie consistent cu `frontend/`.
- Folder separat `backend/`, la același nivel cu `frontend/` în repo, complet independent (propriul `package.json`, propriul `.env`).
- `@supabase/supabase-js` — pentru citit/scris în DB cu privilegii de server (service role key, diferită de cheia `anon` folosită în frontend).
- `openai` (SDK oficial) — pentru apelurile către GPT-5 mini.
- `node-fetch` / `axios` — pentru apelul către endpoint-ul de Hugging Face (SDK-ul lor oficial e mai orientat spre Python; în Node se apelează de obicei direct REST-ul).

---

## 3. Diagramă de arhitectură (text)

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────────────────┐
│  Frontend   │──HTTP─▶│     Backend       │──HTTP─▶│  Hugging Face Endpoint   │
│  (React,    │        │  (Node/Express)   │        │  (Virtual Try-On model) │
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

## 4. Structura de foldere propusă

```
backend/
├── src/
│   ├── index.ts                  # entry point, pornește serverul Express
│   ├── routes/
│   │   ├── tryon.routes.ts
│   │   ├── recommendations.routes.ts
│   │   └── tagging.routes.ts
│   ├── controllers/
│   │   ├── tryon.controller.ts
│   │   ├── recommendations.controller.ts
│   │   └── tagging.controller.ts
│   ├── services/
│   │   ├── huggingface.service.ts    # tot ce ține de apelul către HF
│   │   ├── openai.service.ts         # tot ce ține de apelul către GPT-5 mini
│   │   └── supabase.service.ts       # client Supabase cu service role key
│   ├── middleware/
│   │   ├── auth.middleware.ts        # verifică JWT-ul Supabase din header
│   │   └── errorHandler.middleware.ts
│   └── config/
│       └── env.ts                    # citește și validează variabilele din .env
├── .env                # NU se comite — îl completezi tu manual
├── .env.example        # se comite, doar cu numele variabilelor, fără valori
├── package.json
└── tsconfig.json
```

---

## 5. Variabile de mediu (`.env`)

Creează `backend/.env` (adaugă-l în `.gitignore`!) după acest șablon. Eu (Claude) las doar `.env.example` cu placeholder-e — tu completezi valorile reale în `.env`.

```bash
# ── Server ─────────────────────────────────────────────
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173   # pentru CORS, ajustezi la URL-ul real în producție

# ── Hugging Face (Virtual Try-On) ─────────────────────
# Endpoint-ul unde e deployuit modelul de try-on (Inference Endpoint dedicat,
# sau URL-ul unui Space, în funcție ce ai ales — vezi nota de mai jos)
HF_API_KEY=
HF_TRYON_ENDPOINT_URL=

# ── OpenAI (GPT-5 mini) ───────────────────────────────
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini

# ── Supabase (server-side, privilegii complete) ───────
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=     # NU e aceeași cu cheia anon din frontend!
```

**Notă despre `HF_TRYON_ENDPOINT_URL`**: dacă folosești un Hugging Face Inference Endpoint dedicat (plătit, cu URL propriu de forma `https://xxxxx.endpoints.huggingface.cloud`), pui URL-ul ăla. Dacă folosești în continuare un Space public (gen `yisol/IDM-VTON`) apelat prin API-ul lui Gradio, pui aici URL-ul de forma `https://yisol-idm-vton.hf.space` și structura de request diferă puțin (rută `/call/tryon` + polling pentru rezultat, cum am discutat anterior) — service-ul `huggingface.service.ts` trebuie scris în funcție de care variantă alegi. Un Inference Endpoint dedicat e mai potrivit pentru producție (fără coadă, fără cooldown de ZeroGPU); Space-ul public rămâne bun pentru MVP/testare.

---

## 6. Endpoint-uri expuse de backend

Toate cer header `Authorization: Bearer <supabase_jwt>` (vezi secțiunea 7), în afară de eventuale health-check-uri.

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

### `GET /api/tryon/:sessionId`
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

Notă de implementare: backend-ul ia din Supabase o listă de outfituri candidate (filtrate grosier pe SQL — buget, tag), apoi trimite lista + profilul userului către GPT-5 mini, care le ordonează/scorează semantic (mood, ocazie). Nu trimiți TOATĂ baza de date la model — doar un set rezonabil de candidați (ex: top 30-50), altfel costă mult și e lent.

### `POST /api/tagging`
Auto-tag la postarea unui outfit nou (userul postează o poză, GPT-5 mini sugerează tag-uri: tip ținută, stil).

Request:
```json
{ "imageUrl": "https://.../outfit-images/new.jpg", "descriptionHint": "opțional, text scris de user" }
```

Response:
```json
{ "suggestedType": "Casual", "suggestedTags": ["denim", "streetwear", "neutral tones"] }
```

### `POST /api/weather-suggestion` (opțional, feature din brief)
Primește locația userului, ia vremea (dintr-un API extern de weather — nu e discutat încă, trebuie ales separat), trimite contextul la GPT-5 mini care sugerează tip de ținută potrivit.

---

## 7. Autentificare (middleware)

Frontend-ul trimite la fiecare request către backend header-ul:
```
Authorization: Bearer <access_token de la Supabase Auth>
```

`auth.middleware.ts` validează token-ul (fie prin `supabase.auth.getUser(token)`, fie verificând JWT-ul cu secretul de la Supabase) și atașează `req.user = { id, accountType }`. Orice endpoint de mai sus refuză requestul cu 401 dacă nu există user valid — asta îți dă și cine trebuie taxat pentru credite AI, cine e proprietarul sesiunii de try-on etc.

---

## 8. Pattern async pentru try-on (generare lentă)

Nu ține requestul HTTP deschis 20-30 de secunde. Flow recomandat:

1. `POST /api/tryon` → backend creează un rând `tryon_sessions` (status `processing`) în Supabase, pornește apelul către Hugging Face **fără să aștepte** (fire-and-forget cu update la final), și răspunde imediat cu `sessionId`.
2. Frontend face polling la `GET /api/tryon/:sessionId` la fiecare 2-3 secunde (sau, mai elegant mai târziu, Supabase Realtime pe tabela `tryon_sessions` — dar polling e suficient pentru MVP).
3. Când răspunsul de la Hugging Face vine, backend actualizează rândul: `status = 'done'`, `result_image_url = ...`, decrementează creditele userului.
4. Dacă apelul eșuează (timeout, eroare model), `status = 'failed'`, iar frontend-ul afișează eroare + nu consumă credit.

---

## 9. Credite AI

Din mockup: „AI Credits: 12” afișat în UI la Try-On. Regulă simplă de implementat:

- Coloană `ai_credits` (int) pe `profiles` (adaugă-o în schema Supabase, dacă nu există deja).
- Înainte de a porni un try-on, backend verifică `ai_credits > 0`; dacă nu, răspunde 402/403 cu mesaj clar.
- La `status = 'done'`, decrementezi cu 1 (sau cu costul real, dacă diferă pe tip de generare).
- Reset periodic (lunar) sau achiziție de credite — logică separată, nu e nevoie acum pentru MVP.

---

## 10. Securitate — reguli obligatorii

- `backend/.env` **niciodată** în git (verifică `.gitignore`).
- CORS configurat strict pe `FRONTEND_ORIGIN` — nu lăsa `*` în producție.
- Cheia `SUPABASE_SERVICE_ROLE_KEY` are acces complet la DB, ocolind RLS — folosește-o doar în backend, niciodată în frontend.
- Validează toate input-urile primite (`zod` e o alegere bună în Express+TS) înainte să le trimiți mai departe la Hugging Face/OpenAI — eviți costuri inutile din requesturi malformate.
- Rate-limiting pe IP/user (`express-rate-limit`) ca să nu se poată abuza de endpoint-urile care costă bani (try-on, recomandări).

---

## 11. Deployment (notă rapidă)

`backend/` se deployuiește separat de `frontend/` (ex: Railway, Render, Fly.io, sau un VPS) — nu pe același hosting static ca frontend-ul (React build-uit e doar fișiere statice, nu poate rula un server Node). Variabilele din `.env` se setează în panoul serviciului de hosting, nu se urcă fișierul `.env` propriu-zis.

---

### Ce completezi tu manual
În `backend/.env`, valorile pentru: `HF_API_KEY`, `HF_TRYON_ENDPOINT_URL`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`. Restul (structura de foldere, servicii, rute) i-l dai ca prompt lui Claude din VSCode să-l scaffold-eze conform documentului ăsta.
