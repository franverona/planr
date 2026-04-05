<div align="center">

<img src="./screenshots/logo.svg" alt="Planr logo" width="120" />

<h3>Planr</h3>

[![CI](https://github.com/franverona/planr/actions/workflows/ci.yml/badge.svg)](https://github.com/franverona/planr/actions/workflows/ci.yml)

A project management tool featuring kanban boards to organise and track tasks across multiple projects.

</div>

## Tech Stack

- **Angular 18** — standalone components, signals, reactive forms
- **Tailwind CSS v3** — utility-first styling with a custom indigo primary ramp
- **@angular/cdk/drag-drop** — drag-and-drop kanban columns
- **json-server** — mock REST API on port 3001

## Available Scripts

| Script             | Description                                     |
| ------------------ | ----------------------------------------------- |
| `npm start`        | Dev server at `http://localhost:4200`           |
| `npm run mock-api` | json-server mock API at `http://localhost:3001` |
| `npm run build`    | Production build to `dist/planr/`               |
| `npm run watch`    | Build in watch mode (development)               |
| `npm test`         | Run unit tests with Karma/Jasmine               |

## Getting Started

You need two processes running in parallel. Open two terminals:

**Terminal 1 — Mock API:**

```bash
npm run mock-api
```

This starts json-server at `http://localhost:3001` with seed data from `db.json`.

**Terminal 2 — Angular dev server:**

```bash
npm start
```

Opens the app at `http://localhost:4200`.

## Features

| Feature                                                      | Route                   |
| ------------------------------------------------------------ | ----------------------- |
| Projects list                                                | `/projects`             |
| Create / edit / delete projects                              | `/projects` (modal)     |
| Project detail + kanban board                                | `/projects/:id`         |
| Drag tasks between columns (`todo` → `in-progress` → `done`) | `/projects/:id`         |
| Create / edit / delete tasks                                 | `/projects/:id` (modal) |
| Task priority levels (`low`, `medium`, `high`)               | `/projects/:id`         |
| Project status (`active` / `archived`)                       | `/projects`             |
| HTTP error banner                                            | Global (top of page)    |

## Project Structure

```
src/app/
├── core/
│   ├── interceptors/   # HTTP error interceptor
│   ├── models/         # Project & Task interfaces
│   └── services/       # ProjectsService, TasksService, NotificationService
├── features/
│   ├── projects/       # Lazy-loaded: list + detail
│   └── tasks/          # Kanban board + task form/card
└── shared/
    └── components/     # Navbar, ErrorBanner
```

## Data Models

**Project** — `id`, `name`, `description`, `status` (`active` | `archived`), `createdAt`

**Task** — `id`, `projectId`, `title`, `description`, `status` (`todo` | `in-progress` | `done`), `priority` (`low` | `medium` | `high`), `createdAt`

## Build

```bash
npm run build
```

Output goes to `dist/planr/`.
