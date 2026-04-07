# GitHub Copilot Custom Instructions

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
