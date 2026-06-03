# Database Design

This document is an early plan for the future database design.

No database has been set up yet. These notes are only here to guide later implementation.

## Possible Tables

### Food Items

Stores the food a user wants to track.

Possible fields:

- `id`
- `name`
- `category`
- `quantity`
- `unit`
- `location`
- `expiryDate`
- `itemStatus`
- `photoUrl`
- `createdAt`
- `updatedAt`

Possible item statuses:

- `ACTIVE`
- `CONSUMED`
- `WASTED`

Calculated response fields:

- `status`
- `daysUntilExpiry`

The expiry `status` should be calculated from `expiryDate` instead of stored directly in the database.

### Shopping List Items

Stores items the user wants to buy.

Possible fields:

- `id`
- `name`
- `quantity`
- `isPurchased`
- `createdAt`
- `updatedAt`

## Later Database Ideas

Future versions may add users, categories, storage locations, waste reasons, or statistics tables.

These should only be added when the app needs them.
