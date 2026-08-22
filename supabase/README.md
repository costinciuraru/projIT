# Supabase setup

The project already has one shared Supabase project. Everyone points at the
same instance — nobody creates their own project.

## Applying the schema (one person needs to do this once)

1. Open the project on [supabase.com](https://supabase.com/dashboard) → **SQL Editor**.
2. Paste and run [`migrations/0001_init_schema.sql`](migrations/0001_init_schema.sql).
3. Paste and run [`migrations/0002_rls_policies.sql`](migrations/0002_rls_policies.sql).

Whoever changes the schema later adds a new `NNNN_description.sql` file here
(numbered after the last one) instead of editing an old file, and everyone
else re-runs just the new file in the SQL Editor after pulling.

## Frontend setup (everyone, after pulling this branch)

```bash
cd frontend
cp .env.example .env.local
```

Fill in `.env.local` with the values from **Project Settings → API** in the
Supabase dashboard:

- `VITE_SUPABASE_URL` — the Project URL
- `VITE_SUPABASE_ANON_KEY` — the `anon` / `publishable` key (safe to use client-side)

`.env.local` is gitignored — never commit it, and never put the `service_role`
key here (that one belongs only in `backend/.env`, see `backend_architecture.md`).

The frontend client lives at `frontend/src/lib/supabaseClient.ts` — import
`supabase` from there wherever you need to read/write directly from React.
