# AI Copy Studio setup

## Branch
Use a dedicated branch such as:

`feature/ai-copy-studio`

## 1. Run the Supabase migration

Open Supabase → SQL Editor and run:

`supabase/migrations/20260803_copy_studio.sql`

This creates the `copy_drafts` table.

## 2. Vercel environment variable

Optional, recommended:

`OPENAI_COPY_MODEL=gpt-5-mini`

If omitted, the app falls back to `OPENAI_CHAT_MODEL`, then `gpt-5-mini`.

## 3. Test

1. Open the branch Preview deployment.
2. Sign in at `/admin`.
3. Select **AI Copy Studio**.
4. Generate an English LinkedIn post.
5. Generate and save a Romanian sales email.
6. Confirm `/api/admin/copy` returns 200.
7. Confirm saved drafts appear in Supabase `copy_drafts` and in Recent drafts.

The API is protected by the existing admin session cookie.
