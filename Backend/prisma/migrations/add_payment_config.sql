-- Migration: Add Payment Config Tables
-- Run this manually on your PostgreSQL database

CREATE TABLE IF NOT EXISTS "payment_methods" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payment_providers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "paymentMethodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_providers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payment_providers_methodId_fkey" FOREIGN KEY ("paymentMethodId")
        REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "payment_networks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_networks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payment_networks_providerId_fkey" FOREIGN KEY ("providerId")
        REFERENCES "payment_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Seed default payment methods (idempotent)
INSERT INTO "payment_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Mobile Money','mobile_wallet',0,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "payment_methods" WHERE "name"='Mobile Money');

INSERT INTO "payment_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Credit/Debit Card','card',1,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "payment_methods" WHERE "name"='Credit/Debit Card');

INSERT INTO "payment_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Bank Transfer','bank',2,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "payment_methods" WHERE "name"='Bank Transfer');

INSERT INTO "payment_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Cash on Delivery','cash',3,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "payment_methods" WHERE "name"='Cash on Delivery');

INSERT INTO "payment_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'PayPal','digital_wallet',4,false,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "payment_methods" WHERE "name"='PayPal');
