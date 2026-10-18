// scripts/sync-api.mjs — regenerate frontend API model types from the backend's
// Scramble OpenAPI spec (OpenAPI 3.1, served at /docs/api.json). Run
// `npm run api:sync` whenever the backend API changes and commit the result.
// The backend dev server must be up — Scramble builds the spec on demand.
//
// Env overrides:
//   API_SPEC_URL  spec URL        (default http://127.0.0.1:8000/docs/api.json)
//   API_SPEC_OUT  output dir      (default src/app/core/api/models)
import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

const SPEC_URL = process.env.API_SPEC_URL ?? 'http://127.0.0.1:8000/docs/api.json';
const OUT = resolve(process.env.API_SPEC_OUT ?? 'src/app/core/api/models');

let spec;
try {
  const res = await fetch(SPEC_URL);
  if (!res.ok) {
    console.error(`sync-api: ${SPEC_URL} answered HTTP ${res.status}. Is the backend dev server (:8000) up?`);
    process.exit(1);
  }
  spec = await res.json();
} catch (err) {
  console.error(`sync-api: cannot reach ${SPEC_URL} (${err.cause?.code ?? err.message}). Is the backend dev server (:8000) up?`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

await createClient({
  input: spec,
  output: OUT,
  plugins: ['@hey-api/typescript'],
});

const schemas = Object.keys(spec.components?.schemas ?? {}).length;
console.log(`sync-api: ${schemas} schemas -> ${OUT}`);
console.log(`sync-api: spec ${SPEC_URL}`);
