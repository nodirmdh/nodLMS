# Product

An LMS/CRM platform for a multi-branch education business. Combines day-to-day CRM workflows (leads, sales, communications) with LMS capabilities (groups, lessons, exams, grades) and finance (transactions, fines, bonuses, salaries).

## Primary users and roles

Roles are defined by the `Role` enum in Prisma: `CEO`, `admin`, `manager`, `mentor`, `assistent`. The product is designed around these personas:

- **CEO / admin** — branch-wide oversight, finance, staff, reporting.
- **Manager** — lead funnel, student onboarding, payments follow-up.
- **Mentor** — own schedule, attendance marking, grades.
- **Student / parent** (future) — personal cabinet via web or Telegram.

## Core domains

- **Branches** — every business entity (courses, transactions, fines, bonuses, lessons) belongs to a branch.
- **Leads (`Leed`)** — sales funnel with status progression (`new → refused | waitingGroup → inGroup → finished`), optional conversion to `Student`.
- **Courses / Groups / Lessons** — curriculum structure. Groups have class days, start/end time, mentor, responsible user, and lifecycle (`waiting → active → frozen | completed`). Lessons track attendance via `StudentOnLesson`.
- **Students** — enrolled learners, linked to groups via `GroupStudent`, carry balance, transactions, exam grades, bonuses.
- **Finance** — `Transaction` (in/out with payment type), `Fine`, `Bonus`, `StudentBonus`. Mentor salaries are computed by scheduled jobs.
- **Exams** — per-group exams with `ExamGrade` per student.
- **Auth** — phone + SMS OTP login, JWT-based session. Dev/test bypass with fixed code `000000` when `DEV_OTP_BYPASS=true` or `NODE_ENV !== production`.

## Language and locale

Primary UI language is Russian (see Swagger summaries, roadmap). Frontend uses `i18next` for localization.

## Roadmap documents

Product strategy and architecture planning live in root-level markdown files:

- `FEATURES_ROADMAP.md` — prioritized feature catalog (P0–P3), MVP pack, implementation stages.
- `FEATURE_IMPLEMENTATION_MASTERPLAN.md` — architectural rollout plan.
- `MODERNIZATION_PLAN.md`, `PROJECT_AUDIT.md` — current-state analysis and hardening plans.

When adding new features, consult these documents first to match priority and architectural direction.
