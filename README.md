# DengueSafe

**Breeding-site reporting and risk prioritisation for Sri Lankan public health divisions.**

Residents report standing water. Public Health Inspectors work a queue ordered by how much
dengue each site is likely to produce — not by who reported first.


<!-- Fill the last two columns from WORK-SPLIT.md:
     Divisions + Risk model (foundation) → feature/divisions-risk
     Reports (resident reporting)        → feature/reports
     Cases (case recording)              → feature/cases
     Officer queue + Dashboard           → feature/officer-dashboard -->

---

## The problem

By early August 2026 Sri Lanka had passed **90,000 reported dengue cases and 65 deaths** — the
largest season since the 2017 epidemic, with Western Province carrying the highest share. The
National Dengue Review that month named early warning of high-risk areas a national priority.

Case counts arrive too late to act on. By the time a division's numbers climb, the mosquitoes
that caused them bred weeks earlier. What is missing is a view of the *habitat* before anyone
falls ill.

## The idea: two measures, crossed

*Aedes aegypti* breeds in containers, not swamps — a tyre behind a garage, an uncovered tank, a
blocked gutter — and takes roughly 7–10 days to go from egg to biting adult.

DengueSafe scores every division on two deliberately independent axes:

| Axis                        | What it measures                                                            | Nature                                                   |
| --------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Vector risk**       | Open breeding sites, weighted by container type and how long each has stood | **Leading** — habitat exists before anyone is ill |
| **Transmission risk** | Confirmed cases in the division in the last 14 days                         | **Lagging** — infection has already happened      |

Crossing them at vector risk ≥ 20 and cases ≥ 8 gives four bands, each with an instruction:

|                             | **Few sites reported**                                                    | **Many sites open**                                        |
| --------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Many recent cases** | **Investigate** — cases with no reported sites; send a team to find them | **Emergency** — fogging plus immediate site clearance     |
| **Few recent cases**  | **Monitor** — continue routine surveillance                              | **Prevent** — clear sites now, before transmission starts |

**Investigate is the quadrant the model exists to surface.** People are falling ill somewhere
almost nothing has been reported, which means the breeding sources are out there and unfound.
A single combined "risk score" would hide exactly that case.

## Features

**For residents — no account needed**

- Report a breeding site: site type, division, description, landmark, contact details
- Follow your own reports by entering the phone number you filed with
- Public risk board showing every division's band and recommended action

**For officers — signed in**

- Inspection queue ordered by risk score, with filters, search and an ageing flag for sites open past a mosquito generation
- Update a report to Inspected, Cleared or Notice Issued, with an inspector note
- Notify a confirmed case — which automatically opens a premises inspection in that division
- Dashboard: programme totals, the four-quadrant matrix, and the most common site types

**For administrators**

- Create, search, activate and deactivate officer accounts

## Tech stack

| Layer    | Choice                                                    |
| -------- | --------------------------------------------------------- |
| Backend  | ASP.NET Core 8 Web API, controller-based                  |
| Data     | EF Core 8 + Npgsql, PostgreSQL (Supabase)                 |
| Auth     | JWT bearer tokens, BCrypt password hashing                |
| Frontend | React 19, Vite, JavaScript                                |
| Styling  | Tailwind CSS v4, self-hosted Public Sans + Source Serif 4 |
| Icons    | Phosphor Icons                                            |
| Hosting  | Render (API, Docker) · Vercel (frontend)                 |

## Repository layout

```
backend/          ASP.NET Core API — layer-based
  Controllers/    thin: model validation, one service call
  Services/       all business logic, including the risk model
  Data/           DbContext, migrations, seeder
  Dtos/  Models/  Middleware/
frontend/         React app — feature-based
  src/features/   reports, divisions, cases, auth, officers, landing, about
  src/shared/     presentation-only primitives
  src/app/        routing, layout, auth context
  src/api/        axios client and token storage
```

The two sides use different conventions on purpose: the backend is organised by layer, the
frontend by feature.

## Running locally

**Prerequisites:** .NET 8 SDK, Node 20+, a PostgreSQL database.

