# Work split — four branches

Every tracked file in the repo is assigned to exactly one of the four features below, so each
person has an unambiguous set to own. Generated against the tree as it stands; `frontend/.env`
and `backend/appsettings.Development.json` are gitignored and belong to nobody.

| Person | Feature | Branch | Files |
| --- | --- | --- | --- |
| **P1** | Divisions + Risk model (foundation) | `feature/divisions-risk` | 82 |
| **P2** | Reports (resident reporting) | `feature/reports` | 9 |
| **P3** | Cases (case recording) | `feature/cases` | 10 |
| **P4** | Officer queue + Dashboard | `feature/officer-dashboard` | 27 |

**The file counts are not a measure of effort.** P1 carries 82 files because "foundation" means
owning the scaffolding — `package.json`, the shared UI primitives, middleware, migrations —
most of which already exists and is not per-feature work. The genuinely new work is closer to
even than the table suggests.


## P1 — Divisions + Risk model (foundation)

`feature/divisions-risk`

The scoring model, the divisions it scores, and every piece of scaffolding the other three build on: project config, the DbContext, middleware, shared UI primitives, the design tokens, routing, the public landing page and the About page.

**Repo root**

- `.claude/launch.json`
- `.gitignore`
- `CLAUDE.md`
- `README.md`

**Backend — project & data**

- `backend/Data/AppDbContext.cs`
- `backend/Data/DbSeeder.cs`
- `backend/HackathonApi.csproj`
- `backend/Program.cs`
- `backend/Properties/launchSettings.json`
- `backend/appsettings.json`

**Backend — models & DTOs**

- `backend/Dtos/DivisionDtos.cs`
- `backend/Dtos/PagedResult.cs`
- `backend/Dtos/RiskModelDtos.cs`
- `backend/Models/.gitkeep`
- `backend/Models/Division.cs`
- `backend/Models/Enums.cs`

**Backend — services**

- `backend/Services/.gitkeep`
- `backend/Services/DivisionService.cs`
- `backend/Services/IDivisionService.cs`
- `backend/Services/IRiskService.cs`
- `backend/Services/RiskService.cs`
- `backend/Services/SiteTypeLabels.cs`

**Backend — controllers & middleware**

- `backend/Controllers/DivisionsController.cs`
- `backend/Controllers/HealthController.cs`
- `backend/Controllers/RiskModelController.cs`
- `backend/Middleware/BadRequestException.cs`
- `backend/Middleware/ExceptionHandlingMiddleware.cs`
- `backend/Middleware/NotFoundException.cs`

**Backend — migrations**

- `backend/Migrations/20260904041038_InitialCreate.Designer.cs`
- `backend/Migrations/20260904041038_InitialCreate.cs`
- `backend/Migrations/20260904050334_DengueDomain.Designer.cs`
- `backend/Migrations/20260904050334_DengueDomain.cs`
- `backend/Migrations/AppDbContextModelSnapshot.cs`

**Frontend — config & shell**

- `frontend/.env.example`
- `frontend/.gitignore`
- `frontend/.oxlintrc.json`
- `frontend/README.md`
- `frontend/index.html`
- `frontend/package-lock.json`
- `frontend/package.json`
- `frontend/public/favicon.svg`
- `frontend/public/icons.svg`
- `frontend/src/api/client.js`
- `frontend/src/app/App.jsx`
- `frontend/src/app/AppLayout.jsx`
- `frontend/src/app/NotFoundPage.jsx`
- `frontend/src/app/router.jsx`
- `frontend/src/index.css`
- `frontend/src/main.jsx`
- `frontend/vite.config.js`

**Frontend — shared primitives**

- `frontend/src/shared/Badge.jsx`
- `frontend/src/shared/Button.jsx`
- `frontend/src/shared/Card.jsx`
- `frontend/src/shared/ConfirmDialog.jsx`
- `frontend/src/shared/EmptyState.jsx`
- `frontend/src/shared/ErrorMessage.jsx`
- `frontend/src/shared/Field.jsx`
- `frontend/src/shared/Input.jsx`
- `frontend/src/shared/Pagination.jsx`
- `frontend/src/shared/Reveal.jsx`
- `frontend/src/shared/RiskBadge.jsx`
- `frontend/src/shared/Select.jsx`
- `frontend/src/shared/Spinner.jsx`
- `frontend/src/shared/StatusBadge.jsx`
- `frontend/src/shared/Textarea.jsx`
- `frontend/src/shared/formatDate.js`
- `frontend/src/shared/index.js`
- `frontend/src/shared/useCountUp.js`
- `frontend/src/shared/useDebounced.js`

