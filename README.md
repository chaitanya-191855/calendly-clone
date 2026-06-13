# Calendly Clone — SDE Fullstack Assignment

A full-stack scheduling platform that replicates Calendly's core experience: event type management, availability settings, a public booking page, and a meetings dashboard.

**Live Demo:** https://your-app.vercel.app  
**Backend API:** https://your-api.onrender.com

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite 5, TanStack Router v1 (file-based routing), TanStack Query v5 |
| Styling | Tailwind CSS v3 |
| HTTP Client | Axios |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL 15 (hosted on Supabase) |
| DB Access | Raw SQL via `pg` (node-postgres) — no ORM |
| Validation | Zod |
| Deployment | Vercel (frontend) + Render (backend) + Supabase (DB) |

---

## Architecture

The project is a **monorepo** with two workspaces managed by npm:

```
calendly-clone/
├── frontend/   React SPA
└── backend/    Express REST API
```

### Backend — 3-Layer Architecture

```
HTTP Request
  → Router layer     (Express router, Zod validation, response shaping)
  → Service layer    (business logic, orchestration)
  → Repository layer (raw SQL via pg pool, row mapping, transactions)
  → PostgreSQL
```

No ORM is used. All queries are parameterised SQL strings in repository classes, preventing SQL injection by design. Atomic double-booking prevention is implemented using `SELECT FOR UPDATE` inside a PostgreSQL transaction.

---

## Database Schema

Five tables:

| Table | Purpose |
|---|---|
| `users` | Single default user (no auth required per spec) |
| `event_types` | Meeting templates with name, slug, duration, color |
| `availability_schedules` | Named schedules owned by a user |
| `availability_windows` | Per-day-of-week time windows within a schedule |
| `bookings` | Confirmed/cancelled meetings with cancel token |

All timestamps are stored in UTC (`TIMESTAMPTZ`). Timezone conversion happens at query/display time.

---

## Local Setup

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or Supabase free tier)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/calendly-clone.git
cd calendly-clone
npm install          # installs root + both workspaces
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=4000
DEFAULT_USER_ID=        # filled after db:seed step below
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run migrations and seed

```bash
cd backend
npm run db:migrate   # creates all tables and indexes
npm run db:seed      # inserts default user, 3 event types, sample bookings
```

After seeding, the terminal prints the default user's UUID. Copy it into `DEFAULT_USER_ID` in `.env`.

### 4. Start both servers

Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

Or from the repo root:

```bash
npm run dev    # runs both concurrently
```

### 5. Open the app

| URL | What it shows |
|---|---|
| `http://localhost:5173/event-types` | Dashboard — manage event types |
| `http://localhost:5173/availability` | Dashboard — set weekly hours |
| `http://localhost:5173/meetings` | Dashboard — upcoming / past meetings |
| `http://localhost:5173/book/30-minute-meeting` | Public booking page |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/event-types` | List all active event types |
| POST | `/api/event-types` | Create a new event type |
| PUT | `/api/event-types/:id` | Update an event type |
| DELETE | `/api/event-types/:id` | Delete an event type |
| GET | `/api/availability` | Get default schedule with windows |
| PUT | `/api/availability` | Update timezone + weekly windows |
| GET | `/api/book/:slug` | Get event type for public booking page |
| GET | `/api/book/:slug/slots?date=YYYY-MM-DD&tz=...` | Get available time slots |
| POST | `/api/book/:slug` | Create a booking |
| GET | `/api/book/confirm/:token` | Get booking by cancel token |
| DELETE | `/api/book/confirm/:token` | Cancel booking by token |
| GET | `/api/meetings?filter=upcoming\|past` | List meetings |
| DELETE | `/api/meetings/:id` | Cancel a meeting |

---

## Key Design Decisions & Assumptions

**1. No authentication**  
Per the spec, a single default user is assumed to be logged in. The backend reads `DEFAULT_USER_ID` from the environment. No JWT, sessions, or login flow is implemented.

**2. Raw SQL over ORM**  
`pg` (node-postgres) is used directly in the repository layer instead of Prisma or Sequelize. This gives full control over query structure and avoids hidden N+1 queries. All parameters are passed as `$1, $2, ...` placeholders — never string-interpolated — preventing SQL injection.

**3. Atomic double-booking prevention**  
When a booking is created, the repository opens a transaction, runs `SELECT ... FOR UPDATE` on conflicting rows in the `bookings` table, and only inserts if no overlap is found. This is race-condition safe under concurrent requests.

**4. UTC storage, local display**  
All `start_time` / `end_time` values are stored as `TIMESTAMPTZ` in UTC. The invitee's browser timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) is sent with every slot request and booking so times are displayed correctly in the visitor's local time.

**5. Slot generation happens on the backend**  
Available slots are computed server-side by intersecting the host's weekly availability windows with existing confirmed bookings. This prevents clients from bypassing slot validation.

**6. Cancel token**  
Each booking row has a `cancel_token` UUID column (set automatically by the DB). This token is returned after booking and embedded in the confirmation page URL — allowing invitees to cancel without needing an account.

**7. Monorepo structure**  
npm workspaces are used so both `frontend` and `backend` share the root `node_modules` and can be started together with a single `npm run dev` from the root.

---

## Project Structure

```
calendly-clone/
├── package.json                  # root — npm workspaces, concurrently dev script
│
├── frontend/
│   ├── src/
│   │   ├── routes/               # TanStack Router file-based routes
│   │   │   ├── __root.tsx        # layout split: dashboard vs. public
│   │   │   ├── event-types/
│   │   │   ├── availability/
│   │   │   ├── meetings/
│   │   │   └── book/$slug/
│   │   ├── components/
│   │   │   ├── layout/           # DashboardLayout, sidebar, mobile nav
│   │   │   ├── dashboard/        # EventTypeCard, AvailabilityGrid, MeetingCard …
│   │   │   ├── booking/          # BookingCalendar, TimeSlots, BookingForm
│   │   │   └── ui/               # Modal, Badge, Spinner, ConfirmDialog, EmptyState
│   │   ├── hooks/                # TanStack Query hooks per domain
│   │   └── lib/
│   │       ├── api.ts            # Axios client + typed API wrappers
│   │       └── queryClient.ts
│   ├── vercel.json               # SPA rewrite rule for Vercel
│   └── tailwind.config.js
│
└── backend/
    ├── src/
    │   ├── routes/               # Express routers (thin HTTP layer)
    │   ├── services/             # Business logic
    │   ├── repositories/         # Raw SQL queries via pg
    │   ├── db/
    │   │   ├── pool.ts           # pg Pool singleton + withTransaction helper
    │   │   ├── migrate.ts        # Migration runner
    │   │   ├── seed.ts           # Sample data
    │   │   └── migrations/       # 001_init.sql, 002_indexes.sql
    │   ├── schemas/              # Zod validation schemas
    │   ├── middleware/           # errorHandler, validate, rateLimit
    │   └── types/                # Shared TypeScript interfaces
    └── .env.example
```

---

## Bonus Features Implemented

- **Responsive design** — Tailwind responsive utilities; mobile bottom tab bar replaces sidebar on small screens
- **Color-coded event types** — each event type has a hex color displayed as a card accent bar and booking page accent
- **Rate limiting** — booking and slot endpoints are rate-limited with `express-rate-limit` to prevent abuse
- **Security headers** — `helmet` sets CSP, HSTS, X-Frame-Options etc. on all responses
- **Cancel by token** — invitees can cancel their own booking via the token in the confirmation URL without needing an account
