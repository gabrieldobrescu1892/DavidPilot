# TypeScript build fix

The previous package used `"typescript": "latest"`, which resolved to TypeScript 7.
Next.js 16.2.12 attempted to use the TypeScript compiler API and stopped because TypeScript 7 does not expose the required API in the same way.

This repository pins:

```json
"typescript": "5.9.3"
```

After pushing the files:

1. Open Vercel Deployments.
2. Redeploy the latest commit.
3. Disable **Use existing Build Cache** if that option is shown.

No application code or Cal.com integration was removed.
