# Food Expiry Tracker

Food Expiry Tracker is a learning-focused portfolio project for building a mobile-first full-stack web app that helps users manage food at home, track expiry dates, and reduce food waste.

## Current Status

The project currently has:

- a React and Vite frontend
- an Express REST API
- food CRUD, filtering, sorting, expiry calculations, and summary statistics
- switchable in-memory and PostgreSQL data sources
- a Prisma schema, migration, seed script, and database integration test
- backend automated tests

Authentication, shopping lists, image support, AI features, and PWA support have not been implemented yet.

## Current Stack

- React with Vite
- Node.js with Express
- PostgreSQL with Prisma
- Plain CSS
- REST API architecture

## Project Structure

- `client/` - React frontend
- `server/` - Express backend, Prisma files, and backend tests
- `docs/` - project planning and learning documentation

## Run The Project

Install dependencies in both applications:

```bash
cd server
npm install

cd ../client
npm install
```

Start the backend in its default in-memory mode:

```bash
cd server
npm run dev
```

The backend runs at `http://localhost:3001`.

In another terminal, start the frontend:

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173`. Vite forwards `/api` requests to the backend.

## Data Sources

The backend supports two data-source modes:

- `DATA_SOURCE=memory` uses temporary in-memory data and is the default.
- `DATA_SOURCE=database` uses Prisma and PostgreSQL and requires `DATABASE_URL`.

Safe example values are documented in `server/.env.example`. Do not commit real database credentials or other secrets.

## Verification

Run backend syntax checks and memory-mode tests:

```bash
cd server
npm run check
npm test
```

Run the database integration test after configuring a local database:

```bash
cd server
npm run test:database
```

Create a production frontend build:

```bash
cd client
npm run build
```

Run frontend automated tests:

```bash
cd client
npm test
```

## Useful Database Commands

Run these commands from `server/`:

- `npm run db:generate` - generate Prisma Client
- `npm run db:validate` - validate the Prisma schema
- `npm run db:migrate:dev` - create and apply migrations during development
- `npm run db:migrate:deploy` - apply existing migrations
- `npm run db:migrate:status` - show migration status
- `npm run db:seed` - add development seed data

Database commands require a local `DATABASE_URL`. The local PostgreSQL database itself is not stored in Git.

## Documentation

- [Project idea](docs/idea.md)
- [Requirements](docs/requirements.md)
- [Database design](docs/database-design.md)
- [API endpoints](docs/api-endpoints.md)

## Learning Goal

The goal is to build the app step by step while learning how a full-stack web application is planned, implemented, tested, and improved over time.