**Frontend — features**

- `frontend/src/features/about/pages/AboutPage.jsx`
- `frontend/src/features/divisions/api/divisionsApi.js`
- `frontend/src/features/divisions/components/DivisionRiskCard.jsx`
- `frontend/src/features/divisions/pages/RiskBoardPage.jsx`
- `frontend/src/features/landing/api/riskModelApi.js`
- `frontend/src/features/landing/components/HeroSection.jsx`
- `frontend/src/features/landing/components/HowItWorksSection.jsx`
- `frontend/src/features/landing/components/LandingFooter.jsx`
- `frontend/src/features/landing/components/OutbreakSection.jsx`
- `frontend/src/features/landing/components/PrioritisationSection.jsx`
- `frontend/src/features/landing/components/RiskPreviewSection.jsx`
- `frontend/src/features/landing/components/StatStrip.jsx`
- `frontend/src/features/landing/pages/LandingPage.jsx`


## P2 — Reports (resident reporting)

`feature/reports`

A resident sees standing water and reports it: the report entity and its scoring inputs, the submission form, and the phone lookup that lets them follow what happened. Not the officer-facing queue — that is P4.

**Backend — models & DTOs**

- `backend/Dtos/ReportDtos.cs`
- `backend/Models/Report.cs`

**Backend — services**

- `backend/Services/IReportService.cs`
- `backend/Services/ReportService.cs`

**Backend — controllers & middleware**

- `backend/Controllers/ReportsController.cs`

**Frontend — features**

- `frontend/src/features/reports/api/reportsApi.js`
- `frontend/src/features/reports/components/MyReportCard.jsx`
- `frontend/src/features/reports/pages/MyReportsPage.jsx`
- `frontend/src/features/reports/pages/NewReportPage.jsx`


## P3 — Cases (case recording)

`feature/cases`

Confirmed dengue cases, and the premises inspection that opening one raises automatically. Owns the auto-generated-report migration because CaseService is what writes those rows.

**Backend — models & DTOs**

- `backend/Dtos/CaseDtos.cs`
- `backend/Dtos/NotInTheFutureAttribute.cs`
- `backend/Models/DengueCase.cs`

**Backend — services**

- `backend/Services/CaseService.cs`
- `backend/Services/ICaseService.cs`

**Backend — controllers & middleware**

- `backend/Controllers/CasesController.cs`

**Backend — migrations**

- `backend/Migrations/20260904052319_AutoGeneratedReports.Designer.cs`
- `backend/Migrations/20260904052319_AutoGeneratedReports.cs`

**Frontend — features**

- `frontend/src/features/cases/api/casesApi.js`
- `frontend/src/features/cases/pages/RecordCasePage.jsx`


## P4 — Officer queue + Dashboard

`feature/officer-dashboard`

Everything an officer does after signing in: the prioritised queue, status updates, the quadrant dashboard — and the JWT authentication and account management that gate them.

**Backend — models & DTOs**

- `backend/Dtos/AuthDtos.cs`
- `backend/Dtos/DashboardDtos.cs`
- `backend/Models/Officer.cs`

**Backend — services**

- `backend/Services/AuthService.cs`
- `backend/Services/IAuthService.cs`
- `backend/Services/IOfficerService.cs`
- `backend/Services/JwtSettings.cs`
- `backend/Services/OfficerService.cs`

**Backend — controllers & middleware**

- `backend/Controllers/AuthController.cs`
- `backend/Controllers/ClaimsPrincipalExtensions.cs`
- `backend/Controllers/OfficersController.cs`

**Backend — migrations**

- `backend/Migrations/20260904064518_OfficerAuth.Designer.cs`
- `backend/Migrations/20260904064518_OfficerAuth.cs`

**Frontend — config & shell**

- `frontend/src/api/authToken.js`
- `frontend/src/app/AuthContext.jsx`
- `frontend/src/app/ProtectedRoute.jsx`

**Frontend — features**

