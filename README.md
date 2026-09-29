# alotrojah_Frontend — Angular 22 PWA-ready UI (mobile-first, ar/fr/en)

Quran-memorization UI for teachers (phones, 3G) + manager (PC).
Backend: `../alotrojah_Backend` (Laravel API). Full context: `docs/Agent.md`.

## Prerequisites

- **Node 24 LTS** (`engines: ^24`, `.nvmrc` pins 24.21.0). The repo was built with
  nvm-windows; if your default Node differs, call the v24 binaries explicitly.
- npm 11+ (bundled with Node 24).

```powershell
nvm use 24.21.0            # if you use nvm-windows; otherwise ensure node -v matches ^24
npm install
```

## Commands

```powershell
npm start                  # dev server → http://localhost:4200 (API: localhost:8000)
npm run start:prod         # serve with production config
npm run build              # PRODUCTION build (default) → dist/alotrojah
npm run build:dev          # development build
npm test                   # Vitest, single run (CI-safe): 25 tests
npm run test:watch         # watch mode
npm run test:cov           # with coverage
npm run e2e                # Playwright (starts backend :8000 + frontend :4201 itself)
npm run e2e:ui             # interactive runner
npm run format             # prettier write
npm run format:check       # prettier check (gate before commit)
npm run typecheck          # tsc --noEmit, no full build
```

Chain before pushing: `format → typecheck → test → build`.

## Environments

- `src/environments/environment.ts` → `http://localhost:8000/api/v1`
- `src/environments/environment.prod.ts` → `https://api.alotrojah.ma/api/v1`
  (swapped automatically by `fileReplacements` on `build`).

## Conventions (enforced, see `docs/Agent.md` Angular section)

- Standalone only, `inject()`, signal `input()`/`output()`/`model()`, `@if`/`@for(track id)`, OnPush, zoneless.
- `core/` singletons (API client, auth, i18n, layout) · `shared/ui` dumb components · `features/*` lazy routes.
- i18n: `assets/i18n/{ar,fr,en}.json`, Arabic-first RTL; add keys in all three files, validate JSON with node before building.
- Import depth: feature files live 2 levels deep → always `../../core`, never `../../../`.
- `resource({ params })` (ng22 renamed `request`); never write signals inside `computed()`; validate i18n JSON + strict build green before pushing.

## Testing notes

- Unit: `*.spec.ts` colocated; translate-dependent specs use `TranslateNoOpLoader`; multi-user flows use `actingAs()` semantics — one auth context per flow (guard caches user per app instance).
- E2E (`e2e/*.e2e.ts`, read-only on seeded dev DB): guest redirect, login → students → charts → logout.
- Backend must run for e2e (`npm run e2e` starts it via `webServer` config).

## Deploy notes (F13 will detail)

`npm run build` → upload `dist/alotrojah/browser/` to `https://alotrojah.ma/`
(static host; `base-href /`; SPA fallback to `index.html` required server-side).
