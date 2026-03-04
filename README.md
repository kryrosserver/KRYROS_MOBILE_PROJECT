# KRYROS MOBILE - E-Commerce + Fintech Platform

A comprehensive multi-service commerce + fintech platform for **KRYROS MOBILE TECH LIMITED**.

## 🚨 IMPORTANT: Folder Rename Required

The deployment platform does not support folder names with spaces. **You must rename the folder locally before deploying:**

### Manual Fix Required:

```bash
# Navigate to Frontend folder
cd Frontend

# Rename "User UI" to "User-UI" (replace space with hyphen)
# Windows:
ren "User UI" "User-UI"

# Linux/Mac:
mv "User UI" "User-UI"
```

Then update your `package.json` scripts if needed, and push the changes.

---

## 📦 GitHub Repository
https://github.com/StarkTol/KRYROS_MOBILE_PROJECT

---

## 🏗️ Project Structure

```
KRYROS_MOBILE_PROJECT/
├── Backend/                 # NestJS API Server
│   ├── prisma/             # Database schema
│   └── src/                # API modules
├── Frontend/
│   ├── User UI/           # Customer-facing app (PORT 3000)
│   └── Admin Panel/       # Admin dashboard (PORT 3001)
└── Infrastructure/         # Docker configs
```

---

## ✨ Features

- **E-Commerce:** Product catalog, cart, wishlist, orders
- **Fintech:** Buy Now Pay Later, credit profiles, installments
- **Wholesale:** Bulk pricing, MOQ, distributor accounts
- **Admin Panel:** Full CMS, analytics, user management

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/StarkTol/KRYROS_MOBILE_PROJECT.git
cd KRYROS_MOBILE_PROJECT

# Install dependencies
cd Frontend/User UI && npm install
cd ../../Backend && npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
# Copy environment file
cp Backend/.env.example Backend/.env

# Update .env with your database URL
# Then run migrations
cd Backend
npx prisma migrate dev
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend (Port 3000)
cd Backend && npm run start:dev

# Terminal 2 - User UI (Port 3000)
cd Frontend/User UI && npm run dev

# Terminal 3 - Admin Panel (Port 3001)
cd Frontend/Admin Panel && npm run dev
```

### 4. Access

- **User UI:** http://localhost:3000
- **Admin Panel:** http://localhost:3001

---

## 🔧 Deployment (Render.com)

1. Create a PostgreSQL database on Render
2. Connect GitHub repository
3. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Random string for JWT tokens
4. Deploy using `render.yaml` or manual setup

---

## 📄 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT |
| Payments | Paystack, Flutterwave |

---

## 📧 Contact

**KRYROS MOBILE TECH LIMITED**
- Phone: +260966423719
- Email: kryrosmobile@gmail.com
