import { Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

/**
 * Logs every untranslated key once per language instead of failing
 * silently (a missing key renders as its raw `a.b.c` path, which is how
 * the `common.active` regression shipped unnoticed). DevTools console is
 * the log sink; the i18n-keys.spec.ts suite is the CI gate.
 */
@Injectable({ providedIn: 'root' })
export class LogMissingTranslationHandler implements MissingTranslationHandler {
  private readonly seen = new Set<string>();

  handle(params: MissingTranslationHandlerParams): string {
    const lang = params.translateService.getCurrentLang() ?? '?';
    const signature = `${lang}:${params.key}`;
    if (!this.seen.has(signature)) {
      this.seen.add(signature);
      console.warn(`[i18n] missing translation "${params.key}" (lang: ${lang})`);
    }
    return params.key;
  }
}
