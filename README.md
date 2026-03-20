# E-commerce Backend

API for the e-commerce platform built with [NestJS](https://nestjs.com/). It powers authentication, user management, and automatic persistence of audit trails for tracked entities.

**Frontend (separate repository):** [github.com/Vitelfs/ecommerce-frontend](https://github.com/Vitelfs/ecommerce-frontend)

## Current features

### JWT authentication (`/auth`)

- **Login** — email and password; returns an **access token** (JWT) and a **refresh token** (stored server-side with expiry). Login is **rate-limited** (stricter throttle) to reduce brute-force risk.
- **Refresh** — issues a new access token using a valid refresh token.
- **Logout** — invalidates the given refresh token.
- **Current user** — `GET /auth/me` returns the authenticated profile (JWT required).

JWT payloads include user identity and role; verification uses **Passport** and **bcrypt** for password checks.

### User registration & management (`/users`)

- **Creating users** — `POST /users` is protected by JWT. Only **Admin** or **SuperAdmin** can create users. The service hashes an **initial password** derived from the new user’s data (CPF/name pattern); the new account is then persisted in PostgreSQL.
- **CRUD** — list, get by id, update, and remove users (JWT required on the controller).

> There is no public self-sign-up endpoint yet; onboarding is modeled as **admin-driven user creation**.

### Automatic audit (`src/audit`)

- A **TypeORM `EntitySubscriber`** listens to **insert**, **update**, and **remove** events on registered entity types.
- For each qualifying change it writes an **`Audit`** row: action (create/update/delete), entity metadata, **old/new snapshots** where applicable, and **`user_id`** when the request context provides it (via **CLS** + `ClsInterceptor`, populated from the authenticated user).
- **`AuditModule`** also exposes REST routes under `/audit` to create and query audit records (useful for admin tooling; tighten with guards in production as needed).

## Stack

- **NestJS 11**, **TypeScript**
- **TypeORM** + **PostgreSQL**
- **@nestjs/jwt**, **passport-jwt**, **bcryptjs**
- **Joi**-validated configuration (`ConfigModule`)
- **Swagger** UI at `/api` (Bearer JWT scheme configured)
- **@nestjs/throttler** (global + stricter limits on login)
- **helmet**, global **ValidationPipe** (whitelist / forbid unknown), global exception filter
- **nestjs-cls** for per-request context (e.g. audit `user_id`)

Optional local infrastructure: **Docker Compose** for PostgreSQL, Redis, and pgAdmin (see `docker-compose.yml`).

## Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- Running **PostgreSQL** (or Compose services) and a filled **environment** file

## Configuration

Copy the example file and set values (see comments in-repo):

```bash
cp .env-example .env.local
```

Required variables include database credentials, `JWT_SECRET`, pgAdmin defaults, and `FRONTEND_URL` (for aligning with the storefront origin). The schema is validated at startup via `src/common/env.validation.ts`.

## Run locally

```bash
cd backend
npm install
# start Postgres (and optional Redis/pgAdmin) if you use Docker:
# docker compose up -d

npm run start:dev
```

- **HTTP:** `http://localhost:3000` (or `PORT` from env)
- **OpenAPI / Swagger:** `http://localhost:3000/api`

Other scripts: `npm run build`, `npm run start:prod`, `npm run lint`, `npm test`, `npm run seed` (database seed, if configured).

## Project layout (high level)

```
src/
  auth/           # JWT, refresh tokens, guards, DTOs
  users/          # User entity, CRUD, admin-only create
  audit/          # Audit entity, subscriber, service, controller
  common/         # Env validation, filters, interceptors
  database/       # TypeORM config, seed
```

---

Developed as the backend counterpart to the [ecommerce-frontend](https://github.com/Vitelfs/ecommerce-frontend) application.
