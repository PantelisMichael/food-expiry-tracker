# Food Waste Tracker

Food Waste Tracker is a learning-focused portfolio project for building a mobile-first web app that helps users reduce food waste.

The app will eventually allow users to manage food items, track expiry dates, keep a shopping list, attach food photos, and view waste statistics.

## Current Status

This project currently has project documentation and a basic Express backend.

The backend uses temporary in-memory food data so REST API concepts can be learned before connecting a real database.

No frontend, database, authentication, image upload, or Prisma setup has been created yet.

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

The next major backend step is PostgreSQL and Prisma setup.

Useful backend commands:

- `npm run dev` - run the backend in watch mode
- `npm run start` - run the backend normally
- `npm run check` - check backend JavaScript syntax
- `npm test` - run backend API integration tests

## Documentation

- [Project idea](docs/idea.md)
- [Requirements](docs/requirements.md)
- [Database design](docs/database-design.md)
- [API endpoints](docs/api-endpoints.md)
- [Learning log](docs/learning-log.md)

## Learning Goal

The goal of this project is to build the app step by step while learning how a full-stack web application is planned, implemented, tested, and improved over time.
