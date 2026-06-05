# Database Design

This document tracks the database design for the project.

An initial PostgreSQL schema and first migration have been created with Prisma. The migration has not been applied because a local PostgreSQL server is not set up yet.

The existing API routes still use temporary in-memory food data. They will be moved to PostgreSQL gradually after the first migration.

## Current Setup

- `server/prisma/schema.prisma` defines the database model.
- `server/prisma.config.ts` tells Prisma where the schema and future migrations live.
- `server/prisma/migrations/20260605000000_init_food/migration.sql` creates the first database table.
- `server/src/config/database.js` creates the shared Prisma Client used for future queries.
- `server/.env.example` documents the required `DATABASE_URL` format without real credentials.
- `npm run db:format` formats the schema.
- `npm run db:generate` generates the Prisma Client from the schema.
- `npm run db:validate` checks that the schema is valid.
- `npm run db:migrate:dev` creates and applies migrations during development.
- `npm run db:migrate:status` checks which migrations have been applied.
- `npm run db:migrate:deploy` applies migrations that already exist.

Prisma commands require `DATABASE_URL` to be available in the local environment. The project does not commit a real `.env` file.

## Query Flow

The Express routes still read and update the temporary array in `server/src/data/foods.data.js`.

After PostgreSQL is available, the routes will gradually use the shared Prisma Client from `server/src/config/database.js`. Prisma Client is the ORM query layer: it converts JavaScript operations into PostgreSQL queries.

Example future query:

```js
const prisma = require("../config/database");

const foods = await prisma.food.findMany();
```

The generated Prisma Client lives in `server/src/generated/prisma/`. It is generated code, so it is ignored by Git and should not be edited manually.

Before applying the migration locally:

1. Install and start PostgreSQL.
2. Create an empty `food_expiry_tracker` database.
3. Configure a local, untracked `DATABASE_URL` using the format in `server/.env.example`.
4. Run `npm run db:migrate:dev` from the `server/` folder.

## Current Prisma Model

### Food

Stores the food a user wants to track.

Current stored fields:

- `id` - automatically generated integer
- `name` - required food name
- `category` - defaults to `Uncategorized`
- `quantity` - positive number handled by API validation
- `unit` - defaults to `item`
- `location` - defaults to `Unknown`
- `expiryDate` - PostgreSQL date
- `itemStatus` - defaults to `ACTIVE`
- `createdAt` - automatically set when the item is created
- `updatedAt` - automatically updated when the item changes

Current item statuses:

- `ACTIVE`
- `CONSUMED`
- `WASTED`

Calculated response fields:

- `status`
- `daysUntilExpiry`

The expiry `status` should be calculated from `expiryDate` instead of stored directly in the database.

## Planned Tables

### Shopping List Item

Stores items the user wants to buy.

Possible fields:

- `id`
- `name`
- `quantity`
- `isPurchased`
- `createdAt`
- `updatedAt`

## Later Database Ideas

Future versions may add users, categories, storage locations, waste reasons, photo URLs, or statistics tables.

These should only be added when the app needs them.
