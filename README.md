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
| `npm run dev`      | Start API + dev server together (recommended)   |
| `npm start`        | Dev server at `http://localhost:4200`           |
| `npm run mock-api` | json-server mock API at `http://localhost:3001` |
| `npm run reset-db` | Reset `db.json` to the original seed data       |
| `npm run build`    | Production build to `dist/planr/`               |
| `npm run watch`    | Build in watch mode (development)               |
| `npm test`         | Run unit tests with Karma/Jasmine               |

## Getting Started

```bash
npm run dev
```

This starts both the mock API (`http://localhost:3001`) and the Angular dev server (`http://localhost:4200`) in a single terminal using `concurrently`.

The mock API uses `db.json` as its runtime database (gitignored). On first run it is seeded from `db.seed.json`. To reset to the original seed data, run `npm run reset-db`.

## Build

```bash
npm run build
```

Output goes to `dist/planr/`.
