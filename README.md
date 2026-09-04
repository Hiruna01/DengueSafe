# DengueWatch

Breeding-site reporting and risk prioritisation for Sri Lankan public health divisions.
Residents report standing water; Public Health Inspectors work a queue ordered by how much
dengue each site is likely to produce, rather than by arrival time.

- `backend/` — ASP.NET Core 8 Web API (`HackathonApi`), EF Core + Npgsql
- `frontend/` — React 19 + Vite, Tailwind CSS v4

## Running locally

```bash
# API on http://localhost:5116, Swagger UI at /swagger
cd backend && dotnet run

# App on http://localhost:5173
cd frontend && npm install && npm run dev
```

The API migrates and seeds on start-up, so a fresh database is ready on the first run.

## Environment variables

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `ConnectionStrings__DefaultConnection` | Yes in deployment | Postgres connection string. Locally it is read from `backend/appsettings.Development.json`, which is gitignored. |
| `JWT_SECRET` | **Yes** | Signing key for officer access tokens. At least 32 characters. |

**`JWT_SECRET` is never committed.** In development the API falls back to `Jwt:Secret` in
`backend/appsettings.Development.json` — a gitignored file, so a fresh clone has no key and
must be given one. If neither is set the API refuses to start, rather than inventing a key
that would silently invalidate every token on the next restart.

Generate one with:

```bash
openssl rand -base64 48
```

**On Render**, add it under the service's *Environment* tab as a plain environment variable
named `JWT_SECRET`, alongside `ConnectionStrings__DefaultConnection`. Changing it signs
everyone out, which is the intended way to revoke every issued token at once.

### Frontend

`frontend/.env` holds `VITE_API_URL`, which must include the `/api` suffix. See
`frontend/.env.example`.

## Accounts

There is no self-registration: an administrator creates accounts under **Officers**. On a
database with no officers, the seeder creates three and prints them to the console once:

| Email | Role | MOH area |
| --- | --- | --- |
| `admin@moh.lk` | Admin | MOH Kolonnawa |
| `sanduni@moh.lk` | Officer | MOH Maharagama |
| `ruwan@moh.lk` | Officer | MOH Wattala |

All three share the password `Dengue@2026`. **Change them before this is anything but a
demo.**

## What needs a token

| Surface | Access |
| --- | --- |
| Landing page, risk board, division risk | Anonymous |
| `POST /api/reports`, `GET /api/reports/by-phone` | Anonymous — a resident must not need an account to report standing water |
| Inspection queue, report status updates, case notification, dashboard | `[Authorize]` |
| Everything under `/api/officers` | `[Authorize(Roles = "Admin")]` |

Tokens last 8 hours. Swagger carries a bearer definition, so the authorised endpoints can be
exercised from `/swagger`: call `POST /api/auth/login`, copy the token, press **Authorize**,
paste it.
