# Code Style and Conventions

## TypeScript Configuration

- **Target**: ESNext
- **JSX**: react-jsx
- **Strict mode**: Enabled
- **Module**: ESNext with bundler resolution
- Type declarations required (`declaration: true`)
- No implicit any allowed
- Force consistent file name casing

## Path Aliases

- `@/*` maps to `./src/*`

## Naming Conventions

- **Components**: PascalCase (e.g., `ToggleTheme`, `LangToggle`)
- **Files**:
  - Components: PascalCase (e.g., `ToggleTheme.tsx`)
  - Helpers/Utils: kebab-case (e.g., `theme_helpers.ts`, `language_helpers.ts`)
  - Config files: kebab-case with appropriate extensions (e.g., `vite.main.config.mts`)
- **Directories**: kebab-case or camelCase (e.g., `components/ui`, `helpers/ipc`)

## Code Organization

### Directory Structure

```
src/
├── assets/          # Fonts, images, static resources
├── components/      # React components
│   ├── template/   # Template-specific components (can be deleted)
│   └── ui/         # shadcn UI components
├── helpers/        # IPC and utility functions
│   └── ipc/       # IPC context and listeners
├── layouts/        # Layout components
├── routes/         # TanStack Router route files
├── styles/         # Global CSS styles
├── tests/          # Test files
│   ├── unit/      # Vitest unit tests
│   └── e2e/       # Playwright E2E tests
├── types/          # TypeScript type definitions
└── localization/   # i18n configuration
```

## React Patterns

- **Functional Components**: Use function declarations
- **React Compiler**: Enabled by default (automatically optimizes components)
- **Hooks**: Modern React 19 hooks patterns
- **Translation**: Use `useTranslation()` hook from react-i18next

## Import Organization

- React imports first
- Third-party libraries
- Local imports with `@/` alias
- Grouped by functionality

## File Naming for Routes

- Route files use TanStack Router conventions
- `__root.tsx` for root layout
- `index.tsx` for index routes
- Named routes use the route name (e.g., `second.tsx`)
