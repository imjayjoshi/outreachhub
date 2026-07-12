# CareerFlow

CareerFlow is a modern, high-performance web application designed to manage, automate, and monitor career outreach and campaign analytics.

It is built with **Next.js 15 (App Router)**, **React 19**, **Prisma ORM 7 (Neon Serverless PostgreSQL)**, **Redux Toolkit**, **NextAuth.js v5**, and styled with **Tailwind CSS v4** featuring the premium **Midnight Ink** design system.

---

## 1. Directory Architecture (Modular Monolith)

This application adheres to an industry-standard **Modular Monolith** structure under the `src/` directory. All features and domains are encapsulated within self-contained modules to prevent imports spaghetti and maintain clear boundaries.

```
src/
├── app/                  # Route Definitions (Thin Page Shells only)
│   ├── api/auth/         # NextAuth handler routes
│   ├── (app)/            # Authenticated App Route Group
│   │   ├── companies/    # Companies page
│   │   ├── contacts/     # Contacts page
│   │   └── dashboard/    # Dashboard overview page
│   ├── login/            # Login view shell
│   └── layout.tsx        # Root HTML Layout, wraps RootProvider
│
├── components/           # General Shared UI components (Shadcn/UI components)
│   └── ui/               # Lower-level design building blocks (button, inputs, etc.)
│
├── lib/                  # Central utility helpers (e.g., standard cn utility)
│   └── utils.ts
│
└── modules/              # Unified Core Modules
    ├── auth/             # Encapsulates Login components, validators, and auth syncing
    │   ├── components/   # LoginPage view
    │   ├── providers/    # AuthSync component (synchronizes NextAuth session to Redux)
    │   ├── redux/        # authSlice state & actions
    │   ├── schemas/      # Yup Formik validation schemas
    │   ├── auth.ts       # Node-based credentials authorization handler
    │   ├── auth.config.ts# Edge-compatible NextAuth path authorization callbacks
    │   └── index.ts      # Public API gateway (Public exports for other modules)
    │
    ├── companies/        # Encapsulates Companies views, bulk CSV import APIs, and mutations
    │   ├── components/   # CompanyList, AddEditCompany views
    │   ├── queries/      # db mutations and queries for companies
    │   └── index.ts      # Public API gateway
    │
    ├── contacts/         # Handles lead contacts, details, and association queries
    │   ├── components/   # ContactsTable, AddEditContact views
    │   └── index.ts      # Public API gateway
    │
    ├── dashboard/        # Encapsulates Layout, Navigation Drawer, and metrics widgets
    │   ├── components/   # AppShell layout, DashboardClient panels
    │   ├── config/       # vertical menu items setup
    │   └── index.ts      # Public API gateway
    │
    ├── leads/            # Workflows for leads scrapers, web crawler engines (Clutch), and schedulers
    │   ├── discovery/    # clutchService, searchService engines
    │   ├── jobs/         # scheduler, trigger, and dailyFetchJob worker setup
    │   └── index.ts      # Public API gateway
    │
    └── shared/           # Cross-cutting concerns and core infrastructure
        ├── api/          # Central Axios API client
        ├── database/     # Prisma database & Redis cache connections
        ├── providers/    # RootProvider (AuthProvider + ReduxProvider + AuthSync)
        ├── redux/        # Main Redux Store definition & UI slice
        └── index.ts      # Public API gateway
```

### Module Boundary Rules

- Every module exposes a public entry point (`src/modules/<module-name>/index.ts`).
- Other modules or routing files **must** only import assets, slices, hooks, or components from this high-level gateway (e.g., `import { LoginPage } from "@/modules/auth"`).
- Avoid deep imports (e.g., `import ... from "@/modules/auth/components/LoginPage"`) to maintain high cohesion and clear modular decoupling.

---

## 2. Shared Axios API Client

All server and environment-safe requests are routed through the central master API client located in **`src/modules/shared/api/apiClient.ts`**:

- **Environment Agnostic**: Fully safe for both server-side execution (Server Components/Actions) and client-side execution.
- **Auto Base URL**: Prefixes endpoints with `/api` or the defined environment variables.
- **Cancel Interceptors**: Automatically ignores aborted/cancelled requests during page transitions to prevent false-alarm console warning logs.
- **Global Interceptors**:
  - **Request Interceptor**: Configured to dynamically append authorization tokens or request parameters.
  - **Response Interceptor**: Centralizes global error codes handling (such as logging warnings on `401 Unauthorized` or displaying errors on `500 Server Errors`).

---

## 3. Design System & Theme (Midnight Ink)

We use the customized **Midnight Ink** dark palette. Standard shadcn elements and Tailwind variables map directly to default `:root` variables defined in `src/app/globals.css`:

- **Typography**: **Poppins** is set globally on the `<body>` element.
- **Colors**:
  - **Background**: `#0B0F14` (`bg-midnight-bg`)
  - **Surface**: `#141A22` (`bg-midnight-surface`)
  - **Card**: `#1A2230` (`bg-midnight-card`)
  - **Primary (Accent Blue)**: `#5A8DFF` (`bg-midnight-primary`)
  - **Secondary (Teal/Cyan)**: `#4FD1C5` (`text-midnight-secondary`)
  - **Border**: `#2B3442` (`border-midnight-border`)
  - **Text**: `#F8FAFC`
  - **Muted**: `#94A3B8` (`text-midnight-muted`)

---

## 4. Setup & Installation

### A. Environment Configuration

Create a `.env` file in the root directory and define the following:

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="your-super-secret-random-key"
NEXTAUTH_URL="http://localhost:3000"
```

### B. Install Dependencies

```bash
pnpm install
```

### C. Initialize Database & Seed

Prisma 7 connection settings are configured inside `prisma.config.ts` and loaded dynamically. The client is generated in the standard `node_modules` path:

```bash
# Push schema migrations
pnpm prisma db push

# Generate client
pnpm prisma generate

# Seed test users
pnpm prisma db seed
```

- **Test Email**: `test@outreachhub.dev`
- **Test Password**: `password123`

---

## 5. Development Workflows & Scripts

Run the development server locally:

```bash
pnpm dev
```

### Quality Tooling

Before making commits, Husky triggers ESLint fixes and Prettier formatting automatically on modified files.

- **Typecheck**: `pnpm typecheck` (runs `tsc --noEmit` to validate all TypeScript code).
- **Linting**: `pnpm lint` (runs ESLint on the source directory).
- **Format**: `pnpm format` (runs Prettier validation).
