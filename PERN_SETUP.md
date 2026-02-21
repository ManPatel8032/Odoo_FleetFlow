# FleetFlow PERN Stack Setup Guide

FleetFlow is a full-stack production PERN (PostgreSQL, Express, React, Node.js) application with real database persistence, authentication, and API integration.

## Project Structure

```
Odoo_FleetFlow/
├── .git/                       # Git repository
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Docker Compose configuration
├── package.json                # Root package.json
├── PERN_SETUP.md              # This file
│
├── backend/                    # Express.js API server (ES modules)
│   ├── .env                    # Environment variables
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── src/
│       ├── server.js           # Express server entry point
│       └── routes/             # API endpoints
│           ├── auth.js         # Authentication routes
│           ├── vehicles.js     # Vehicle management routes
│           ├── trips.js        # Trip dispatcher routes
│           └── dashboard.js    # Dashboard routes
│
├── frontend/                   # React.js frontend
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── front_require.txt       # Dependencies list
│   ├── public/
│   │   └── index.html          # HTML entry point
│   └── src/
│       ├── index.tsx           # React entry point
│       ├── index.css           # Global styles
│       ├── App.tsx             # Root component
│       ├── declarations.d.ts   # TypeScript declarations
│       ├── components/
│       │   └── ProtectedRoute.tsx  # Route guard component
│       ├── hooks/
│       │   └── useAuth.ts      # Authentication hook
│       └── pages/
│           └── Auth/
│               ├── Login.tsx            # Login page
│               ├── ForgotPassword.tsx   # Password recovery
│               └── auth.styles.css     # Auth styles
│
├── shared/
│   └── validation/
│       └── schemas.ts          # Zod validation schemas
│
├── docs/
│   └── problem-statement.md    # Project requirements
│
└── components/                 # Shared UI components (if needed)
```

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)
- Git

## Setup Instructions

### 1. Install Dependencies

**Option A: Using Docker Compose (Recommended - All-in-One)**

```bash
# Navigate to project root
cd Odoo_FleetFlow

# Start all services (PostgreSQL, Backend, Frontend, Adminer)
docker-compose up -d

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - Database Admin (Adminer): http://localhost:8081
# - PostgreSQL: localhost:5432
```

**Option B: Local Development Setup**

```bash
# Install dependencies for all services
npm install

# Frontend dependencies
cd frontend
npm install --legacy-peer-deps
cd ..

# Backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup

**Option A: Using Docker Compose (Automatic)**

PostgreSQL database is automatically created when you run:
```bash
docker-compose up -d postgres
```

The database will be available at:
```
postgresql://fleetflow:fleetflow_password@localhost:5432/fleetflow
```

**Option B: Manual PostgreSQL Setup**

Install PostgreSQL locally and create:
```sql
CREATE DATABASE fleetflow;
CREATE USER fleetflow WITH PASSWORD 'fleetflow_password';
GRANT ALL PRIVILEGES ON DATABASE fleetflow TO fleetflow;
```

### 3. Backend Setup

```bash
cd backend

# Create .env file (if not exists)
cp .env.example .env  # or create .env manually

# Update .env with your database URL and JWT secret
# DATABASE_URL="postgresql://fleetflow:fleetflow_password@localhost:5432/fleetflow"
# JWT_SECRET="your-super-secret-jwt-key"
# PORT=5000

# Install dependencies
npm install

# Start the backend server (local development)
npm run dev
```

The backend will run on `http://localhost:5000`

Backend routes are in `src/routes/`:
- `auth.js` - Authentication endpoints
- `vehicles.js` - Vehicle management
- `trips.js` - Trip management
- `dashboard.js` - Dashboard statistics

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies with legacy peer deps (for react-scripts compatibility)
npm install --legacy-peer-deps

# Create .env.local file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Start the frontend (local development)
npm start
```

The frontend will run on `http://localhost:3000`

## Authentication

### Login/Register
- Users can create accounts with email/password via `/register`
- Login with created credentials at `/login`
- Tokens are stored in localStorage
- JWT tokens expire after 7 days (configurable)

### Testing
Create a test account:
- Email: test@example.com
- Password: password123

Then login with these credentials.

## API Endpoints

All API endpoints are prefixed with `/api`

### Authentication (`/api/auth`)
- `POST /login` - Login user (returns JWT token)
- `POST /register` - Register new user
- `GET /me` - Get current user profile
- `POST /logout` - Logout user

### Vehicles (`/api/vehicles`)
- `GET /` - List all vehicles
- `GET /:id` - Get vehicle details
- `POST /` - Create new vehicle
- `PATCH /:id` - Update vehicle
- `DELETE /:id` - Delete vehicle
- `PATCH /:id/status` - Update vehicle status

