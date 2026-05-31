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
- `GET /api/foods/use-first`
- `POST /api/foods`
- `GET /api/foods/:id`
- `PATCH /api/foods/:id`
- `DELETE /api/foods/:id`
- `PATCH /api/foods/:id/consume`
- `PATCH /api/foods/:id/waste`

`PATCH /api/foods/:id` can update `name`, `category`, `quantity`, `unit`, `location`, and `expiryDate`.
Use the consume and waste endpoints to change `itemStatus`.

`GET /api/foods/use-first` returns active, non-expired foods ordered by the closest expiry date.

Validation notes:

- `name` is required and cannot be empty.
- `expiryDate` is required and must use `YYYY-MM-DD`.
- `quantity`, when provided, must be a positive number.

Optional query parameters:

- `GET /api/foods?sort=expiryDate` returns foods ordered by expiry date, with the soonest expiry first.
- `GET /api/foods?status=EXPIRING_SOON` returns foods with a matching expiry status.
- `GET /api/foods?itemStatus=ACTIVE` returns foods with a matching item status.
- `GET /api/foods?status=EXPIRING_SOON&sort=expiryDate` filters by status and sorts by expiry date.
- `GET /api/foods?itemStatus=ACTIVE&status=EXPIRING_SOON&sort=expiryDate` combines item status filtering, expiry status filtering, and sorting.

Temporary food item fields:

- `id`
- `name`
- `category`
- `quantity`
- `unit`
- `location`
- `expiryDate`
- `status`
- `itemStatus`

Temporary expiry status values:

- `SAFE`
- `EXPIRING_SOON`
- `EXPIRED`

Temporary item status values:

- `ACTIVE`
- `CONSUMED`
- `WASTED`

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
