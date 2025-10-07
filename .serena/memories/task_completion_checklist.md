# Task Completion Checklist

When a coding task is completed, follow these steps:

## 1. Code Quality Checks

```bash
# Format code
npm run format:write

# Lint code
npm run lint
```

## 2. Testing

```bash
# Run unit tests
npm run test

# If UI changes were made, run E2E tests
# First, build the app:
npm run package
# Then run E2E tests:
npm run test:e2e

# Or run all tests at once:
npm run test:all
```

## 3. Type Checking

The TypeScript compiler will check types during the build process. Ensure:

- No TypeScript errors
- All imports are properly typed
- `noImplicitAny` is satisfied

## 4. Commit Standards

- Use conventional commit messages
- Follow Tidy First methodology:
  - Separate structural changes (refactoring) from behavioral changes (features/fixes)
  - Commit structural changes first
  - Then commit behavioral changes

### Commit Message Format

```
type: description

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring without behavior change
- style: Code style/formatting changes
- test: Adding or updating tests
- docs: Documentation changes
- chore: Maintenance tasks
```

## 5. Pre-Commit Checklist

- [ ] Code formatted with Prettier
- [ ] ESLint passes with no errors
- [ ] Unit tests pass
- [ ] E2E tests pass (if applicable)
- [ ] TypeScript compiles without errors
- [ ] No console errors in development mode
- [ ] Internationalization keys added (if UI text added)

## 6. Additional Checks for Electron-Specific Changes

- [ ] IPC communication properly secured (using contextBridge)
- [ ] Preload scripts updated if needed
- [ ] Main process and renderer process separation maintained
- [ ] No Node.js APIs directly accessed in renderer (use IPC instead)
