# Aarnav Structura — Backend

Production-ready Express + MySQL backend: enquiry management, visitor tracking/analytics,
JWT-authenticated admin API, dual local+cloud MySQL writes, email notifications, CSV/Excel
export, and content management for the website (projects, gallery, services, testimonials,
team, hero/about/contact/social/footer text).

## 1. Local setup

```bash
cd backend
npm install
cp .env.example .env      # fill in your local MySQL creds at minimum
```

Create the local database (or let the migration script do it — `CREATE DATABASE IF NOT EXISTS`
is included in `migrations/schema.sql`):

```bash
npm run migrate
```

This applies the schema to `LOCAL_DB_*` (and to `CLOUD_DB_*` too, if `CLOUD_DB_ENABLED=true`
and reachable), and seeds one admin account from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

Start the API:

```bash
npm run dev        # nodemon, auto-restart
# or
npm start
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

## 2. Connecting your existing React website

Your website's `src/services/api.js` already points at `VITE_API_URL` (defaults to
`http://localhost:5000`) and calls `POST /api/enquiry` from the Contact form — no changes
needed there. Two additions were made so the backend can do its job:

- `trackPageview()` in `api.js` and a `useEffect` in `App.jsx` that fires it once on load,
  so visits show up in Visitor analytics.
- `withCredentials: true` on the axios instance, so the visitor session cookie persists.

If your website is on a different origin in production, set `CLIENT_URL` in the backend's
`.env` to that origin (CORS is locked to `CLIENT_URL` + `ADMIN_URL`).

## 3. Connecting the Admin Dashboard

See `admin-dashboard/README.md` — it's a separate Vite app that talks to this same API.

## 4. Dual database (local + cloud)

Every write (enquiries, visits, admin content edits) goes to `LOCAL_DB_*` first — that's
the source of truth and what all reads use. If `CLOUD_DB_ENABLED=true`, the same write is
mirrored to `CLOUD_DB_*` in the background. If the cloud DB is unreachable, the mirror
fails silently (logged to `logs/error.log`) and the user-facing request still succeeds.

To point `CLOUD_DB_*` at a managed MySQL (PlanetScale, AWS RDS, Azure MySQL, etc.), fill in
its host/user/password/SSL settings in `.env` and re-run `npm run migrate` to apply the
schema there too.

## 5. Email

Uses SMTP via Nodemailer (works with Gmail App Passwords, SendGrid SMTP, etc. — set
`SMTP_HOST/PORT/USER/PASSWORD`). On every enquiry: a confirmation email to the customer and
a notification email to `COMPANY_NOTIFY_EMAIL`. Failures are logged, never block the request.

## 6. File uploads

Multer stores files under `backend/uploads/<projects|gallery|services|testimonials|team>/`,
served statically at `/uploads/...`. In production, point this at a persistent volume or
swap `middleware/upload.js` for S3/Cloudinary storage.

## 7. Production deployment checklist

- Set `NODE_ENV=production`, strong `JWT_SECRET`/`JWT_REFRESH_SECRET`, real SMTP creds.
- Put the API behind HTTPS (nginx/Caddy or your host's TLS termination) — cookies use
  `sameSite: lax`; add `secure: true` in `middleware/visitorTracker.js` once on HTTPS.
- Restrict `CLOUD_DB_*` user to only the privileges it needs (INSERT/UPDATE/SELECT).
- Point `uploads/` at persistent disk or object storage — container filesystems are ephemeral.
- Run `npm run migrate` once against production `LOCAL_DB_*`/`CLOUD_DB_*` before first boot.
- Rotate `SEED_ADMIN_PASSWORD` immediately after first login (Change Password in the dashboard).

## API docs

See `API.md` for every endpoint, and `postman_collection.json` (import into Postman) for
ready-to-run requests.
