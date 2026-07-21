# Galimoto Hub

Malawi's online home for cars. Look up any model's history and fair price, buy or sell used cars, and browse a
full brand catalogue (including classics). Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma and
PostgreSQL.

## Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (LTS recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Postgres), or your own PostgreSQL instance

## Setup

```bash
npm install

# start a local Postgres in Docker
docker compose up -d

cp .env.example .env
# edit .env if you're not using the default docker-compose credentials

npx prisma migrate dev --name init
npm run db:seed

npm run dev
```

Visit http://localhost:3000.

## Logging in during development

Auth is phone number + OTP, no password. In development the OTP provider is `console` (see `.env.example`), so the
6 digit code is printed in the terminal running `npm run dev` instead of being sent by SMS. Enter any Malawian style
number (e.g. `0991 234 567`) on the login page, then copy the code from the terminal.

Seed data includes a few demo accounts you can log into directly:

| Phone           | Role   |
|-----------------|--------|
| +265991000000   | Admin  |
| +265991000001   | Buyer  |
| +265991000002   | Buyer (owns some seed listings) |
| +265991000003   | Dealer (Blantyre Motors, verified) |

## Project structure

- `src/app`: routes (App Router)
- `src/components`: shared UI
- `src/lib`: Prisma client, session/auth, OTP, formatting helpers
- `prisma/schema.prisma`: data model
- `prisma/seed.ts`: sample brands, models, districts, users and listings

## Known placeholders to swap before real launch

- **Photo storage** (`src/app/api/uploads/route.ts`) writes to the local filesystem (`public/uploads`). Fine for a
  single server deployment; switch to S3 compatible object storage for serverless/multi instance hosting.
- **OTP delivery** (`src/lib/otp.ts`) logs to the console. Swap `deliverOtp` for a real SMS gateway (Airtel/TNM
  aggregator, e.g. PayChangu) before launch.
- **Payments** (listing boosts, dealer subscriptions) aren't wired up yet. No Airtel Money / TNM Mpamba integration.
- **Car photos**: listings without seller uploaded photos, and the catalogue/lookup/classics pages, show an original
  SVG car illustration (see `src/components/CarIllustration.tsx`) rather than a stock photo, so nothing implies a
  specific vehicle's real appearance.
