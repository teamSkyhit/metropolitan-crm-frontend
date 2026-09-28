# Contributing to Metropolitan CRM Frontend

This project is the internal B2B CRM/admin dashboard. Several modules are still
placeholders and will be built out by the team. This doc defines the
conventions every new module should follow so the codebase stays consistent
as more people work on it in parallel.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4
- TanStack Query for server state, Axios as the HTTP client (`src/lib/api/client.ts`)
- Zustand for client/global state
- ESLint (`eslint-config-next`) + Prettier for lint/format

## Before you push

```bash
npm run lint          # eslint
npm run format:check  # prettier --check
npx tsc --noEmit       # type check
npm run build          # production build
```

`npm run format` auto-fixes formatting. CI-equivalent checks should all pass
before opening a PR.

## Folder structure

```
src/
  app/            Route segments (App Router). (auth) and (crm) are route groups.
  components/
    ui/           Generic, reusable primitives (Button, Input, Modal, Table, PageHeader, EmptyState...)
    layout/       App shell pieces (Sidebar, Header, CrmLayout)
  features/       Feature-scoped logic (e.g. features/auth/auth.store.ts)
  lib/
    api/          Axios client and API request helpers
    constants/    Shared constants (routes, roles, etc.)
    utils/        Small stateless utilities (e.g. cn)
  providers/      App-wide React context/providers
  types/          Shared TypeScript types
  config/         Runtime/env configuration
```

## Adding a new CRM module page

Every module under `src/app/(crm)/<module>/page.tsx` should follow the same
shape. Start from `PageHeader` + `EmptyState` (or real content once the
module is implemented):

```tsx
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function ExamplePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Example" description="Manage your example records here." />
      <EmptyState />
    </div>
  );
}
```

Once a module has real data, replace `<EmptyState />` with the actual
content (e.g. a `Table` from `@/components/ui/table`), and add the route to
`src/lib/constants/routes.ts` and the sidebar (`src/components/layout/sidebar.tsx`)
if it should be navigable.

## UI primitives (`src/components/ui`)

- Interactive elements that forward a ref (`Button`, `Input`) use
  `React.forwardRef`, accept `className`, merge it with `cn()`, and set
  `displayName`.
- Prefer a `type` alias over an `interface` when a props type has no
  additional members beyond what it extends (avoids
  `@typescript-eslint/no-empty-object-type`).
- Use `cn()` (`src/lib/utils/cn.ts`) instead of manual string concatenation
  for conditional/mergeable class names.
- Use icons from `lucide-react` rather than raw text/HTML entities for
  glyphs (avoids encoding issues and keeps icon sizing consistent).

## State management

- Local/UI-only state: `useState`/`useReducer` in the component.
- Cross-page client state (auth, current user, UI preferences): a Zustand
  store under `src/features/<feature>/<feature>.store.ts`, following the
  pattern in `src/features/auth/auth.store.ts`.
- Server data (anything from the API): TanStack Query hooks that call
  `apiClient` from `src/lib/api/client.ts`. Don't duplicate server data into
  Zustand.

## Naming conventions

- Components: `PascalCase` file exports, one primary export per file.
- Non-component modules (stores, constants, utils): `kebab-case.ts` /
  `<name>.store.ts`.
- Route segment folders: lowercase, matching the URL path.
