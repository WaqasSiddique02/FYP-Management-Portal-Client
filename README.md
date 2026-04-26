# FYP Management System (Client)

A role-based web portal for managing Final Year Project (FYP) workflows across three actors:

- Student
- Supervisor
- Coordinator

This client application centralizes project selection, group management, proposal/document flow, evaluations, schedules, and announcements using a modern Next.js App Router frontend.

## Overview

The app enforces role isolation at the route level:

- `/student/*` for student operations
- `/supervisor/*` for supervisor operations
- `/coordinator/*` for coordinator operations

Each role has:

- Dedicated login
- Dedicated dashboard
- Dedicated feature routes and API surface

## Tech Stack

- Next.js `16.0.7` (App Router)
- React `19.2.0`
- TypeScript `^5`
- Tailwind CSS `^4`
- shadcn/ui (New York style, neutral base)
- Radix UI primitives
- Axios `^1.13.2`
- Recharts `^3.5.1`
- react-hot-toast `^2.6.0`
- lucide-react `^0.556.0`

## Key Features

### Student

- FYP registration by department
- Group creation and member management
- Browse/select supervisor ideas
- Request custom project idea
- Upload proposals and documents
- View marks/report, demo details, announcements, profile

### Supervisor

- View assigned groups
- Create and manage project ideas
- Approve/reject selected or custom ideas
- Review proposals/documents and add feedback
- Submit final evaluations
- Access schedules/panels and announcements

### Coordinator

- Teacher management and transfers
- Group and project oversight
- Panel creation and scheduling workflows
- Announcement management
- Coordinator dashboard and profile

## Route Map

### Public

- `/` - landing page with role portal selection

### Student Routes

- `/student/login`
- `/student/register`
- `/student/dashboard`
- `/student/register-fyp`
- `/student/select-project`
- `/student/documents`
- `/student/demo-details`
- `/student/marks-report`
- `/student/announcements`
- `/student/profile`

### Supervisor Routes

- `/supervisor/login`
- `/supervisor/dashboard`
- `/supervisor/groups`
- `/supervisor/project-ideas`
- `/supervisor/proposals`
- `/supervisor/evaluations`
- `/supervisor/schedules`
- `/supervisor/announcements`
- `/supervisor/profile`

### Coordinator Routes

- `/coordinator/login`
- `/coordinator/dashboard`
- `/coordinator/teachers`
- `/coordinator/groups`
- `/coordinator/projects`
- `/coordinator/panels`
- `/coordinator/schedules`
- `/coordinator/management`
- `/coordinator/announcements`
- `/coordinator/profile`

## Architecture

### 1) App Router and Layout

- `app/layout.tsx`
  - Wraps entire app in `AuthProvider`
  - Configures global `Toaster`

- `app/page.tsx`
  - Landing page with role-based entry points

### 2) Reusable UI and Layout

- `components/layouts/`
  - `DashboardLayout.tsx`
  - `Navbar.tsx`
  - `Sidebar.tsx`

- `components/dashboard/`
  - Dashboard widgets/charts/cards used across role dashboards

- `components/ui/`
  - shadcn/ui component primitives

### 3) State and Auth

- `lib/contexts/AuthContext.tsx`
  - Global auth state (`user`, `token`, `isAuthenticated`, `loading`)
  - `logout()` clears storage and context

- `lib/hooks/useAuthProtection.ts`
  - Page-level guard for authentication and role authorization
  - Redirects unauthorized users to valid route/home

- `lib/hooks/userAuth.ts`
  - Login/register/logout flow wrappers
  - Persists token/user and routes to role dashboard

- `lib/utils/token.ts`
  - Storage abstraction for token and user data
  - Supports remember-me behavior with localStorage/sessionStorage

### 4) API Layer

- `lib/api/axios.ts`
  - Shared axios client
  - Injects `Authorization: Bearer <token>` via request interceptor
  - Handles `401` globally (non-login requests) by clearing auth + redirecting to `/`

- `lib/api/endpoints.ts`
  - Centralized endpoint constants by domain/role
  - Uses `NEXT_PUBLIC_API_URL` with localhost fallback

- Role and feature modules:
  - `lib/api/auth.api.ts`
  - `lib/api/student.api.ts`
  - `lib/api/supervisor.api.ts`
  - `lib/api/coordinator.api.ts`
  - `lib/api/dashboard.api.ts`
  - `lib/api/project.api.ts`
  - `lib/api/document.api.ts`

## Setup

### Prerequisites

- Node.js 18+ (recommended LTS)
- npm
- Backend API running (default: `http://localhost:3003`)

### 1) Install

```bash
npm install
```

### 2) Configure environment

Create `.env.local` in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 3) Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev     # Start development server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

## Authentication Flow

1. User logs in through role login page.
2. API returns `{ token, user }`.
3. Token/user are persisted with remember-me behavior.
4. Auth context updates app state.
5. User is redirected to role dashboard.
6. On token expiration (`401`), client clears auth and returns to `/`.

## API Base URL

The client resolves API URL from:

1. `NEXT_PUBLIC_API_URL` (environment)
2. Fallback: `http://localhost:3003`

This is referenced in both axios setup and endpoint definitions.

## Development Conventions

- Use path aliases with `@/` for imports.
- Keep backend calls inside `lib/api/*` modules (not directly in UI components).
- Use `useAuthProtection()` in protected pages.
- Preserve role-specific visual language:
  - Student: blue
  - Supervisor: green/emerald
  - Coordinator: violet/purple
- Add new routes using `app/[role]/[feature]/page.tsx` pattern.

## Important Workflow Note

For student group flow, project data quality depends on department registration first:

1. Register FYP with a department.
2. Then create/manage group and project selection.

If backend requires department in group creation payload, ensure frontend payload matches backend schema.

## Troubleshooting

### App cannot connect to backend

- Verify backend is running.
- Confirm `.env.local` uses correct `NEXT_PUBLIC_API_URL`.
- Restart dev server after env changes.

### Unexpected redirect to home (`/`)

- Token may be missing/expired.
- Check browser storage (`auth_token`, `user_data`).
- Re-login and verify backend returns `token` and `user`.

### Wrong role route behavior

- `useAuthProtection()` enforces role constraints.
- Confirm backend user role matches expected route role.

## Project Structure

```text
client/
	app/
		coordinator/
		student/
		supervisor/
		layout.tsx
		page.tsx
	components/
		dashboard/
		layouts/
		supervisor/
		ui/
	lib/
		api/
		contexts/
		hooks/
		types/
		utils/
	public/
```

