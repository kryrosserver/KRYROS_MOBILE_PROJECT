# Database Fix Guide

## The Problem
Several tables are missing or have wrong schema in the database. This is causing 500 errors when trying to create records.

## Solution: Run this SQL in Neon SQL Editor

**Delete ALL tables to let Prisma recreate them correctly:**

```sql
-- Drop all tables that might have wrong schema
DROP TABLE IF EXISTS "shipping_methods" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "wallets" CASCADE;
DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "credit_profiles" CASCADE;
DROP TABLE IF EXISTS "credit_accounts" CASCADE;
DROP TABLE IF EXISTS "cMS_pages" CASCADE;
DROP TABLE IF EXISTS "cMS_sections" CASCADE;
DROP TABLE IF EXISTS "cMS_banners" CASCADE;
DROP TABLE IF EXISTS "addresses" CASCADE;
DROP TABLE IF EXISTS "wishlist_items" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "service_bookings" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "wholesale_accounts" CASCADE;
DROP TABLE IF EXISTS "wholesale_prices" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "support_tickets" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
```

After running this SQL, Prisma will automatically recreate all tables with the correct schema when you call any API endpoint.

This is the fastest way to fix the database - just drop all tables and let Prisma recreate them.
