# API Endpoints

This document tracks the REST API endpoints for the Food Expiry Tracker backend.

The backend currently uses temporary in-memory data. Later, these routes will use PostgreSQL and Prisma.

## Health

Implemented endpoint:

- `GET /api/health`

Returns a simple response confirming that the API is running.

## Food Items

Implemented endpoints:

- `GET /api/foods`
- `POST /api/foods`
- `GET /api/foods/:id`

Temporary food item fields:

- `id`
- `name`
- `category`
- `quantity`
- `unit`
- `location`
- `expiryDate`
- `status`

Temporary expiry status values:

- `SAFE`
- `EXPIRING_SOON`
- `EXPIRED`

Planned later endpoints:

- `PATCH /api/foods/:id`
- `DELETE /api/foods/:id`
- `PATCH /api/foods/:id/consume`
- `PATCH /api/foods/:id/waste`

## Shopping List

Planned later endpoints:

- `GET /api/shopping-list`
- `POST /api/shopping-list`
- `PATCH /api/shopping-list/:id`
- `DELETE /api/shopping-list/:id`

## Later Endpoints

Later versions may add endpoints for:

- photo upload or attachment
- waste statistics
- filtering foods by expiry date
- categories or storage locations

## Notes

The final endpoint names and request bodies can change when the backend is actually implemented.
