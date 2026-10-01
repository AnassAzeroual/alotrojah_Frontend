// @vitest-environment node
import { readFileSync } from 'node:fs';
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
});
