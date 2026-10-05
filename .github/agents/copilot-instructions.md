# xiangqi-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-04

## Active Technologies

- TypeScript 5.x, Node.js 20+ + Next.js 15 (App Router), React 19, Mantine 7, Tailwind CSS 4, Zustand 5, localforage, next-pwa (001-xiangqi-study-app)
- localforage / IndexedDB (guest); Supabase PostgreSQL (authenticated) (001-xiangqi-study-app)
- TypeScript 5.x, React 19.2.4, Next.js 16.2.1 (App Router) + Zustand 5, Mantine 8, @tanstack/react-query 5, localforage 1.10, next-pwa 5.6 (001-xiangqi-study-app)
- Local IndexedDB via localforage; user mode via storage service abstraction (remote adapter path) (001-xiangqi-study-app)
- TypeScript 5.x, React 19.2.4, Next.js 16.2.1 (App Router) + Zustand 5, Mantine 8, localforage 1.10, next-pwa 5.6 (001-xiangqi-study-app)
- Local IndexedDB via localforage (guest mode); user-mode sync deferred (001-xiangqi-study-app)
- Local IndexedDB via localforage (guest mode), no cloud sync in this phase (001-xiangqi-study-app)

- TypeScript 5.x, React 19.x, Next.js 16.2.1 (App Router) + Next.js, React, Zustand, @tanstack/react-query, Mantine, next-pwa, localforage, Supabase client SDK (001-xiangqi-study-app)

## Coding Standards (Always Follow Strictly)

### General Rules

- Use **TypeScript strict mode** — never use `any`.
- Prefer **functional components** and arrow functions.
- Always use **named exports** for components and utilities.
- Indentation: **2 spaces**.
- No trailing commas in JSON/TS objects unless necessary.
- Keep components under **300 lines** when possible. Extract logic into custom hooks if complex.

### Naming Conventions

- Components: **PascalCase** (e.g. `UserProfileCard`)
- Files: **kebab-case** for components (e.g. `user-profile-card.tsx`)
- Variables & functions: **camelCase**
- Constants: **UPPER_SNAKE_CASE**
- Types/Interfaces: **PascalCase**

### Imports

- Order: React → third-party libraries → internal (absolute or alias paths preferred)
- Use named imports whenever possible.
- Avoid importing entire libraries if only specific functions are needed.

### React Best Practices

- Never mutate state directly.
- Use functional updates for `setState`.
- Implement proper error handling (try/catch, error boundaries).
- Ensure basic accessibility (aria labels, semantic HTML where applicable).
- Trying avoid passing down props as much as possible; use state management for deeply nested data.
- Components ordered: 1) hooks, 2) state from store, 3) internal state, 4) event handlers, 5) useEffect, 6) render.
- Priority to use Mantine UI components and utilities when possible (avoid tailwind) while still following the design guidelines.
- Reduce drilling down props by using hooks or state management for deeply nested data.

### Code Quality

- Single responsibility principle: one component/hook/function should do one thing well.
- Write clean, readable, self-documenting code. Avoid overly clever solutions.
- Do not hardcode values — use constants, config files, or environment variables.
- Remove or replace `console.log` in production-ready code (use a proper logger if needed).
- Avoid non-null assertion `!` unless you are 100% certain.

### When Implementing Features from Design

1. First, understand and plan the architecture, data flow, and edge cases.
2. Strictly follow the Figma design for layout, colors, spacing, and interactions.
3. Break large features into small, logical steps.
4. After writing code, self-review against these instructions before finalizing.

## Things to Avoid (Strictly Forbidden)

- Adding new dependencies without explicit confirmation.
- Using `any` type or disabling TypeScript rules.
- Inline styles (use Tailwind or CSS modules).
- Over-engineering simple tasks.
- Leaving TODO comments without explanation.

## General Mindset

- Prioritize **clarity and maintainability** over being "smart".
- Keep code simple and consistent.
- When in doubt, choose the simplest solution that works and follows the rules.

Always follow these instructions unless the user explicitly asks to deviate from them.

Last updated: April 2026

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
