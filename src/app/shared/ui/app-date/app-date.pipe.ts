import { Pipe, PipeTransform } from '@angular/core';

/**
 * ISO date/datetime strings (the API's DATE columns travel format-free) as
 * day/month/year text: '2015-01-15' -> '15/01/2015'. Pure + fail-open:
 * nullish renders the empty dash, anything unparsable passes through so a
 * date is never blanked by formatting. Native <input type="date"> controls
 * are NOT covered — their display follows the browser/OS locale and no
 * markup can force it; only rendered text goes through here.
 */
@Pipe({ name: 'appDate', standalone: true })
export class AppDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return value;
    return `${m[3]}/${m[2]}/${m[1]}`;
  }
}
