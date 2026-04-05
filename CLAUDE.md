# CLAUDE.md

## Code conventions

- All components are **standalone** — no NgModules exist or should be created
- Use `inject()` for dependency injection, not constructor injection
- Component selector prefix is `app` (kebab-case); directive prefix is `app` (camelCase) — enforced by ESLint
- New components go under `src/app/features/<feature>/components/` or `src/app/shared/components/`

## Testing

`skipTests: true` is set globally in `angular.json` schematics. Do not generate or create test files unless explicitly asked.

## Commits

Conventional commits are enforced via commitlint. Use `feat:`, `fix:`, `chore:`, etc.

## API

The mock API (`json-server`) must be running on port 3001 for the app to work. Services hardcode `http://localhost:3001` — there is no environment file abstraction.