```bash
# API — http://localhost:5116, Swagger at /swagger
cd backend
dotnet run

# App — http://localhost:5173
cd frontend
npm install
npm run dev
```

The API applies migrations and seeds demo data on start-up, so a fresh database is usable on
the first run.

### Configuration

`backend/appsettings.Development.json` is **gitignored** — a fresh clone has no connection
string or signing key and must be given one:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Jwt": { "Secret": "at least 32 characters" }
}
```

`frontend/.env` (also gitignored) needs one line — the `/api` suffix is required:

```
VITE_API_URL=http://localhost:5116/api
```

## Demo accounts

There is no self-registration; an administrator creates accounts. On an empty database the
seeder creates three and prints them to the console once:

| Email              | Role    | MOH area       |
| ------------------ | ------- | -------------- |
| `admin@moh.lk`   | Admin   | MOH Kolonnawa  |
| `sanduni@moh.lk` | Officer | MOH Maharagama |
| `ruwan@moh.lk`   | Officer | MOH Wattala    |

All three share the password `Dengue@2026`. **Change them before this database is anything but
a demo.**

## API and access control

Swagger is available at `/swagger` in every environment, with a bearer definition — sign in via
`POST /api/auth/login`, copy the token, press **Authorize**, paste.

| Surface                                                                  | Access                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Landing page, risk board,`GET /api/divisions`, `GET /api/risk-model` | Anonymous                                                         |
| `POST /api/reports`, `GET /api/reports/by-phone`                     | Anonymous — reporting standing water must not require an account |
| Inspection queue, status updates, case notification, dashboard           | `[Authorize]`                                                   |
| Everything under`/api/officers`                                        | `[Authorize(Roles = "Admin")]`                                  |

Tokens last 8 hours.

## Privacy by design

Two decisions worth stating plainly, because both were deliberate:

- **A case record holds no patient name, address or contact detail** — only division, age band,
  severity and whether the patient was hospitalised. A case is a statistic attached to an area,
  never to a person.
- **A reporter's phone number is never returned by any API response**, and never appears in a
  URL. It is collected so an inspector can follow up, not so it can be served to every
  dashboard client or leak through a shared link.

## Deployment

### Backend → Render

Docker web service, root directory `backend` (Render has no native .NET runtime).

| Environment variable                     | Purpose                                                             |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string — note the**double underscore** |
| `JWT_SECRET`                           | Token signing key, ≥32 characters:`openssl rand -base64 48`      |
| `ASPNETCORE_ENVIRONMENT`               | `Production`                                                      |

`JWT_SECRET` is never committed. The API **refuses to start** without it rather than generating
a default, which would silently invalidate every issued token on the next restart. Rotating it
signs all officers out — the intended way to revoke access at once.

With Supabase, use the pooler host (`aws-0-<region>.pooler.supabase.com`) with a
tenant-qualified username (`postgres.<project-ref>`) on port **5432** — the direct host is
IPv6-only, and migrations at start-up need session mode.

### Frontend → Vercel

Root directory `frontend`, framework preset Vite.

```
VITE_API_URL = https://<your-service>.onrender.com/api
```

Vite **inlines** this at build time, so changing it requires a redeploy, not just a save.
`frontend/vercel.json` rewrites all paths to `index.html` so client-side routes survive a
refresh.

## Project documentation

| File                                  | Contents                                                     |
| ------------------------------------- | ------------------------------------------------------------ |
| [`REQUIREMENTS.md`](REQUIREMENTS.md) | Functional and non-functional requirements, numbered         |
| [`WORK-SPLIT.md`](WORK-SPLIT.md)     | Every file assigned to one of the four feature branches      |
| [`CLAUDE.md`](CLAUDE.md)             | Architecture notes and the invariants that are easy to break |

## Team workflow

Four feature branches, one per member, merged to `main` through pull requests:

```
feature/divisions-risk      Divisions + risk model (foundation)
feature/reports             Resident reporting
feature/cases               Case recording
feature/officer-dashboard   Officer queue + dashboard
```

`main` must always build. Before opening a pull request:

```bash
cd frontend && npm run build
cd ../backend && dotnet build
```