### Trips (`/api/trips`)
- `GET /` - List all trips
- `GET /:id` - Get trip details
- `POST /` - Create new trip
- `PATCH /:id` - Update trip
- `PATCH /:id/status` - Update trip status

### Dashboard (`/api/dashboard`)
- `GET /stats` - Get KPI statistics
- `GET /fleet-stats` - Get fleet performance metrics

### Health Check
- `GET /health` - API health status

## Current Implementation Status

**Backend Routes** (src/routes/):
- ✅ auth.js - Basic auth endpoints
- ✅ vehicles.js - Vehicle CRUD endpoints
- ✅ trips.js - Trip management endpoints
- ✅ dashboard.js - Dashboard stats endpoints

**Frontend**: 
- ✅ React 18 with TypeScript
- ✅ React Router for navigation
- ✅ Authentication context (useAuth hook)
- ✅ Protected routes system
- ✅ Tailwind CSS support
- ✅ Login and Forgot Password pages

## Role-Based Access Control

### Roles
1. **ADMIN** - Full system access
2. **MANAGER** - Can manage vehicles, drivers, trips
3. **DRIVER** - Can view trips and profile

### Permission Matrix
- Dashboard: All roles
- Vehicles: Admin, Manager (read); Admin, Manager (write)
- Drivers: Admin, Manager
- Trips: All roles (read); Admin, Manager (write)
- Analytics: Admin, Manager
- Settings: Admin only

## Database Schema

### Core Models
- **User** - Authentication & profile
- **Driver** - Driver information & statistics
- **Vehicle** - Fleet vehicles with capacity & status
- **Trip** - Logistics trips with weight validation
- **MaintenanceLog** - Vehicle service records
- **VehicleAssignment** - Driver-vehicle assignments

### Key Features
- Cargo weight validation (cannot exceed vehicle capacity)
- Automatic trip status updates
- Driver statistics tracking (trips, distance, rating)
- Maintenance tracking with auto-status updates
- PostgreSQL enums for status consistency

## Development Workflow

### Running Services

**Using Docker Compose (All Services):**
```bash
# Start all services
docker-compose up -d

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop all services
docker-compose down
```

**Local Development (Individual Services):**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Database (if using Docker)
docker run --name fleetflow_db -e POSTGRES_USER=fleetflow -e POSTGRES_PASSWORD=fleetflow_password -e POSTGRES_DB=fleetflow -p 5432:5432 postgres:15-alpine
```

### Making API Calls from Frontend

Example using fetch API:
```typescript
// Login
const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Get vehicles
const vehicles = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`);
```

### Using the Authentication Hook

```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login('user@example.com', 'password123');
  };

  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Welcome {user.email}</div>;
}
```

### Adding New Endpoints

1. Create a route handler in `backend/src/routes/` (e.g., `backend/src/routes/newfeature.js`)
2. Import and register in `backend/src/server.js`: `app.use('/api/newfeature', newFeatureRoutes);`
3. Call from frontend using fetch or create a custom hook

Example route (backend/src/routes/newfeature.js):
```javascript
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'New feature endpoint' });
});

export default router;
```

## Environment Variables

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
DATABASE_URL=postgresql://fleetflow:fleetflow_password@localhost:5432/fleetflow
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Docker Environment (docker-compose.yml)
The docker-compose.yml automatically sets these environment variables for containerized services.

## Debugging

### Backend Issues

**Check backend logs:**
```bash
# If running locally
cd backend
npm run dev  # Watch console output

# If running in Docker
docker-compose logs -f backend
```

**Test API endpoints:**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test auth endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Frontend Issues

```bash
# Check browser console for errors
# Open http://localhost:3000

# Check network tab for API calls
# Right-click → Inspect → Network tab

# Check React DevTools
# Enable in Chrome Extensions
```

### Database Issues

**Access database with Adminer:**
```
http://localhost:8081

# Login:
Server: postgres (when using Docker)
Username: fleetflow
Password: fleetflow_password
Database: fleetflow
```

**Connect with psql:**
```bash
psql postgresql://fleetflow:fleetflow_password@localhost:5432/fleetflow
```

### Docker Issues

```bash
# View all containers
docker-compose ps

# View full logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild without cache
docker-compose build --no-cache

# Check Docker resources
docker stats
```

## Production Deployment

### Backend Build & Deploy

```bash
cd backend

# Install dependencies
npm install

# Start production server
NODE_ENV=production npm start
```

### Frontend Build & Deploy

```bash
cd frontend

# Build for production
npm run build

# Serve production build
npm start
```

### Docker Production Build

```bash
# Build images
docker-compose build

# Run in production
docker-compose up -d
```

### Environment Setup for Production

