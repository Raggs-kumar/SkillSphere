# SkillSphere

Hyperlocal freelance platform — **Next.js** frontend + **Express/MongoDB** API.

## Features

- Role-based auth (client, freelancer, admin)
- Clients post projects and view contracts
- Freelancers browse gigs, save projects, submit proposals
- Admin dashboard with user management, stats, and moderation queue
- JWT auth with secure env configuration

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Quick start

### 1. Backend

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/skillsphere
JWT_SECRET=your-long-random-secret-at-least-32-characters
FRONTEND_URL=http://localhost:3000
ADMIN_PASSWORD=YourStrongAdminPassword1!
```

```bash
npm install
npm run seed          # Create admin user
npm run dev           # Start API on :5000
```

Optional demo projects (after registering a **client** account):

```bash
npm run seed:demo
```

### 2. Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev           # Start app on :3000
```

### 3. Use the app

| Role | How to access |
|------|----------------|
| **Admin** | `npm run seed` in backend, then login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` |
| **Client** | Register at `/register` → choose Client |
| **Freelancer** | Register at `/register` → choose Freelancer |

## API routes

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET/PUT | `/api/users/profile` | Private |
| GET | `/api/users` | Admin |
| POST/GET | `/api/projects/*` | Client / Freelancer |
| POST/GET | `/api/proposals/*` | Freelancer |
| GET/PATCH | `/api/notifications` | Private |
| GET/PATCH | `/api/admin/*` | Admin |

## Project structure

```
backend/
  config/       env, database
  constants/    shared validation rules
  controllers/  HTTP handlers
  middleware/   auth, errors
  models/       User, Project, Proposal, Notification
  routes/       API routers
  services/     business logic
  scripts/      seed utilities

frontend/
  app/          Next.js pages
  components/   UI, layout, auth
  lib/          API client, roles, cookies
  store/        Redux auth state
  middleware.js route protection (cookie)
```

## Production notes

- Set `NODE_ENV=production` and require `MONGO_URI` + `JWT_SECRET`
- Use HTTPS and `FRONTEND_URL` for CORS
- Never commit `.env` files
