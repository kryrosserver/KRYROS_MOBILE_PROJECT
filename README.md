# KRYROS Mobile Tech - Enterprise Commerce Platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

#### 1. Install Frontend Dependencies
```bash
cd Frontend/User UI
npm install
```

#### 2. Install Backend Dependencies
```bash
cd Backend
npm install
```

#### 3. Configure Environment Variables
```bash
# Backend
cp Backend/.env.example Backend/.env
# Edit .env with your database URL and other settings
```

#### 4. Setup Database
```bash
cd Backend
npx prisma generate
npx prisma migrate dev
```

#### 5. Run Development Servers

**Frontend:**
```bash
cd Frontend/User UI
npm run dev
# Opens at http://localhost:3000
```

**Backend:**
```bash
cd Backend
npm run start:dev
# API at http://localhost:4000
# Swagger docs at http://localhost:4000/api/docs
```

---

## 📁 Project Structure

```
KRYROS_MOBILE_PROJECT/
├── Frontend/
│   └── User UI/
│       └── src/
│           ├── app/           # Next.js App Router pages
│           ├── components/    # React components
│           ├── providers/     # Context providers
│           ├── lib/          # Utilities
│           ├── hooks/        # Custom hooks
│           ├── store/        # Zustand stores
│           └── types/        # TypeScript types
├── Backend/
│   └── src/
│       ├── auth/             # Authentication module
│       ├── users/           # User management
│       ├── products/         # Product catalog
│       ├── orders/           # Order processing
│       ├── credit/           # Credit/installments
│       ├── wallet/           # Wallet service
│       ├── wholesale/        # Wholesale module
│       ├── services/        # Service bookings
│       ├── cms/              # Content management
│       ├── payments/         # Payment processing
│       └── prisma/          # Database service
└── Infrastructure/
    └── docker/               # Docker configs
```

---

## 🎨 Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Shadcn UI
- Framer Motion
- Zustand (State Management)
- React Query

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI

---

## 🔑 Features

- ✅ Multi-service e-commerce (Retail, Wholesale, Software, Services)
- ✅ Credit/Installment System (Buy Now, Pay Later)
- ✅ User Dashboard with Order Tracking
- ✅ Admin Panel with Dynamic CMS
- ✅ Payment Integration (Paystack, Flutterwave)
- ✅ Mobile-Responsive Design

---

## 📞 Support

- Email: kryrosmobile@gmail.com
- Phone: +260 966 423 719

---

© 2024 KRYROS MOBILE TECH LIMITED. All rights reserved.
