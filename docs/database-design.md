# Database Design

This document is an early plan for the future database design.

No database has been set up yet. These notes are only here to guide later implementation.

## Possible Tables

### Food Items

Stores the food a user wants to track.

Possible fields:

- `id`
- `name`
- `quantity`
- `expiryDate`
- `status`
- `photoUrl`
- `createdAt`
- `updatedAt`

Possible statuses:

- `active`
- `consumed`
- `wasted`

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
