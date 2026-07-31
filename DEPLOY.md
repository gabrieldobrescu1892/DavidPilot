# Deploying DavidPilot V3

The GitHub repository root must contain these entries directly:

- `app/`
- `components/`
- `lib/`
- `public/`
- `package.json`
- `next.config.ts`
- `tsconfig.json`

Do not upload only the contents of the `app/` directory.

## Replace the repository from a local clone

1. Extract this ZIP.
2. Copy all files and folders from `DavidPilot-V3-Fixed/` into the root of your local GitHub repository.
3. Keep your existing `.git/` directory and `.env.local` file.
4. Commit and push:

```bash
git add .
git commit -m "Fix Next.js project structure and deploy DavidPilot V3"
git push
```

In Vercel, leave **Root Directory** empty or set it to `.`. The framework preset should be **Next.js**.
