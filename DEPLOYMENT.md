# Deploying Halesah Car Hub

This file lives in the project folder so it travels with you wherever you copy the code. It covers what's needed to deploy on 10 different hosting providers.

---

## The one thing that decides everything: file storage

This app uploads listing photos and videos to **Vercel Blob** (see `src/app/api/uploads/route.ts` and `src/app/api/uploads/video/route.ts`) — object storage, not local disk. That means uploads work identically on every host below, ephemeral filesystem or not, as long as `BLOB_READ_WRITE_TOKEN` is set. No volumes or persistent disks to configure anymore.

Get a token from any Vercel account (a Blob store doesn't require hosting the app on Vercel itself): Storage → Blob → Create Store, then copy the `BLOB_READ_WRITE_TOKEN`. It's part of the universal env var list below.

---

## Universal requirements (every host needs these)

- **Node.js 18.17+** (20+ recommended)
- **A PostgreSQL database** — either the host's own managed Postgres, or an external one (Neon, Supabase both have free tiers and work from anywhere)
- **Environment variables**, set in the host's dashboard/CLI (never commit these to git):
  | Variable | Value |
  |---|---|
  | `DATABASE_URL` | `postgresql://user:password@host:5432/dbname?schema=public` — from your Postgres provider |
  | `SESSION_SECRET` | random 64-char hex — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
  | `OTP_ENCRYPTION_KEY` | same command, run again for a **different** value |
  | `OTP_PROVIDER` | `console` (fine to leave — configure real SMS/email providers later from Developer Panel → OTP Configuration) |
  | `BLOB_READ_WRITE_TOKEN` | from a Vercel Blob store (Storage → Blob in any Vercel account) — required for photo/video uploads |
- **Build command:** `npm run build` (already runs `prisma generate` first)
- **Start command:** `npm run start` (Next.js listens on `$PORT` automatically if the host sets it; defaults to 3000)
- **After first deploy, run once** against the production database (from your own machine, pointed at the production `DATABASE_URL`, or via the host's shell/console):
  ```
  npx prisma migrate deploy
  ```
  This creates all the tables. `npm run db:seed` afterward is optional (adds sample brands/listings).

---

## 1. A plain VPS (DigitalOcean, Linode, Vultr, AWS Lightsail, etc.)
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`).

Most manual option, full control:
1. Spin up an Ubuntu droplet/instance.
2. Install Node.js, PostgreSQL (or point at a managed DB elsewhere), and a process manager (`pm2` recommended).
3. `git clone` your repo (or `scp` the files), `npm install`, set up `.env`, `npx prisma migrate deploy`.
4. `pm2 start npm --name galimoto -- run start`, then put Nginx in front of it as a reverse proxy for port 80/443 + SSL (Certbot for a free cert).
5. Point your domain's DNS A record at the server's IP.

---

## 2. Railway
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`) — no volume needed.

1. New Project → Deploy from GitHub repo.
2. Add a PostgreSQL plugin (gives you `DATABASE_URL` automatically).
3. Add the env vars in the Variables tab.
4. Railway auto-detects `npm run build` / `npm run start`.

---

## 3. Render
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`) — works on the free tier too.

1. New → Web Service, connect the repo.
2. Add a Render PostgreSQL instance (or paste an external `DATABASE_URL`).
3. Set env vars in the Environment tab.
4. Build command `npm run build`, start command `npm run start`.

---

## 4. Fly.io
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`) — no volume needed.

1. `fly launch` in the project directory (it generates a `fly.toml` — review the detected Node/Next settings).
2. `fly postgres create` for a database, then `fly postgres attach` to wire up `DATABASE_URL`.
3. `fly secrets set SESSION_SECRET=... OTP_ENCRYPTION_KEY=... BLOB_READ_WRITE_TOKEN=...`
4. `fly deploy`.

---

## 5. Vercel
**Storage:** ✅ Vercel Blob — the most natural fit, since a Blob store lives in the same dashboard.

1. Import the GitHub repo in the Vercel dashboard.
2. Add a Postgres database — Vercel Postgres, or an external one (Neon works well since it's also serverless-friendly).
3. Add a Blob store under Storage → Blob, then copy its `BLOB_READ_WRITE_TOKEN` into Project Settings → Environment Variables (or run `vercel env pull` locally after linking — this also pulls it into `.env` automatically).
4. Add the other env vars in Project Settings → Environment Variables.
5. Vercel auto-detects Next.js; build/start commands aren't needed manually.
6. Run `npx prisma migrate deploy` locally against the production `DATABASE_URL` once (or via a one-off Vercel CLI command).

---

## 6. Netlify
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`).

1. Import the repo, Netlify detects Next.js via its official adapter (`@netlify/plugin-nextjs` gets added automatically).
2. Add env vars in Site Settings → Environment Variables.
3. External Postgres required (Netlify has no built-in database) — Neon or Supabase.
4. Build command `npm run build`; Netlify handles the rest via its Next.js runtime.

---

## 7. Cloudflare Pages / Workers
**Storage:** ✅ Vercel Blob is fine here too, but this one needs more than that — Cloudflare's runtime is edge-based, not standard Node.js. Prisma needs a special driver adapter (`@prisma/adapter-d1` or the Postgres edge driver) and some server-only Node APIs used elsewhere in this codebase may need adjustment. This is the most involved option on this list — expect real porting work, not just config.

Only pursue this one if you specifically want Cloudflare's edge network; otherwise a different option here will get you running faster.

---

## 8. AWS Amplify Hosting
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`).

1. Connect the GitHub repo in the Amplify console; it detects Next.js SSR automatically.
2. Add env vars in App Settings → Environment Variables.
3. Use Amazon RDS for PostgreSQL, or an external managed Postgres.

---

## 9. Google Cloud Run
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`).

1. `gcloud builds submit` or connect the repo via Cloud Build triggers to build a container image.
2. Cloud Run needs a `Dockerfile` — Next.js supports `output: "standalone"` in `next.config.mjs` to produce a minimal container-ready build; this would need to be added.
3. Use Cloud SQL for PostgreSQL (connect via the Cloud SQL Auth Proxy or a direct connection string).
4. Set env vars as Cloud Run service variables/secrets.

---

## 10. Heroku
**Storage:** ✅ Vercel Blob (set `BLOB_READ_WRITE_TOKEN`).

1. `heroku create`, add the Heroku Postgres add-on (`heroku addons:create heroku-postgresql`).
2. `heroku config:set SESSION_SECRET=... OTP_ENCRYPTION_KEY=... OTP_PROVIDER=console BLOB_READ_WRITE_TOKEN=...`.
3. Heroku's Node buildpack runs `npm run build` automatically; add a `Procfile` with `web: npm run start`.
4. `git push heroku main`, then `heroku run npx prisma migrate deploy`.

---

## Quick recommendation

- **Want the least setup work right now?** → Railway or Fly.io, both have simple built-in Postgres, and uploads just need `BLOB_READ_WRITE_TOKEN` like everywhere else.
- **Want to stay closest to "how Next.js is meant to run"?** → Vercel — the Blob store lives in the same dashboard.
- **Want full control / already comfortable with servers?** → a plain VPS.
- **Avoid Cloudflare Pages/Workers** unless you specifically need edge deployment — it's the most work of everything on this list for this particular codebase.
