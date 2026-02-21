# FleetFlow — Fleet Management & Logistics System

A full-stack fleet management application for tracking vehicles, drivers, trips, maintenance, and analytics. Built with **Next.js**, **Express.js**, **PostgreSQL**, and **Prisma**.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| UI         | shadcn/ui (Radix UI primitives)                  |
| Backend    | Express.js, TypeScript                           |
| Database   | PostgreSQL 15                                    |
| ORM        | Prisma 5                                         |
| Auth       | JWT (bcryptjs + jsonwebtoken)                    |
| Validation | Zod                                              |
| Infra      | Docker Compose                                   |

---

## Features

- **Authentication** — JWT login/register with role-based access (Admin, Manager, Driver)
- **Dashboard** — Real-time KPIs, role-based views (Safety Officer, Financial Analyst)
- **Vehicle Registry** — Full CRUD, status tracking (Active/Maintenance/Retired), fuel & mileage
- **Trip Dispatcher** — Trip lifecycle (Scheduled → In Progress → Completed), cargo weight validation, fuel logging
- **Driver Profiles** — License tracking, expiry alerts, performance ratings
- **Maintenance Logs** — Scheduling, cost tracking, auto vehicle-status updates
- **Analytics** — Fleet utilization, cost per km, fuel efficiency, CSV exports
- **User Profile** — Editable name/phone/address, password change
- **Settings** — Configurable preferences with localStorage persistence

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Odoo_FleetFlow
```

### 2. Start the database

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Adminer** (DB admin UI) on port `8081`

### 3. Install dependencies

```bash
# Frontend (root directory)
pnpm install

# Backend
cd backend
npm install
```

### 4. Set up the database

```bash
cd backend
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 5. Start the backend (port 5000)

```bash
cd backend
npx tsx watch src/index.ts
```

### 6. Start the frontend (port 3000)

Open a **new terminal**:

```bash
cd Odoo_FleetFlow
npx next dev -p 3000
```

### 7. Open in browser

Navigate to **http://localhost:3000**

---

## Login Credentials

Seed users are created by running `npx tsx prisma/seed.ts`. Check `backend/prisma/seed.ts` for default accounts.

---

## Project Structure

```
Odoo_FleetFlow/
├── app/                    # Next.js pages (App Router)
│   ├── dashboard/          # Dashboard with KPIs
│   ├── vehicles/           # Vehicle registry CRUD
│   ├── trips/              # Trip dispatcher
│   ├── drivers/            # Driver management
│   ├── maintenance/        # Maintenance logs
│   ├── analytics/          # Analytics & reports
│   ├── profile/            # User profile (editable)
│   ├── settings/           # System settings
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── services/
│       └── api.ts          # Axios API client
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── src/
│       ├── index.ts        # Express server entry
│       ├── controllers/    # Route handlers
│       ├── middleware/      # Auth & validation
│       ├── routes/          # API routes
│       ├── utils/           # JWT, hashing helpers
│       └── validation/      # Zod schemas
├── components/
│   ├── layout/             # AppLayout, Sidebar, TopBar
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth/               # AuthContext (React Context)
│   ├── constants/          # Role labels, status colors
│   └── types/              # TypeScript interfaces
├── docker-compose.yml      # PostgreSQL + Adminer
└── package.json
```

---

## API Endpoints

### Auth
| Method | Endpoint                  | Description            |
|--------|---------------------------|------------------------|
| POST   | `/api/auth/login`         | Login                  |
| POST   | `/api/auth/register`      | Register               |
| GET    | `/api/auth/me`            | Get current user       |
| PATCH  | `/api/auth/profile`       | Update profile         |
| POST   | `/api/auth/change-password` | Change password       |

### Vehicles
| Method | Endpoint                      | Description            |
|--------|-------------------------------|------------------------|
| GET    | `/api/vehicles`               | List all vehicles      |
| POST   | `/api/vehicles`               | Create vehicle         |
| PATCH  | `/api/vehicles/:id`           | Update vehicle         |
| PATCH  | `/api/vehicles/:id/status`    | Change vehicle status  |
| DELETE | `/api/vehicles/:id`           | Delete vehicle         |

### Trips
| Method | Endpoint                  | Description                |
|--------|---------------------------|----------------------------|
| GET    | `/api/trips`              | List trips (filterable)    |
| POST   | `/api/trips`              | Create trip                |
| PATCH  | `/api/trips/:id`          | Update trip                |
| PATCH  | `/api/trips/:id/status`   | Trip lifecycle transition  |

### Drivers
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/api/drivers`                | List drivers             |
| POST   | `/api/drivers`                | Create driver            |
| PATCH  | `/api/drivers/:id`            | Update driver            |
| PATCH  | `/api/drivers/:id/status`     | Change driver status     |
| DELETE | `/api/drivers/:id`            | Delete driver            |
| GET    | `/api/drivers/license-expiry` | License expiry alerts    |

### Maintenance
| Method | Endpoint                          | Description               |
|--------|-----------------------------------|---------------------------|
| GET    | `/api/maintenance`                | List maintenance logs     |
| POST   | `/api/maintenance`                | Create maintenance log    |
| PATCH  | `/api/maintenance/:id`            | Update maintenance log    |
| PATCH  | `/api/maintenance/:id/status`     | Change maintenance status |
| DELETE | `/api/maintenance/:id`            | Delete maintenance log    |

### Analytics & Dashboard
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/analytics`          | Fleet analytics data     |
| GET    | `/api/analytics/export`   | CSV export (vehicles/drivers/trips) |
| GET    | `/api/dashboard/stats`    | Dashboard KPIs           |

---

## Database Admin

Adminer is available at **http://localhost:8081** — connect using the credentials from `docker-compose.yml`.

---

## Environment Variables

Create a `.env` file in `backend/` with:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/fleetflow"
JWT_SECRET="<generate-a-strong-secret>"
PORT=5000
```

Refer to `docker-compose.yml` for the database credentials.
