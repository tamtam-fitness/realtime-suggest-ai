# Suggested Commands

## Development

```bash
# Start development server
npm run start

# Start development with hot reload
npm run start
```

## Testing

```bash
# Run all tests (unit + e2e)
npm run test:all

# Run unit tests (Vitest)
npm run test
npm run test:unit

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests (Playwright)
# NOTE: Requires app to be built first (npm run package/make/publish)
npm run test:e2e
```

## Code Quality

```bash
# Lint code
npm run lint

# Check formatting (doesn't modify files)
npm run format

# Format code (modifies files)
npm run format:write
```

## Build & Distribution

```bash
# Package application (creates executable bundle)
npm run package

# Create platform-specific distributables (.exe, .dmg, etc)
npm run make

# Publish to distribution service
npm run publish
```

## System Commands (macOS)

```bash
# List files
ls
ls -la  # detailed listing with hidden files

# Search files
find . -name "pattern"

# Search content
grep -r "pattern" .

# Change directory
cd <path>

# Git operations
git status
git add .
git commit -m "message"
git push
git pull
```

## Project-Specific Notes

- Always run `npm run format:write` before committing
- Always run `npm run lint` to check for errors
- E2E tests require building the app first (`npm run package`)
- React DevTools are installed automatically in development
