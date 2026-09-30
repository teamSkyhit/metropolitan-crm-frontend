# Metro Industrial CRM - Frontend Foundation

This document outlines the foundation, tech stack, and directory structure set up for the Metro Industrial CRM frontend. This setup is designed to be highly scalable and production-ready, specifically prepared for the upcoming Auth Module implementation.

## 🛠️ Core Tech Stack

- **Framework:** **Next.js 15** (using the modern App Router)
- **Language:** **TypeScript** (for type safety and better developer experience)
- **Styling:** **Tailwind CSS** (utility-first CSS framework for rapid UI development)
- **State Management:** 
  - **Zustand:** For global UI state (e.g., managing the current user session).
  - **React Query (@tanstack/react-query):** For server state, data fetching, and caching.
- **API Client:** **Axios** (configured with interceptors for upcoming JWT auth).
- **Icons:** **Lucide React** (clean, consistent SVG icons).
- **UI Utilities:** **clsx** & **tailwind-merge** (for dynamic class name merging).

---

## 📁 Directory Structure Breakdown

The project follows a feature-sliced and modular architecture inside the `src/` directory. Here is how the concerns are separated:

### 1. `src/app/` (Routing Layer)
We use Next.js Route Groups (folders in parentheses) to organize routes logically without affecting the URL path.
- `app/(auth)/login/`: Contains the login page placeholder.
- `app/(crm)/`: Contains all the internal dashboard pages (e.g., `dashboard`, `products`, `enquiries`). They all share a common CRM layout.
- `app/layout.tsx`: The root HTML/Body wrapper, injecting global providers.

### 2. `src/components/` (Presentation Layer)
- **`components/ui/`**: Reusable, stateless UI components (e.g., `Button`, `Input`, `Modal`, `Table`). These act as our custom design system.
- **`components/layout/`**: Structural components like the `CrmLayout`, `Sidebar`, and `Header`.

### 3. `src/features/` (Business Logic Layer)
Groups code by domain/feature rather than file type, making the codebase scale better as it grows.
- **`features/auth/`**: Currently holds `auth.store.ts` (Zustand state). Future auth logic (login functions, token parsing) will go here.

### 4. `src/lib/` (Utilities & Configuration)
- **`lib/api/client.ts`**: The Axios instance. It is pre-configured with the base API URL and empty interceptors ready for the JWT access/refresh token logic.
- **`lib/constants/`**: Centralized constants, such as `routes.ts` (so we don't hardcode URLs) and `roles.ts` (Super Admin, Sales Manager).
- **`lib/utils/cn.ts`**: A standard utility function combining `clsx` and `tailwind-merge` for building complex UI component classes.

### 5. `src/providers/` (Global Context)
- **`app-provider.tsx`**: Wraps the entire application. It currently initializes the `QueryProvider` (React Query) and is the perfect place to add future providers like a `ToastProvider`.

### 6. `src/types/` (TypeScript Definitions)
- **`auth.ts`**: Defines the `User` interface and `Role` types based on the project spec.
- **`api.ts`**: Defines standard backend response wrappers (e.g., `ApiResponse<T>`, `PaginatedData<T>`).

### 7. `src/config/` (Environment)
- **`env.ts`**: Safely exports environment variables, providing fallbacks and ensuring they are accessed consistently throughout the app.

---

## 🚀 Architectural Decisions

This setup strictly follows the requirement to build the **Project Foundation ONLY**:
1. **No fake backend logic** was created.
2. **API calls and UI states** are scaffolded using clean interfaces and placeholders.
3. The next developer can immediately jump into `features/auth/` and `lib/api/client.ts` to wire up the real backend authentication without having to worry about routing, styling, or state architecture.
