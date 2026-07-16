# OutreachHub / CareerFlow

OutreachHub (CareerFlow) is a modern, high-performance monorepo application designed to manage, automate, and monitor career outreach, contacts, and campaign analytics.

This repository is structured as a monorepo featuring a **Next.js 15 frontend** and an **Express.js / TypeORM backend**.

---

## 1. Project Architecture (Monorepo)

The repository is organized using `pnpm` workspaces:

```
outreachhub/
├── package.json          # Monorepo scripts (concurrently launches both projects)
├── pnpm-workspace.yaml   # Workspace packages definitions
│
├── backend/              # Node.js / Express.js Backend Package
│   ├── src/
│   │   ├── index.ts      # Server entrypoint
│   │   ├── middleware/   # JWT Authentication & Error Handlers
│   │   ├── core/         # Core API router mounts
│   │   ├── modules/      # Modular Backend Domains
│   │   │   ├── company/  # Company CRUD, Repositories, DTOs, and Validators
│   │   │   ├── import/   # Spreadsheet Parsers, Delimited Email Validators, and Duplicate Checks
│   │   │   └── auth/     # Google OAuth, JWT Strategies, and Session Logins
│   │   └── migrations/   # TypeORM PostgreSQL Schema Migrations
│   └── package.json
│
└── frontend/             # Next.js 15 Frontend Package
    ├── src/
    │   ├── app/          # App Router Paths (Thin Page Shells)
    │   ├── components/   # Shared UI elements (Shadcn components)
    │   └── modules/      # Unified Core Modules
    │       ├── companies/# Company directory table, import wizard, and detail sheets
    │       ├── contacts/ # Linked lead contact profiles and status trackers
    │       └── shared/   # Redux Toolkit Store, Axios apiClient, and Midnight Ink theme
    └── package.json
```

---

## 2. Phase 2: Enterprise Company Import & Management Module

This module serves as the primary CRM core for importing, validating, filtering, and organizing target corporate profiles.

### Key Features
* **5-Step Import Wizard**: Drag-and-drop spreadsheets (`.xlsx`, `.xls`, `.csv`), review parsed tables, map columns with auto-detection/overrides, review live data validator dry-runs, and view progress success summaries.
* **Delimited Email Extractor**: Automatically splits, cleanses, and validates multi-email fields separated by delimiters (e.g. `,`, `/`, `|`, `-`, `_`).
* **High-Speed Duplicate Detector**: Uses in-memory O(1) checks matching Website, Career Page, Email, or Company Name against pre-indexed existing owner records.
* **Transactional Bulk Logs**: Chunk-inserts companies within database transactions, creating detailed batch statistics (`ImportBatch`) and individual row outcome logs (`ImportBatchRow`).
* **Enterprise Listing Table**: A premium sticky-header data grid containing multiple quick-filters, keyword search, row multi-selection, and a sliding drawer for bulk actions (CSV export, bulk archive, bulk soft-delete, and detail generation triggers).
* **Fully Audited Soft Delete**: Implements soft-deletion of company records using TypeORM `@DeleteDateColumn()`, keeping data safe from accidental loss.

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React 19)
- **State Management**: Redux Toolkit
- **API Client**: Axios (with cancellation & global error interceptors)
- **Styling**: Tailwind CSS & Shadcn UI
- **Design System**: Premium **Midnight Ink** dark theme

### Backend
- **Framework**: Express.js (TypeScript)
- **Database ORM**: TypeORM (PostgreSQL)
- **Queue & Workers**: BullMQ (Redis)
- **Parsing**: SheetJS (`xlsx`) for in-memory uploads
- **Validation**: Zod (ZodSchema middleware)

---

## 4. Setup & Installation

### A. Prerequisites
Make sure you have **PostgreSQL** and **Redis** running locally or provisioned in the cloud.

### B. Environment Configuration

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/outreachhub"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
SESSION_SECRET="your-session-secret"
FRONTEND_URL="http://localhost:3000"
```

Create a `.env.local` file inside the `frontend` folder:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

### C. Install Dependencies
Run the installation command in the monorepo root:

```bash
pnpm install
```

### D. Run Database Migrations & Seeds
Push the schema migrations and load testing seed records:

```bash
pnpm db:migrate
pnpm db:seed
```

- **Seed User Email**: `test@outreachhub.dev`
- **Seed User Password**: `password123`

---

## 5. Development Workflows & Scripts

Launch both the Next.js frontend and Express backend concurrently in development mode:

```bash
pnpm dev
```

### Build & Verification
Compile and run static typechecks across both packages to verify code health:

```bash
# Verify backend and frontend builds
pnpm build

# Run TypeScript check on frontend
pnpm --filter outreachhub-frontend typecheck
```
