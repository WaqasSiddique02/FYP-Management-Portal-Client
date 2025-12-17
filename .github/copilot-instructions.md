# FYP Management System - Client Codebase Guide

## Project Overview
This is a Next.js 16 (App Router) client for a Final Year Project (FYP) Management System with three distinct user roles: **Student**, **Supervisor**, and **Coordinator**. Each role has isolated routes and functionality.

## Tech Stack
- **Framework**: Next.js 16.0.7 with App Router, TypeScript, React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components (New York style, neutral theme)
- **Icons**: lucide-react
- **Path Aliases**: `@/*` maps to project root

## Architecture

### Route Structure (Role-Based Isolation)
The app uses a strict role-based routing pattern under `/app/[role]/[feature]/page.tsx`:
- `/student/*` - Student-specific features (login, dashboard, register-fyp, documents, etc.)
- `/supervisor/*` - Supervisor features (login, dashboard, evaluations, groups, etc.)
- `/coordinator/*` - Coordinator features (login, dashboard, management, panels, etc.)

Each role has its own login page (e.g., `/student/login`, `/supervisor/login`) and dedicated dashboard.

### Component Organization
```
components/
├── dashboard/        # Role-specific dashboard components (StudentDashboard, SupervisorCharts, etc.)
├── layouts/          # DashboardLayout, Navbar, Sidebar (reusable across roles)
├── supervisor/       # Supervisor-specific components (GroupDetailsDialog)
└── ui/              # shadcn/ui primitives (button, card, dialog, etc.)
```

### API Layer (`lib/api/`)
All backend communication is centralized in typed API modules:
- `auth.api.ts` - Authentication (login, logout, token management)
- `student.api.ts` - Student operations (registerFYP, searchStudents, getDepartments)
- `supervisor.api.ts` - Supervisor operations
- `coordinator.api.ts` - Coordinator operations
- `dashboard.api.ts` - Dashboard data fetching
- `document.api.ts` - Document operations
- `project.api.ts` - Project management
- `axios.ts` - Configured axios instance with interceptors
- `endpoints.ts` - Centralized API endpoint definitions

**Pattern**: Use `apiClient` from `axios.ts` for all requests. Endpoints are defined in `endpoints.ts` and imported.

### State Management
- **Authentication**: Context-based (`AuthContext.tsx`) with hooks (`useAuth`, `useAuthProtection`)
- **Local State**: React `useState` for component-specific state
- **Forms**: Controlled components with manual validation

### Group Creation Flow (Critical Pattern)
Students must:
1. Register for FYP by selecting a department (`studentAPI.registerFYP(departmentId)`)
2. Create a group with 3 members total (including themselves) (`groupAPI.createGroup(groupName, memberIds, departmentId)`)

**Important**: The backend Group schema requires a `department` field. When creating a group, you MUST pass the student's registered department ID to the API. Store this after FYP registration and include it in group creation requests.

## Key Conventions

### Styling
- Use Tailwind utility classes directly in TSX
- Role-specific color themes:
  - Student: blue (`bg-blue-600`, `focus:ring-blue-500`)
  - Supervisor: green (`bg-green-600`, `focus:ring-green-500`)
  - Coordinator: purple (`bg-purple-600`, `focus:ring-purple-500`)
- Forms use consistent styling: `px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[role-color]`

### Component Patterns
- All pages are **client components** (`'use client'`) due to router and state usage
- Auth protection via `useAuthProtection('[ROLE]')` hook at page level
- Wrap authenticated pages with `DashboardLayout` component
- Use lucide-react icons (e.g., `<Eye />`, `<Search />`, `<Users />`)

### Type Definitions
Types are co-located in `lib/types/`:
- `auth.types.ts` - Login/auth types
- `coordinator.types.ts` - Coordinator-specific types
- `supervisor.types.ts` - Supervisor-specific types

Interface pattern: Define interfaces at file top for API responses, form data, and component props.

### Error Handling
```typescript
try {
  const response = await someAPI.method();
  // Handle success
} catch (err: any) {
  const errorMessage = err.response?.data?.message || 'Fallback error message';
  setError(errorMessage);
}
```

## Development Workflows

### Running the App
```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

### Adding shadcn/ui Components
Components follow the "New York" style. Use the configured aliases from `components.json`:
- Import paths: `@/components/ui/[component]`
- Utility function: `cn()` from `@/lib/utils` for conditional classes

### API Integration
1. Define endpoint in `endpoints.ts`
2. Create typed function in appropriate `[role].api.ts`
3. Call from component with error handling
4. Display loading states and errors to user

## Common Patterns

### Login Pages
All three role login pages share similar structure:
- Two-column layout (image + form)
- Email/password fields with show/hide toggle
- "Remember me" checkbox
- Role-specific theming
- Form submission with `console.log` (actual auth in backend)

### Dashboard Layout
```tsx
<DashboardLayout role="student" title="Dashboard">
  {/* Dashboard content */}
</DashboardLayout>
```

### Protected Routes
```tsx
const { isChecking: authLoading } = useAuthProtection('STUDENT');
if (authLoading) return null; // Or loading spinner
```

## Critical Files
- [app/layout.tsx](app/layout.tsx) - Root layout with Geist fonts
- [app/page.tsx](app/page.tsx) - Landing page with role selection
- [lib/api/axios.ts](lib/api/axios.ts) - HTTP client configuration
- [lib/api/endpoints.ts](lib/api/endpoints.ts) - All API routes
- [lib/contexts/AuthContext.tsx](lib/contexts/AuthContext.tsx) - Auth state management
- [components/layouts/DashboardLayout.tsx](components/layouts/DashboardLayout.tsx) - Main layout wrapper
- [components.json](components.json) - shadcn/ui configuration

## Notes for AI Agents
- When creating new role features, follow the existing pattern: create page under `app/[role]/[feature]/page.tsx`
- Always include the role-specific color theme in new pages
- For API calls requiring authentication, the `apiClient` automatically includes the auth token
- When debugging group creation, verify the `department` field is included in the request payload
- Path imports use `@/` prefix - do not use relative paths like `../../`