- `frontend/src/features/auth/api/authApi.js`
- `frontend/src/features/auth/pages/LoginPage.jsx`
- `frontend/src/features/divisions/components/DivisionRiskTable.jsx`
- `frontend/src/features/divisions/components/QuadrantMatrix.jsx`
- `frontend/src/features/divisions/pages/DashboardPage.jsx`
- `frontend/src/features/officers/api/officersApi.js`
- `frontend/src/features/officers/components/AddOfficerModal.jsx`
- `frontend/src/features/officers/pages/OfficerManagementPage.jsx`
- `frontend/src/features/reports/components/InspectionQueueList.jsx`
- `frontend/src/features/reports/components/ReportDetailPanel.jsx`
- `frontend/src/features/reports/pages/InspectionQueuePage.jsx`


## Files more than one branch will touch

Ownership above is about who is responsible for a file, not who is allowed to open it. These
are the ones where two people will edit different lines of the same file, so they are where
merge conflicts will actually happen. Agreed rule: **keep the edit to your own lines, rebase on
`main` before you push, and never reformat someone else's block.**

| File | Owner | Who else edits it, and why |
| --- | --- | --- |
| `backend/Program.cs` | P1 | Every feature registers its service here; P4 also owns the JWT and Swagger auth blocks. |
| `backend/Data/AppDbContext.cs` | P1 | One `DbSet` and one configuration block per entity — P2 Report, P3 DengueCase, P4 Officer. |
| `backend/Data/DbSeeder.cs` | P1 | Seeds divisions (P1), reports (P2), cases (P3) and officers (P4) in separate methods. Edit only your own method. |
| `backend/Models/Enums.cs` | P1 | `SiteType`/`ReportStatus` are P2's, `AgeBand`/`CaseSeverity` P3's, `RiskBand` P1's, `OfficerRole` P4's. |
| `backend/Migrations/AppDbContextModelSnapshot.cs` | P1 | Regenerated by whoever adds the next migration. Never hand-edit; if it conflicts, take `main`'s copy and re-run `dotnet ef migrations add`. |
| `backend/Controllers/DivisionsController.cs` | P1 | The `GET /dashboard` action is P4's, in P1's file. |
| `frontend/src/app/router.jsx` | P1 | One route per feature. |
| `frontend/src/app/AppLayout.jsx` | P1 | Nav links per feature; P4 owns the signed-in identity block and sign-out. |
| `frontend/src/shared/index.js` | P1 | Barrel file — append your export, don't reorder. |
| `frontend/package.json` | P1 | Dependency additions. Re-run `npm install` after every merge. |

## Judgement calls worth knowing

**Authentication went to P4, not P1.** It is not one of the four features, and it could
defensibly be foundation. It sits with P4 because only officers sign in, and P4 owns the entire
officer-facing surface the tokens exist to protect. The *infrastructure* touchpoints stay with
P1 — the JWT config lives in P1's `Program.cs`, the interceptors in P1's `client.js`, the
identity block in P1's `AppLayout.jsx`.

**Three files under `features/reports/` belong to P4.** `InspectionQueuePage`,
`InspectionQueueList` and `ReportDetailPanel` are folder-wise P2's but feature-wise the officer
queue. Splitting by folder here would have handed P4's core screen to P2.

**Two files under `features/divisions/` belong to P4.** `DashboardPage` and `QuadrantMatrix`
are the officer dashboard; `DivisionRiskTable` is used only by it. `RiskBoardPage` and
`DivisionRiskCard` stay with P1 — that is the public board.

**The landing page is P1's.** It reads division risk and the published risk model, so it sits
with the people who own both. It is nine files and real work; if P1 is overloaded, this is the
cleanest block to hand to someone else.

**`NotInTheFutureAttribute` went to P3.** It is a generic validator in a shared folder, but
`CreateCaseDto` is its only user.

## Creating the branches

The working tree is currently uncommitted on `main`. Commit that first, so all four branches
start from a build that runs — splitting the existing code across four branches would leave
each one unable to compile, since the features reference each other through `Program.cs`,
`AppDbContext` and the router.

```bash
git add -A && git commit -m "foundation: dengue domain, risk model, officer auth"
git branch feature/divisions-risk
git branch feature/reports
git branch feature/cases
git branch feature/officer-dashboard
```

From there each person works on their own branch and merges back through a PR.

