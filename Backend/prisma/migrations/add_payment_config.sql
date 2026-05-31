-- Migration: Add Checkout Payment Configuration Tables
-- Run this on your PostgreSQL database (Render/Neon/Supabase etc.)

CREATE TABLE IF NOT EXISTS "checkout_methods" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checkout_methods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "checkout_providers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "checkoutMethodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checkout_providers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "checkout_providers_methodId_fkey" FOREIGN KEY ("checkoutMethodId")
        REFERENCES "checkout_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "checkout_networks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checkout_networks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "checkout_networks_providerId_fkey" FOREIGN KEY ("providerId")
        REFERENCES "checkout_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Seed default checkout methods (idempotent)
INSERT INTO "checkout_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Mobile Money','mobile_wallet',0,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "checkout_methods" WHERE "name"='Mobile Money');

INSERT INTO "checkout_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Credit/Debit Card','card',1,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "checkout_methods" WHERE "name"='Credit/Debit Card');

INSERT INTO "checkout_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Bank Transfer','bank',2,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "checkout_methods" WHERE "name"='Bank Transfer');

INSERT INTO "checkout_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'Cash on Delivery','cash',3,true,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "checkout_methods" WHERE "name"='Cash on Delivery');

INSERT INTO "checkout_methods" ("id","name","type","sortOrder","isEnabled","updatedAt")
SELECT gen_random_uuid()::text,'PayPal','digital_wallet',4,false,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "checkout_methods" WHERE "name"='PayPal');

-- Seed Bank Transfer with default Stanbic Bank account
-- Run AFTER inserting checkout_methods
DO $$
DECLARE
  bank_id TEXT;
BEGIN
  SELECT id INTO bank_id FROM "checkout_methods" WHERE "name" = 'Bank Transfer' LIMIT 1;
  IF bank_id IS NOT NULL THEN
    INSERT INTO "checkout_providers" ("id","checkoutMethodId","name","config","isEnabled","updatedAt")
    SELECT gen_random_uuid()::text, bank_id, 'Stanbic Bank Zambia',
           '{"accountName":"KRYROS LIMITED","accountNumber":"91200012345667"}'::jsonb,
           true, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
      SELECT 1 FROM "checkout_providers" WHERE "checkoutMethodId" = bank_id
    );
  END IF;
END $$;
