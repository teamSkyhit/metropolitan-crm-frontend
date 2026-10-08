# Metropolitan CRM Frontend

A modern, fast, and feature-rich CRM frontend built with Next.js 16 (App Router), React 19, Tailwind CSS, and TanStack Query.

## Modules Included

- Auth (JWT, Role-based access)
- Dashboard
- Enquiries
- Products
- Categories & Brands
- Homepage CMS
- User Management

## Setup

```bash
npm install
npm run dev
```

## Architecture

This project follows a feature-sliced design pattern.

- `src/app`: Next.js App Router pages
- `src/features`: Isolated feature modules
- `src/components`: Shared UI components
- `src/lib`: Shared utilities and configs

## Testing & CI

- `npm run lint` (Strict: 0 warnings allowed)
- `npm run typecheck`
- `npm run test` (Vitest)
