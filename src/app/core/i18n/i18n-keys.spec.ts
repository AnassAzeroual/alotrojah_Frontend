// @vitest-environment node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

/**
 * Guards the i18n dictionaries. JSON.parse silently keeps the LAST of
 * duplicate keys (this once wiped the whole `common` block in ar.json),
 * so duplicates are detected by scanning the raw file text, and key
 * parity across locales is asserted on the parsed objects.
 */

function raw(locale: string): string {
  return readFileSync(join(cwd(), 'public', 'assets', 'i18n', `${locale}.json`), 'utf8');
}

function duplicateKeys(text: string): string[] {
  const dupes: string[] = [];
  // stack of {path, keys} per open object
  const stack: Array<{ path: string; keys: Set<string> }> = [];
  let i = 0;

  const skipWs = (): void => {
    while (i < text.length && /\s/.test(text[i])) i++;
  };
  const readString = (): string => {
    // assumes text[i] === '"'
    i++;
    let out = '';
    while (i < text.length) {
      const c = text[i];
      if (c === '\\') {
        out += c + (text[i + 1] ?? '');
        i += 2;
        continue;
      }
      if (c === '"') {
        i++;
        return out;
      }
      out += c;
      i++;
    }
    return out;
  };

  while (i < text.length) {
    const c = text[i];
    if (c === '{') {
      stack.push({ path: '', keys: new Set() });
      i++;
    } else if (c === '}') {
      stack.pop();
      i++;
    } else if (c === '"') {
      const key = readString();
      skipWs();
      if (text[i] === ':') {
        const top = stack[stack.length - 1];
        if (top) {
          if (top.keys.has(key)) dupes.push(`${top.path || '<root>'}.${key}`);
          else top.keys.add(key);
          // descend path for nested objects: peek ahead for '{'
          let j = i + 1;
          while (j < text.length && /\s/.test(text[j])) j++;
          if (text[j] === '{') top.path = top.path ? `${top.path}.${key}` : key;
        }
        i++;
      }
    } else {
      i++;
    }
  }
  return [...new Set(dupes)];
}

function flatKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('i18n dictionaries', () => {
  const locales = ['ar', 'fr', 'en'] as const;

  it.each(locales)('%s has no duplicate keys', (locale) => {
    expect(duplicateKeys(raw(locale))).toEqual([]);
  });

  it('has identical key sets across ar/fr/en', () => {
    const ar = new Set(flatKeys(JSON.parse(raw('ar')) as unknown));
    for (const locale of locales.slice(1)) {
      const keys = new Set(flatKeys(JSON.parse(raw(locale)) as unknown));
      const missing = [...ar].filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !ar.has(k));
      expect({ locale, missing, extra }).toEqual({ locale, missing: [], extra: [] });
    }
  });

  it('covers every backend error code in all locales', () => {
    // api-errors.ts API_ERROR_CODES must each resolve under apiErrors in
    // ar/fr/en — otherwise the UI falls back to a generic message (or worse).
    // Codes are read from source so the list cannot drift from the parser.
    const src = readFileSync(join(cwd(), 'src', 'app', 'core', 'api', 'api-errors.ts'), 'utf8');
    const list = [...src.matchAll(/'([A-Z][A-Z_]+)'/g)].map((m) => m[1]);
    expect(list.length).toBeGreaterThan(0);
    for (const locale of locales) {
      const dict = JSON.parse(raw(locale)) as Record<string, Record<string, unknown>>;
      const missing = [...new Set(list)].filter((c) => !(c in (dict['apiErrors'] ?? {})));
      expect({ locale, missing }).toEqual({ locale, missing: [] });
    }
  });

  it('covers every status-badge value union', () => {
    // status-badge builds `prefix.value` at runtime, so static template
    // scanning cannot see these — enumerate the unions instead.
    // Value lists mirror the backend enums + api-models conventions.
    const ar = JSON.parse(raw('ar')) as Record<string, Record<string, unknown>>;
    const cases: Array<[string, string[]]> = [
      ['attendance', ['present', 'late', 'absent', 'excused']],
      ['honor', ['none', 'tashji3', 'intibah']],
      ['weekType', ['study', 'review']],
      ['common', ['active', 'paused', 'graduated', 'left']], // kind="generic" + status
      ['role', ['admin', 'supervisor', 'teacher', 'student', 'board']],
      ['mode', ['surah', 'thumn']],
      ['examType', ['hizb_completion', 'term_batch', 'final_season']],
      ['scopeType', ['weekly', 'murajaa']],
      ['notif', ['queued', 'sent', 'failed']],
    ];
    for (const [prefix, values] of cases) {
      const missing = values.filter((v) => !(prefix in ar) || !(v in (ar[prefix] as object)));
      expect({ prefix, missing }).toEqual({ prefix, missing: [] });
    }
  });

  it('covers every literal key used in templates', () => {
    const ar = JSON.parse(raw('ar')) as unknown;
    const resolve = (key: string): boolean => {
      let node: unknown = ar;
      for (const part of key.split('.')) {
        if (typeof node !== 'object' || node === null || !(part in node)) return false;
        node = (node as Record<string, unknown>)[part];
      }
      return typeof node === 'string';
    };
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.html$/.test(entry) || (/\.ts$/.test(entry) && !/\.spec\.ts$/.test(entry)))
          files.push(full);
      }
    };
    walk(join(cwd(), 'src'));
    const pattern = /['"]([a-zA-Z][\w]*\.[\w.]+)['"]\s*\|\s*translate/g;
    const missing = new Set<string>();
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(pattern)) {
        if (!resolve(match[1])) missing.add(`${match[1]} (${file.split('src')[1]})`);
      }
    }
    expect([...missing]).toEqual([]);
  });
});
