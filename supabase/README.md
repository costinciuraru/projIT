# Supabase setup

The project uses one shared Supabase project. Everyone points at the same
instance — nobody creates their own project.

The schema follows [`dresscode-db-frontend-contract.md`](../dresscode-db-frontend-contract.md)
at the repo root — that's the source of truth for table/column names. If you
change the schema, update that doc's mapping table too.

## Applying the schema (one person needs to do this once)

Run these in order in the Supabase Dashboard → **SQL Editor**:

1. [`migrations/0003_rebuild_per_contract.sql`](migrations/0003_rebuild_per_contract.sql)
2. [`migrations/0004_rls_policies.sql`](migrations/0004_rls_policies.sql)
3. [`migrations/0005_nearby_stores_cache.sql`](migrations/0005_nearby_stores_cache.sql)

`0001_init_schema.sql` and `0002_rls_policies.sql` are an earlier draft made
before the contract doc existed — **do not run them**, they're kept only for
history (0003 already drops anything they created).

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
