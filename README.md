# Daymark

A small, responsive React task manager with Supabase email/password authentication and user-scoped tasks.

## Run locally

```sh
npm install
cp .env.example .env.local
```

Add your Supabase anon/publishable key as `VITE_SUPABASE_ANON_KEY` in `.env.local`, run the SQL setup below, then start the app:

```sh
npm run dev
```

The project URL is already configured as `https://phphsunfaieswrsuavoc.supabase.co`. The app also accepts the `/rest/v1/` URL format and normalizes it for the Supabase JavaScript client. You can change the URL in `.env.local` if needed. Restart Vite after changing environment values.

## Supabase table

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor to create the `public.tasks` table and authenticated, per-user row-level security policies expected by the app. Registration stores the username in Supabase Auth user metadata; email/password are managed by Supabase Auth. If email confirmation is enabled in your Supabase Auth settings, users must confirm their email before signing in.

The schema removes the old public task policies and adds a `user_id` column. Existing tasks are not deleted, but old rows without an owner will not be visible under the new policies. Back up or assign any legacy rows before applying this change if they need to be retained.

Tasks are also cached in browser local storage under a user-specific key. If task sync becomes unavailable, the signed-in user can continue working with their local cache.
