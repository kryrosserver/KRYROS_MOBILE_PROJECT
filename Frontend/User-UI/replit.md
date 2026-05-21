# KRYROS Mobile Tech — Storefront

A full-featured e-commerce storefront for KRYROS Mobile Tech, a Zambian electronics retailer. Users can browse products, add to cart, checkout, track orders, and manage their account.

## Run & Operate

- `cd Frontend/User-UI && PORT=5000 pnpm --filter @workspace/kryros run dev` — run the storefront (port 5000)
- `pnpm --filter @workspace/api-server run dev` — run the local API server (port 3001)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to Replit's PostgreSQL (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (provision via Replit database tool)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Storefront: Vite + React 19, Tailwind CSS v4, Radix UI, Zustand, TanStack Query, Wouter
- API server: Express 5 (local thin layer)
- DB: PostgreSQL + Drizzle ORM (Replit-provisioned)
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild

## Where things live

- `Frontend/User-UI/artifacts/kryros/` — main React storefront
- `Frontend/User-UI/artifacts/api-server/` — local Express API layer
- `Frontend/User-UI/lib/db/` — Drizzle schema + DB client
- `Frontend/User-UI/lib/api-spec/` — OpenAPI spec + codegen config
- `Backend/` — original NestJS backend (deployed on Render, proxied via Vite at /api)

## Architecture decisions

- Vite dev server proxies `/api` requests to the production NestJS backend at `kryrosbackend-y1c1.onrender.com` — this means the storefront works without running the NestJS backend locally.
- Auth is custom JWT via the external NestJS backend — tokens stored in localStorage/cookies by the frontend.
- The local api-server (`@workspace/api-server`) is a thin Express layer for any future Replit-side endpoints; it currently only exposes a `/api/healthz` endpoint.
- Mobile apps (Flutter in `kryros_mobile_app/` and `kryros_admin_app/`) are not runnable in Replit — they target Android/iOS.
- The admin panel (`Frontend/Admi-Panel/`) is a separate Next.js app not included in the Replit workflow.

## Product

- Browse products by category, brand, search, and filters
- Flash sales, featured products, trending/bestsellers sections
- Cart, checkout, and order tracking
- User dashboard with order history and credits
- Wholesale account management
- Pickup station locator
- Dark/light mode toggle

## User preferences

- Keep the existing external NestJS backend as the API source — do not replace it with a local server.
- The Vite proxy at `/api` handles all backend communication.

## Gotchas

- Always run `cd Frontend/User-UI` before pnpm commands — the workspace root is `Frontend/User-UI/`, not the repo root.
- The `.replit` workflow command already `cd`s into `Frontend/User-UI` automatically.
- If `DATABASE_URL` is not set, the local api-server and db lib will throw on startup — provision the Replit PostgreSQL database first if you need local DB features.
- The `scripts/post-merge.sh` runs `pnpm install --frozen-lockfile` and `pnpm --filter db push` after task merges.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
