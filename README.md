# Food Waste Tracker

Food Waste Tracker is a learning-focused portfolio project for building a mobile-first web app that helps users reduce food waste.

The app will eventually allow users to manage food items, track expiry dates, keep a shopping list, attach food photos, and view waste statistics.

## Current Status

This project currently has project documentation, a basic Express backend, and an initial Prisma schema for PostgreSQL.

The backend routes still use temporary in-memory food data so REST API concepts can be learned before connecting them to the database.

No frontend, authentication, image upload, or live database connection has been created yet. The first database migration exists but has not been applied.

## Planned Stack

- React frontend
- Node.js and Express backend
- PostgreSQL database
- Prisma ORM
- Tailwind CSS for styling
- REST API architecture
- Future PWA support

## Planned Features

- Add food items
- Track expiry dates
- See which foods expire soon
- Mark food as consumed or wasted
- Manage a shopping list
- Upload or attach food photos in a later version
- View food waste statistics in a later version

## Project Structure

- `client/` - future React frontend
- `server/` - future Node.js and Express backend
- `docs/` - planning and learning documentation

## Backend Status

The backend currently includes:

- Express app setup
- health endpoint
- temporary food CRUD routes
- expiry status calculations
- food filtering, sorting, and stats
- request logging
- JSON responses for unknown routes
- safe environment variable examples in `server/.env.example`
- initial PostgreSQL and Prisma schema for food items
- first database migration for the `Food` table
- shared Prisma Client setup for future database queries

The next major backend step is applying the migration to a local PostgreSQL database, then replacing the in-memory food queries with Prisma Client queries.

Useful backend commands:

- `npm run dev` - run the backend in watch mode
- `npm run start` - run the backend normally
- `npm run check` - check backend JavaScript syntax
- `npm test` - run backend API integration tests
- `npm run db:format` - format the Prisma schema
- `npm run db:generate` - generate the Prisma Client used by the backend
- `npm run db:validate` - validate the Prisma schema
- `npm run db:migrate:dev` - create and apply migrations during local development
- `npm run db:migrate:status` - show which migrations have been applied
- `npm run db:migrate:deploy` - apply existing migrations without creating new ones

Prisma commands require a local `DATABASE_URL`. A safe placeholder format is documented in `server/.env.example`; no real credentials are committed.

## Documentation

- [Project idea](docs/idea.md)
- [Requirements](docs/requirements.md)
- [Database design](docs/database-design.md)
- [API endpoints](docs/api-endpoints.md)
- [Learning log](docs/learning-log.md)

## Learning Goal

The goal of this project is to build the app step by step while learning how a full-stack web application is planned, implemented, tested, and improved over time.
