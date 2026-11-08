import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { pruneApiTypes } from './prune-api-types.mjs';

test('removes legacy review/revision types and index exports', () => {
  const dir = mkdtempSync(join(tmpdir(), 'api-prune-'));
  writeFileSync(
    join(dir, 'types.gen.ts'),
    `export type Keep = { id: number };\n` +
      `/**\n * MurajaaReviewResource\n */\nexport type MurajaaReviewResource = { id: number };\n` +
      `export type RevisionLog = { id: number };\n` +
      `export type Dashboard = { murajaa_cycles: Array<MurajaaReviewResource>; revision: Array<RevisionLog>; keep: number };\n`,
  );
  writeFileSync(
    join(dir, 'index.ts'),
    `export type { Keep, MurajaaReviewResource, RevisionLog } from './types.gen';\n`,
  );

  pruneApiTypes(dir);

  const types = readFileSync(join(dir, 'types.gen.ts'), 'utf8');
  const index = readFileSync(join(dir, 'index.ts'), 'utf8');
  assert.match(types, /Keep/);
  assert.match(index, /Keep/);
  assert.doesNotMatch(types, /MurajaaReview|RevisionLog|murajaa_cycles|revision:/);
  assert.doesNotMatch(index, /MurajaaReview|RevisionLog/);
});
