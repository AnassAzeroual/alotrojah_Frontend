/**
 * Remove legacy review/revision endpoints from generated API types.
 *
 * The native v2 backend no longer exposes /murajaa-reviews or /revision-logs,
 * but historical OpenAPI snapshots can still carry them. This runs immediately
 * after @hey-api/openapi-ts so a regeneration cannot silently re-add them.
 *
 * Usage:
 *   node scripts/prune-api-types.mjs [modelsDir]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const LEGACY_TYPE_NAME =
  /^(?:Murajaa(?:Review|Index|Store|Show|Destroy)|RevisionLog|StoreMurajaa|StoreRevision)/;
const LEGACY_TOKEN =
  /\b(?:Murajaa(?:Review|IndexReviews|StoreReview|ShowReview|DestroyReview|IndexLogs|StoreLog|ShowLog|DestroyLog)|RevisionLog|StoreMurajaa|StoreRevision)\w*/g;

export function pruneApiTypes(outDir = 'src/app/core/api/models') {
  const typesPath = resolve(outDir, 'types.gen.ts');
  const indexPath = resolve(outDir, 'index.ts');

  const typesSource = readFileSync(typesPath, 'utf8');
  const prunedTypes = pruneTypeAliases(typesSource);
  if (prunedTypes !== typesSource) writeFileSync(typesPath, prunedTypes);

  const indexSource = readFileSync(indexPath, 'utf8');
  const prunedIndex = pruneIndexExports(indexSource);
  if (prunedIndex !== indexSource) writeFileSync(indexPath, prunedIndex);

  const leaked = [
    ...(prunedTypes.match(LEGACY_TOKEN) ?? []),
    ...(prunedIndex.match(LEGACY_TOKEN) ?? []),
  ];
  if (leaked.length > 0) {
    throw new Error(
      `prune-api-types: legacy API types remain after pruning: ${[...new Set(leaked)].join(', ')}`,
    );
  }

  return {
    typesRemoved: typesSource === prunedTypes ? 0 : 1,
    indexChanged: indexSource !== prunedIndex,
  };
}

export function pruneTypeAliases(source) {
  const sourceFile = ts.createSourceFile(
    'types.gen.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const removals = [];

  const visit = (node) => {
    if (ts.isTypeAliasDeclaration(node) && LEGACY_TYPE_NAME.test(node.name.text)) {
      removals.push([node.getFullStart(), node.end]);
    }
    if (
      ts.isPropertySignature(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      (node.name.text === 'murajaa_cycles' || node.name.text === 'revision')
    ) {
      removals.push([node.getFullStart(), node.end]);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  removals.sort((a, b) => b[0] - a[0]);
  let result = source;
  for (const [start, end] of removals) {
    result = result.slice(0, start) + result.slice(end);
  }
  return result;
}

export function pruneIndexExports(source) {
  let result = source.replace(
    /\b(?:Murajaa|RevisionLog|StoreMurajaa|StoreRevision)\w*\b\s*,?/g,
    '',
  );
  result = result
    .replace(/,\s*(?:,\s*)+/g, ', ')
    .replace(/\{\s*,/g, '{')
    .replace(/,\s*\}/g, '}');
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const outDir = process.argv[2] ?? process.env.API_SPEC_OUT ?? 'src/app/core/api/models';
  const result = pruneApiTypes(outDir);
  console.log(
    `prune-api-types: legacy review/revision surface removed from ${outDir}` +
      ` (types=${result.typesRemoved > 0 ? 'pruned' : 'clean'}, index=${result.indexChanged ? 'pruned' : 'clean'})`,
  );
}
