This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Which home page you get

`/` renders one of two components depending on `PRE_LAUNCH_ENABLED`:

| Flag | Component | Where |
| --- | --- | --- |
| `true` | `components/launch/LaunchHome` — the founding-circle microsite | production, preview, and local dev |
| `false` | `components/marketing/MarketingHome` — the post-launch landing page | not currently deployed anywhere |

`.env.development.local` sets it to `true` so local dev matches production. If
you ever see "Serious marriage deserves a better beginning" instead of "For the
legacy you carry", the flag is off and you're looking at the wrong page.

### Turbopack is disabled locally on Windows

`npm run dev` and `npm run build:local` both use **webpack**, not Turbopack.
That is deliberate. On this Windows checkout Turbopack fails two ways:

**Dev** panicked continuously with `Failed to write app endpoint /signup/page`,
ending in `Next.js package not found`. Each panic crashed the compiler and
forced a browser reload — roughly one per second, which made the dev server
unusable and any performance measurement meaningless.

**Build** died on symlink creation for the packages in `serverExternalPackages`:

```
Error: create symlink to ../../node_modules/@prisma/instrumentation
Caused by: A required privilege is not held by the client. (os error 1314)
```

Both trace back to the environment, not the code:

1. **The project path contains a space and a leading digit** —
   `E:\7. matrimony\pravara`. Turbopack's module resolution is known to break on
   Windows paths like this, which is what produces "Next.js package not found".
   Moving the checkout to something like `E:\projects\pravara` is the real fix
   and would likely restore Turbopack for both dev and build.
2. **Developer Mode is off**, so the process lacks the symlink privilege.
   Settings → System → For developers → Developer Mode → On.

Once either is addressed, try `npm run dev:turbo`; if it runs clean, switch the
`dev` script back to plain `next dev`.

**Vercel is unaffected** — it builds on Linux, and `npm run build` (Turbopack) is
still what production uses. Do not add `--webpack` to the `build` script.

To serve a production build locally the way production serves it:

```bash
npm run build:local && npm run start:prelaunch
```

Plain `npm run start` runs in production mode, which does **not** read
`.env.development.local` — so the pre-launch flag falls back to `false` in
`.env.local` and you get the wrong home page. `start:prelaunch` sets it
explicitly.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
