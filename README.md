# Personal Finance Tracker - Backend

This is the backend API for a personal finance tracking application built with Express.js, PostgreSQL, JWT, and TypeScript. It handles user auth, accounts, transactions, budgets, categories, and dashboard data.

# Development mode (recommended - with ts-node-dev or nodemon)

npm run dev

# or

yarn dev

# or

pnpm dev
→ server starts on http://localhost:5000

# Build TypeScript → JavaScript

npm run build

# or

yarn build

# or

pnpm build

# Start production server (after build)

npm start

# or

yarn start

# or

pnpm start
→ server starts on http://localhost:5000

## Features

- User registration/login with JWT auth
- CRUD for accounts, transactions, categories, budgets
- Dashboard analytics (stats, trends, summaries)
- Budget alerts
- Transaction summaries
- Profile management and password change

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL (with pg driver)
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Custom logger
- **Types**: TypeScript
- **Other**: Helmet (security), CORS

## Architecture Overview

- **Routes**: Modular routes in `/routes` (e.g., `auth.routes.ts`, `account.routes.ts`).
- **Controllers**: Handle requests in `/controllers` (e.g., `account.controller.ts` with Zod validation).
- **Services**: Business logic in `/services` (e.g., `account.service.ts` with DB queries/transactions).
- **Middleware**: Auth (`auth.middleware.ts`), Errors (`error.middleware.ts`), Validation (`validation.middleware.ts`).
- **Config**: Database pool in `/config/database.ts`, Logger in `/config/logger.ts`.
- **Utils**: Helpers in `/utils` (e.g., `jwt.utils.ts`, `password.utils.ts`, `apiResponse.utils.ts`).
- **Types**: Shared types in `/types/index.ts`.
- **Error Handling**: Custom AppError class, global handler.
- **Database**: Connection pool with query wrapper for logging/errors.
- **Deployment**: Suitable for Heroku (with Procfile, buildpacks for Node.js/Postgres).

The app follows MVC-like structure: Routes → Controllers (validate) → Services (DB logic) → Responses.

## Setup Instructions

1. **Prerequisites**:
   - Node.js >= 18.x
   - PostgreSQL >= 14.x
   - npm or yarn

2. **Clone and Install**:
