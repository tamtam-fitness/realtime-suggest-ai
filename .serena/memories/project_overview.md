# Project Overview

## Purpose

This is an Electron desktop application template built with shadcn-ui, originally forked from electron-shadcn. The project name is "realtime-suggest-ai" which suggests it's being adapted for a real-time AI suggestion feature.

## Tech Stack

### Core

- **Electron 38**: Desktop application framework
- **Vite 7**: Build tool and dev server
- **TypeScript 5.9**: Type-safe programming language
- **React 19**: UI framework with React Compiler enabled by default

### UI & Styling

- **Tailwind 4**: Utility-first CSS framework
- **Shadcn UI**: React component library
- **Lucide**: Icon library
- **Geist**: Default font family
- **i18next**: Internationalization support
- **TanStack Router**: Type-safe routing

### State & Data

- **React Query (TanStack)**: Server state management
- **Zod 4**: Schema validation

### Testing

- **Vitest**: Unit testing framework
- **Playwright**: E2E testing framework
- **React Testing Library**: React component testing utilities

### Code Quality

- **ESLint 9**: Linting
- **Prettier**: Code formatting
- **prettier-plugin-tailwindcss**: Tailwind class sorting

### Build & Distribution

- **Electron Forge**: Packaging and distribution tool

## Project Architecture

### Context Isolation

The app uses Electron's context isolation with:

- `contextIsolation: true`
- `nodeIntegration: true`
- Preload scripts for secure IPC communication

### Custom Title Bar

- `titleBarStyle`: hidden (custom title bar implementation)
- Platform-specific traffic light positioning for macOS

### IPC Communication Pattern

The project has a structured IPC pattern with:

- Context exposers for renderer process
- Listeners registered in main process
- Separate modules for theme and window management
