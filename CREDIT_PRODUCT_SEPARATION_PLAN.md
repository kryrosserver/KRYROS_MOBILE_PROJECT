# KRYROS Credit Products Separation Plan

## Current System Overview

Currently, the system has:
- Products with `allowCredit: boolean` field
- Products can be purchased on credit if `allowCredit = true`
- Credit products are mixed with regular products in the shop

## Client Requirement

**Separate Credit Installment Products from Normal Products**

This means:
1. Credit-eligible products should have their own **dedicated section/page**
2. They should NOT be mixed with regular products in the main shop
3. Admin should be able to easily mark products as "credit-eligible"
4. Customer experience should clearly show which products are available for credit/installments

---

## Implementation Plan

### Option A: Simple - Add Filter/Tab in Shop Page (Recommended for Quick Launch)

Keep the existing product structure but add:
- **"Credit Products" tab/filter** in the shop page
- Products with `allowCredit = true` appear in this tab
- Quick toggle in admin product form

**Changes needed:**
1. Admin: Add credit toggle in product form
2. Frontend: Add "Credit Products" tab in shop page
3. Backend: Add filter for credit products in API

---

### Option B: Dedicated Credit Store Section

Create a completely separate product category structure:
- **"Credit Store"** as a main navigation item
- Separate product listing page
- Dedicated credit product management in admin

**Changes needed:**
1. Add new field: `productType: "normal" | "credit" | "both"`
2. Create `/credit-shop` page (or use existing `/credit`)
3. Admin: Add product type selector in product form
4. Backend: New API endpoints for credit products

---

### Option C: Advanced - Credit-Specific Product Fields

Enhance credit products with more detailed credit information:
- Minimum down payment amount
- Available installment periods (3, 6, 9, 12 months)
- Interest rates
- Credit-specific pricing

**Changes needed:**
1. Add credit-specific fields to Product model
2. Create credit pricing calculator
3. Enhanced credit product page with installment breakdown
4. Admin: Detailed credit configuration per product

---

## Recommended Approach

### For KRYROS, I recommend **Option B (Dedicated Credit Store)** because:

1. ✅ **Clear separation** - Customers easily find credit products
2. ✅ **Better UX** - Dedicated credit page with installment calculator
3. ✅ **Admin control** - Mark products as credit-only, normal-only, or both
4. ✅ **Scalable** - Can add credit-specific features later
5. ✅ **Business logic** - Some products may not be suitable for credit

---

## Implementation Steps (Option B)

### 1. Database Changes
```prisma
// Add to Product model
productType        ProductType   @default(NORMAL)
creditMinDownPayment Decimal?     @db.Decimal(10, 2)
creditMonths       Int[]         // Available months: [3, 6, 9, 12]
creditInterestRate  Decimal?     @db.Decimal(5, 2)

enum ProductType {
  NORMAL
  CREDIT_ONLY
  BOTH
}
```

### 2. Backend API Changes
- Add `productType` filter in products API
- Create `/products/credit` endpoint
- Add credit product management in admin

### 3. Frontend Changes
- Add "Credit Store" to navigation
- Create `/credit-products` page
- Add credit toggle in admin product form
- Show installment calculator on credit products

### 4. Admin Panel
- Add product type selector (Normal / Credit Only / Both)
- Credit product list view
- Bulk credit enable/disable

---

## What Do You Want to Proceed With?

Please let me know:

1. **Which option do you prefer?**
   - A: Simple tab/filter in shop
   - B: Dedicated credit store (recommended)
   - C: Advanced with detailed credit fields

2. **What's your timeline?**
   - Quick launch (A)
   - Standard (B)
   - Full featured (C)

3. **Any specific credit terms you want?**
   - Down payment percentage
   - Installment months
   - Interest rates

Once you confirm, I'll implement the full solution!
