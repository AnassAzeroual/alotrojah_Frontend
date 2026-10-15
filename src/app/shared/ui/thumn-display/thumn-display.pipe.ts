import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';
import type { AppLang } from '../../../core/i18n/language.service';

/**
 * A thumn count as teachers read it: below 8 it stays a bare thumn number
 * (legacy display); 8 thumn make 1 hizb, above that the value renders in
 * hizb with Arabic plural rules (1 حزب · 2 حزبان · 3–10 أحزاب · else حزب).
 * Unit words come from i18n (`unit.hizb_*`), never hardcoded. Pass the
 * current language explicitly so the pure pipe re-renders on locale switch.
 */
@Pipe({ name: 'thumnDisplay', standalone: true })
export class ThumnDisplayPipe implements PipeTransform {
  private readonly i18n = inject(TranslateService);

  transform(thumn: number | string | null | undefined, lang: AppLang): string {
    if (thumn === null || thumn === undefined || thumn === '') return '—';
    void lang;
    const n = Number(thumn);
    if (!Number.isFinite(n) || n < 8) return String(thumn);
    const h = Math.round((n / 8) * 100) / 100;
    const key =
      h === 1
        ? 'unit.hizb_one'
        : h === 2
          ? 'unit.hizb_two'
          : Number.isInteger(h) && h <= 10
            ? 'unit.hizb_few'
            : 'unit.hizb_other';
    const amount = Number.isInteger(h) ? String(h) : String(h);
    return `${amount} ${this.i18n.instant(key)}`;
  }
}
