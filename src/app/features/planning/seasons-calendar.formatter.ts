import { Injectable } from '@angular/core';
import {
  CalendarNativeDateFormatter,
  getWeekViewPeriod,
  type DateFormatterParams,
} from 'angular-calendar';

/**
 * Intl-based formatting tuned to the app's numeric conventions: Western
 * digits everywhere (appDate pipe, flatpickr d/m/Y, `ltr-num`) and 24h
 * `HH:00` hour rails (API times, `08:00 – 09:00` in the session detail).
 * Month/weekday names stay localized — the `-u-nu-latn` unicode extension
 * only swaps the digits, which matters for `ar` (Intl defaults to
 * Arabic-Indic there). `en`/`fr` are digit-neutral under the extension.
 */
@Injectable()
export class SeasonsCalendarFormatter extends CalendarNativeDateFormatter {
  override monthViewDayNumber({ date, locale }: DateFormatterParams): string {
    return this.intl(locale, { day: 'numeric' }, date);
  }

  override monthViewTitle({ date, locale }: DateFormatterParams): string {
    return this.intl(locale, { year: 'numeric', month: 'long' }, date);
  }

  override weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    return this.intl(locale, { day: 'numeric', month: 'short' }, date);
  }

  override weekViewTitle({
    date,
    locale,
    weekStartsOn,
    excludeDays,
    daysInWeek,
  }: DateFormatterParams): string {
    const { viewStart, viewEnd } = getWeekViewPeriod(
      this.dateAdapter,
      date,
      weekStartsOn ?? 0,
      excludeDays,
      daysInWeek,
    );
    const span = (d: Date, showYear: boolean): string =>
      this.intl(
        locale,
        { day: 'numeric', month: 'short', year: showYear ? 'numeric' : undefined },
        d,
      );
    const sameYear = viewStart.getUTCFullYear() === viewEnd.getUTCFullYear();
    return `${span(viewStart, !sameYear)} - ${span(viewEnd, true)}`;
  }

  override dayViewTitle({ date, locale }: DateFormatterParams): string {
    return this.intl(
      locale,
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      date,
    );
  }

  /** 24h hour rail (`08:00`) — matches how every time in the app is written. */
  override weekViewHour({ date }: DateFormatterParams): string {
    return this.hour(date);
  }

  override dayViewHour({ date }: DateFormatterParams): string {
    return this.hour(date);
  }

  private intl(
    locale: string | undefined,
    options: Intl.DateTimeFormatOptions,
    date: Date,
  ): string {
    const loc = locale ?? 'en';
    const digits = loc.includes('-u-') ? loc : `${loc}-u-nu-latn`;
    return new Intl.DateTimeFormat(digits, options).format(date);
  }

  private hour(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
}
