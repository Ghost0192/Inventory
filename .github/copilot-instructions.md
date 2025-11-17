# Inventory Management System - AI Coding Agent Instructions

## Project Overview
This is a Next.js 16 + TypeScript inventory management application with role-based access control (RBAC). It features Supabase for authentication and database, Tailwind CSS for styling, and Radix UI components. The app supports three user roles with distinct workflows.

## Tech Stack & Key Tools
- **Framework**: Next.js 16 (App Router, Server/Client components)
- **Language**: TypeScript 5 with strict mode enabled
- **UI Library**: Radix UI + custom shadcn components
- **Styling**: Tailwind CSS 4 with PostCSS
- **Database & Auth**: Supabase (Auth + PostgreSQL)
- **Utilities**: QR code generation (`qrcode`, `html5-qrcode`), Barcode (`jsbarcode`), Charts (`recharts`)
- **Path Alias**: `@/` maps to `./src/`

**Build Commands:**
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm start        # Run production build
npm run lint     # Run ESLint
```

## Architecture Pattern: Role-Based View Strategy

The dashboard implements a **single-entry routing pattern** where authentication and role detection happen at `/dashboard`, then render appropriate views:

```
/dashboard (page.tsx)
  ├─ Checks Supabase auth session
  ├─ Fetches user role from a_usuarios table
  └─ Conditionally renders:
      ├─ AdminView (admin, gerente)
      ├─ AlmacenistaView (almacenista)
      └─ SolicitanteView (solicitante)
```

**Key Files:**
- `src/app/dashboard/page.tsx` - Role detection logic
- `src/app/dashboard/components/views/` - Role-specific UIs
- `src/app/dashboard/components/Header.tsx`, `Sidebar.tsx` - Shared layout

**Pattern**: Never create separate protected routes for each role. Route through dashboard, use Supabase session checks and role-based renders.

## Database & Authentication Flow

**Supabase Client Setup** (`src/lib/supabaseClient.ts`):
- Auto-refresh tokens + session persistence enabled
- URL/key from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Key Tables:**
- `a_usuarios` - User profiles (fields: `auth_uid`, `nombre_completo`, `rol`)
- `Ingreso` - Inventory records (fields: `Producto`, `Cantidad`, `Descripción`, `Marca`, `created_at`, `id`)

**Auth Flow**:
1. Login page (`page.tsx`) → Supabase password auth
2. Listen for auth state changes with `onAuthStateChange()` subscription
3. Always unsubscribe listeners in cleanup functions to prevent memory leaks

## Service Pattern

Use static methods in service classes. Example:

```typescript
// src/lib/services/ingresoService.ts
export class IngresoService {
  static async getAll() { /* Supabase query */ }
  static async create(item) { /* Insert */ }
  static async update(id, item) { /* Update */ }
  static async delete(id) { /* Delete */ }
}
```

**Usage**: Import and call `IngresoService.getAll()` directly from components.

## Component Conventions

**UI Components** (`src/components/ui/`):
- Built with Radix UI primitives
- Exported from `index.ts` for cleaner imports
- Use `cn()` utility (from `lib/utils.ts`) to merge Tailwind classes
- Example: `<Button className={cn('px-4', customClass)} />`

**Naming**: 
- Use `.tsx` for client/server components
- Use `.jsx` for older utility files if present

## Client vs. Server Components

- Use `'use client'` directive for interactive features (forms, buttons, state)
- Dashboard and login pages are client components (handle state, navigation)
- Auth checks happen client-side with `useRouter()` redirects

## Code Style Notes

- Comments use emojis for visual hierarchy: `// 🧠`, `// 🔄`, `// 🔐`, `// ✅`
- Spanish is used in some domains (user-facing strings)
- Strict TypeScript: types are required, avoid `any`
- Environment variables are required at build time (marked with `!`)
