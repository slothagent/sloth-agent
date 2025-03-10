# Sloth Agent Frontend

This is the frontend for the Sloth Agent project, built with:

- [Rsbuild](https://rsbuild.dev/) - A fast build tool for modern web development
- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [TanStack React Router](https://tanstack.com/router/latest) - A fully type-safe React Router
- [TanStack React Query](https://tanstack.com/query/latest) - A data fetching and state management library
- [Bun](https://bun.sh/) - A fast JavaScript runtime and package manager

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (>= 1.0.0)

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
# Build the application
bun build
```

### Preview Production Build

```bash
# Preview the production build
bun preview
```

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `App.tsx` - Main application component
  - `main.tsx` - Application entry point
  - `router.tsx` - TanStack Router configuration
- `public/` - Static assets
- `rsbuild.config.ts` - Rsbuild configuration

## Features

- **TanStack React Router** - Type-safe routing with automatic code-splitting
- **TanStack React Query** - Efficient data fetching and state management
- **TanStack Router DevTools** - Debugging tools for the router
- **Fast Refresh** - Instant feedback during development
- **TypeScript** - Type safety throughout the codebase