1. Set strong `JWT_SECRET` in backend `.env`
2. Set `NODE_ENV=production`
3. Use managed PostgreSQL database (AWS RDS, Azure Database, etc.)
4. Enable HTTPS/SSL on frontend
5. Use environment-specific `.env` files

## Troubleshooting

### "Cannot POST /api/auth/login"
- **Cause:** Backend not running or incorrect API URL
- **Solution:** 
  - Check `REACT_APP_API_URL` in frontend `.env.local`
  - Ensure backend is running: `npm run dev` or Docker container is up
  - Verify port 5000 is not blocked

### "Frontend container not starting"
- **Cause:** npm dependencies conflict or missing packages
- **Solution:** 
  - Rebuild with `npm install --legacy-peer-deps`
  - Delete `node_modules` and reinstall
  - Check Docker logs: `docker-compose logs frontend`

### "Database connection error"
- **Cause:** PostgreSQL not running or wrong credentials
- **Solution:**
  - Check PostgreSQL is running: `docker-compose ps postgres`
  - Verify `DATABASE_URL` in backend `.env`
  - Confirm credentials match docker-compose.yml

### "Port already in use"
- **Cause:** Another service using the same port
- **Solution:**
  ```bash
  # Find process using port
  netstat -ano | findstr :3000  # Frontend
  netstat -ano | findstr :5000  # Backend
  netstat -ano | findstr :5432  # Database
  
  # Kill process
  taskkill /PID <PID> /F
  ```

### "React app shows blank page"
- **Cause:** Build error or incorrect imports
- **Solution:**
  - Check browser console for errors
  - Verify all imports are correct
  - Clear `node_modules` and reinstall with `npm install --legacy-peer-deps`

### "CORS errors when calling API"
- **Cause:** Backend CORS configuration or wrong API URL
- **Solution:**
  - Ensure backend includes `cors` middleware
  - Check `REACT_APP_API_URL` matches backend URL
  - Verify frontend is on correct port

## Next Steps

### Phase 1: Core Features
1. ✅ Set up project structure
2. ✅ Configure Docker environment
3. ⏳ Implement authentication (login/register/logout)
4. ⏳ Database schema and Prisma ORM
5. ⏳ CRUD endpoints for vehicles, trips, drivers

### Phase 2: Frontend Features
1. ⏳ Dashboard with KPI metrics
2. ⏳ Vehicle management interface
3. ⏳ Trip dispatcher and tracking
4. ⏳ Driver profiles and performance
5. ⏳ User settings and profile management

### Phase 3: Advanced Features
1. Real-time updates with WebSockets
2. File upload for documents/photos
3. Export reports (PDF/Excel)
4. Email notifications
5. SMS alerts for trip updates
6. Map integration for GPS tracking

### Phase 4: DevOps & Security
1. Set up automated testing (Jest, React Testing Library)
2. Configure CI/CD pipeline (GitHub Actions)
3. Add API rate limiting and validation
4. Implement request logging and monitoring
5. Set up error tracking (Sentry)
6. Load testing and performance optimization

## Quick Reference

### Useful Commands

```bash
# Docker commands
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # Watch backend logs
docker-compose ps                 # List containers

# Frontend commands
npm start                          # Start dev server (localhost:3000)
npm run build                      # Build for production
npm install --legacy-peer-deps    # Install with peer deps override

# Backend commands
npm run dev                        # Start with nodemon
npm start                          # Start production server

# Database/Adminer
# Access at http://localhost:8081
# Server: postgres, User: fleetflow, Password: fleetflow_password

# Kill port processes
netstat -ano | findstr :3000      # Find process on port 3000
taskkill /PID <PID> /F           # Kill process
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Frontend | React Router | 6.20.0 |
| Frontend | Tailwind CSS | 3.4.1 |
| Frontend | TypeScript | 5.3.3 |
| Backend | Express.js | 4.18.2 |
| Backend | Node.js | 18+ |
| Backend | JWT | 9.0.2 |
| Database | PostgreSQL | 15-alpine |
| ORM | Prisma | 5.8.0 |
| Validation | Zod | 3.22.4 |

### Project Info

- **Repository**: Odoo_FleetFlow
- **Status**: In Development
- **License**: Proprietary
- **Support Files**: 
  - [Problem Statement](docs/problem-statement.md)
  - [Setup Guide](PERN_SETUP.md) (this file)

## Support

For issues or questions:

1. Check the **Troubleshooting** section above
2. Review backend logs: `docker-compose logs backend`
3. Check frontend console: Browser DevTools (F12)
4. Database admin: Visit http://localhost:8081
5. API health check: http://localhost:5000/health

### Common Ports

- **3000**: Frontend (React)
- **5000**: Backend API (Express)
- **5432**: PostgreSQL Database
- **8081**: Adminer (Database UI)
