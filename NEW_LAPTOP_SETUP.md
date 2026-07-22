# Moving Halesah Car Hub to a New Laptop

Follow these steps in order. This file travels with the project folder, so you can open it on the new laptop even without internet access.

---

## 1. On this laptop — prepare the files to copy

### 1a. Export the database
A copy of the project folder does **not** include your real data (users, listings, sellers, reviews) — that lives inside PostgreSQL's own storage, not in a file. Export it first:

```
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U galimoto -d galimoto_hub -F c -f galimoto_hub.dump
```

Run this from inside the project folder. It will prompt for the `galimoto` user's password (`galimoto`). This creates `galimoto_hub.dump` right in the project folder, so it gets copied along with everything else in step 1b.

*(This has already been done once — check the project folder for `galimoto_hub.dump`. Re-run the command above if you've made changes since and want the latest data.)*

### 1b. Copy the project folder to USB
Copy the whole folder:
```
C:\Users\Harrison Kamanga\Documents\harrison\FULL  WEBSITE  CODE\
```

**Keep these** (easy to miss, required):
- `.env` — database connection string and secrets. **Without this the app won't start.**
- `public/uploads/` — your real listing photos and videos.
- `backups/` — Developer Panel config snapshots.
- `package-lock.json` — keeps dependency versions identical.
- `galimoto_hub.dump` — the database export from step 1a.

**Skip these to save space and time** (safe to leave behind):
- `node_modules/` — reinstalled fresh with `npm install` on the new laptop.
- `.next/` — build cache, regenerates automatically.
- `.git/` — only needed if you want commit history on the new laptop.
- Loose root-level image files (`Alto.jpg`, `BMW.webp`, etc.) and `CARS IMAGES/` — leftover reference photos, not used by the running app.
- `docker-compose.yml` — leftover from early setup; you run PostgreSQL natively, not via Docker.

---

## 2. On the new laptop — install prerequisites

1. **Node.js** (v20 or later) — [nodejs.org](https://nodejs.org). npm comes bundled.
2. **PostgreSQL** (v14+) — [postgresql.org](https://www.postgresql.org/download/windows/). During install, set and remember a password for the `postgres` superuser.
3. **Git** (optional, only if you didn't copy `.git/` and want version control) — [git-scm.com](https://git-scm.com/).

---

## 3. Copy the project off the USB
Paste the folder anywhere convenient, e.g. `C:\Users\<you>\Documents\halesah-car-hub\`.

---

## 4. Create the database
Open the **SQL Shell (psql)** app (installed with PostgreSQL) or run `psql` from a terminal, log in as `postgres`, then run:

```sql
CREATE USER galimoto WITH PASSWORD 'galimoto';
CREATE DATABASE galimoto_hub OWNER galimoto;
```

---

## 5. Restore your data
From the project folder:

```
"C:\Program Files\PostgreSQL\17\bin\pg_restore.exe" -U galimoto -d galimoto_hub "galimoto_hub.dump"
```

(Check `C:\Program Files\PostgreSQL\` on the new laptop for the actual installed version number if it's not 17, and adjust the path.) It will prompt for the `galimoto` password (`galimoto`).

---

## 6. Check `.env`
Open `.env` in the project folder and confirm it has:

```
DATABASE_URL="postgresql://galimoto:galimoto@localhost:5432/galimoto_hub?schema=public"
SESSION_SECRET="<a long random string>"
OTP_PROVIDER="console"
OTP_ENCRYPTION_KEY="<a 64-character hex string>"
```

If `.env` didn't make it over for some reason, copy `.env.example` to `.env` and fill these in yourself. `SESSION_SECRET` and `OTP_ENCRYPTION_KEY` should each be a random 64-character hex string — generate one with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
(run once for each — they must be different from one another).

---

## 7. Install and run

From the project folder:

```
npm install
npx prisma generate
npm run dev
```

Open `http://localhost:3000` in a browser. You should see the site with all your existing listings, users, and reviews restored.

---

## Troubleshooting

- **App won't start / database errors** → check `.env` exists and `DATABASE_URL` matches the user/database you created in step 4.
- **Images broken on listing pages** → `public/uploads/` didn't come across in the copy; go back and copy it from the old laptop.
- **OTP codes not arriving anywhere** → expected with `OTP_PROVIDER="console"` — codes print to the terminal running `npm run dev`. Configure a real provider later from the Developer Panel → OTP Configuration.
- **`pg_restore` errors about existing objects** → the database already has tables in it (e.g. from `prisma migrate`/`db:seed` running first). Either restore into a freshly created empty database, or drop and recreate it first:
  ```sql
  DROP DATABASE galimoto_hub;
  CREATE DATABASE galimoto_hub OWNER galimoto;
  ```
  then re-run the `pg_restore` command.
