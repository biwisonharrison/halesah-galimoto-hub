# Deploying Halesah Car Hub

This file lives in the project folder so it travels with you wherever you copy the code. It covers what's needed to deploy on 10 different hosting providers.

---

## The one thing that decides everything: file storage

This app currently saves uploaded listing photos and videos straight to disk, in `public/uploads/` (see `src/app/api/uploads/route.ts` and `src/app/api/uploads/video/route.ts`). That only works if the server's filesystem is **persistent** between requests and deploys.

| Storage type | What it means for you |
|---|---|
| **Persistent disk** | Works with no code changes. |
| **Ephemeral / serverless filesystem** | Uploads will appear to succeed, then vanish (broken images) on the next request, restart, or deploy. **Needs a code change first** — swapping the upload routes to S3-compatible object storage (AWS S3, Cloudflare R2, Vercel Blob, Backblaze B2, etc.). Ask me to do this before deploying to one of these hosts. |

Each provider below is labeled accordingly.

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
- **Build command:** `npm run build` (already runs `prisma generate` first)
- **Start command:** `npm run start` (Next.js listens on `$PORT` automatically if the host sets it; defaults to 3000)
- **After first deploy, run once** against the production database (from your own machine, pointed at the production `DATABASE_URL`, or via the host's shell/console):
  ```
  npx prisma migrate deploy
  ```
  This creates all the tables. `npm run db:seed` afterward is optional (adds sample brands/listings).

---

## 1. A plain VPS (DigitalOcean, Linode, Vultr, AWS Lightsail, etc.)
**Storage:** ✅ Persistent — works as-is.

Most manual option, full control:
1. Spin up an Ubuntu droplet/instance.
2. Install Node.js, PostgreSQL (or point at a managed DB elsewhere), and a process manager (`pm2` recommended).
3. `git clone` your repo (or `scp` the files), `npm install`, set up `.env`, `npx prisma migrate deploy`.
4. `pm2 start npm --name galimoto -- run start`, then put Nginx in front of it as a reverse proxy for port 80/443 + SSL (Certbot for a free cert).
5. Point your domain's DNS A record at the server's IP.

---

## 2. Railway
**Storage:** ✅ Persistent, but only if you attach a volume.

1. New Project → Deploy from GitHub repo.
2. Add a PostgreSQL plugin (gives you `DATABASE_URL` automatically).
3. In the service's Settings → Volumes, mount a volume at `/app/public/uploads` (otherwise uploads are ephemeral even though the rest of the container feels persistent).
4. Add the other env vars in the Variables tab.
5. Railway auto-detects `npm run build` / `npm run start`.

---

## 3. Render
**Storage:** ✅ Persistent disk available on paid instance types (not the free tier).

1. New → Web Service, connect the repo.
2. Add a Render PostgreSQL instance (or paste an external `DATABASE_URL`).
3. Under the web service's Disks, add a persistent disk mounted at `public/uploads`.
4. Set env vars in the Environment tab.
5. Build command `npm run build`, start command `npm run start`.

---

## 4. Fly.io
**Storage:** ✅ Persistent via Fly Volumes.

1. `fly launch` in the project directory (it generates a `fly.toml` — review the detected Node/Next settings).
2. `fly postgres create` for a database, then `fly postgres attach` to wire up `DATABASE_URL`.
3. `fly volumes create galimoto_uploads --size 1` then mount it at `/app/public/uploads` in `fly.toml`.
4. `fly secrets set SESSION_SECRET=... OTP_ENCRYPTION_KEY=...`
5. `fly deploy`.

---

## 5. Vercel
**Storage:** ❌ Ephemeral — **needs the upload-storage code change first.** Vercel is otherwise an excellent fit for Next.js (built by the same company), but every serverless function invocation gets a fresh, read-only-except-`/tmp` filesystem.

Once uploads are moved to Vercel Blob or S3-compatible storage:
1. Import the GitHub repo in the Vercel dashboard.
2. Add a Postgres database — Vercel Postgres, or an external one (Neon works well since it's also serverless-friendly).
3. Add the env vars in Project Settings → Environment Variables.
4. Vercel auto-detects Next.js; build/start commands aren't needed manually.
5. Run `npx prisma migrate deploy` locally against the production `DATABASE_URL` once (or via a one-off Vercel CLI command).

---

## 6. Netlify
**Storage:** ❌ Ephemeral — same constraint as Vercel, needs the object-storage change first.

1. Import the repo, Netlify detects Next.js via its official adapter (`@netlify/plugin-nextjs` gets added automatically).
2. Add env vars in Site Settings → Environment Variables.
3. External Postgres required (Netlify has no built-in database) — Neon or Supabase.
4. Build command `npm run build`; Netlify handles the rest via its Next.js runtime.

---

## 7. Cloudflare Pages / Workers
**Storage:** ❌ Ephemeral, and this one needs more than just the storage swap — Cloudflare's runtime is edge-based, not standard Node.js. Prisma needs a special driver adapter (`@prisma/adapter-d1` or the Postgres edge driver) and some server-only Node APIs used elsewhere in this codebase may need adjustment. This is the most involved option on this list — expect real porting work, not just config.

Only pursue this one if you specifically want Cloudflare's edge network; otherwise a different option here will get you running faster.

---

## 8. AWS Amplify Hosting
**Storage:** ❌ Ephemeral for the SSR compute layer — needs the object-storage change (pairs naturally with S3, which Amplify integrates with directly).

1. Connect the GitHub repo in the Amplify console; it detects Next.js SSR automatically.
2. Add env vars in App Settings → Environment Variables.
3. Use Amazon RDS for PostgreSQL, or an external managed Postgres.
4. Once uploads point at S3, grant the Amplify service role S3 read/write permissions.

---

## 9. Google Cloud Run
**Storage:** ❌ Ephemeral container filesystem — needs the object-storage change (pair with Google Cloud Storage).

1. `gcloud builds submit` or connect the repo via Cloud Build triggers to build a container image.
2. Cloud Run needs a `Dockerfile` — Next.js supports `output: "standalone"` in `next.config.mjs` to produce a minimal container-ready build; this would need to be added.
3. Use Cloud SQL for PostgreSQL (connect via the Cloud SQL Auth Proxy or a direct connection string).
4. Set env vars as Cloud Run service variables/secrets.

---

## 10. Heroku
**Storage:** ❌ Ephemeral (dyno filesystem resets on every restart/deploy) — needs the object-storage change (pairs well with Heroku's S3 add-ons like Bucketeer).

1. `heroku create`, add the Heroku Postgres add-on (`heroku addons:create heroku-postgresql`).
2. `heroku config:set SESSION_SECRET=... OTP_ENCRYPTION_KEY=... OTP_PROVIDER=console`.
3. Heroku's Node buildpack runs `npm run build` automatically; add a `Procfile` with `web: npm run start`.
4. `git push heroku main`, then `heroku run npx prisma migrate deploy`.

---

## Quick recommendation

- **Want the least setup work right now, no code changes?** → Railway or Fly.io (attach a volume for uploads, both have simple built-in Postgres).
- **Want to stay closest to "how Next.js is meant to run" and don't mind swapping storage first?** → Vercel.
- **Want full control / already comfortable with servers?** → a plain VPS.
- **Avoid Cloudflare Pages/Workers** unless you specifically need edge deployment — it's the most work of everything on this list for this particular codebase.

If you pick one of the ❌ options, tell me which one and I'll make the object-storage code change before you deploy — it's a contained change (two upload routes plus a few display paths), not a rewrite.
