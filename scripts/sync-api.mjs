// scripts/sync-api.mjs — regenerate frontend API model types from an OpenAPI
// spec. Run `npm run api:sync` whenever the backend API changes.
//
// The native v2 backend does not currently expose a Scramble/OpenAPI endpoint;
// use a spec export/snapshot through API_SPEC_URL or API_SPEC_FILE. The
// post-generation prune removes the retired review/revision endpoints even if
// an older snapshot still contains them.
//
// Env overrides:
//   API_SPEC_URL   spec URL       (default http://127.0.0.1:8000/docs/api.json)
//   API_SPEC_FILE  local spec JSON (takes precedence over URL)
//   API_SPEC_OUT   output dir     (default src/app/core/api/models)
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import { pruneApiTypes } from './prune-api-types.mjs';

const SPEC_URL = process.env.API_SPEC_URL ?? 'http://127.0.0.1:8000/docs/api.json';
const SPEC_FILE = process.env.API_SPEC_FILE;
const OUT = resolve(process.env.API_SPEC_OUT ?? 'src/app/core/api/models');

let spec;
try {
  if (SPEC_FILE) {
    spec = JSON.parse(readFileSync(resolve(SPEC_FILE), 'utf8'));
  } else {
    const res = await fetch(SPEC_URL);
    if (!res.ok) {
      console.error(
        `sync-api: ${SPEC_URL} answered HTTP ${res.status}. Is the backend dev server (:8000) up?`,
      );
      process.exit(1);
    }
    spec = await res.json();
  }
} catch (err) {
  const source = SPEC_FILE ? `file ${SPEC_FILE}` : SPEC_URL;
  console.error(`sync-api: cannot read ${source} (${err.cause?.code ?? err.message}).`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

await createClient({
  input: spec,
  output: OUT,
  plugins: ['@hey-api/typescript'],
});

const prune = pruneApiTypes(OUT);
const schemas = Object.keys(spec.components?.schemas ?? {}).length;
console.log(`sync-api: ${schemas} schemas -> ${OUT}`);
console.log(
  `sync-api: retired review/revision types pruned (types=${prune.typesRemoved > 0 ? 'yes' : 'already clean'}, index=${prune.indexChanged ? 'yes' : 'already clean'})`,
);
console.log(`sync-api: spec ${SPEC_FILE ?? SPEC_URL}`);
