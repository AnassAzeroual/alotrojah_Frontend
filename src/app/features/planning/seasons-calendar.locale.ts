import { L10n, loadCldr, registerLicense, setCulture } from '@syncfusion/ej2-base';
import { environment } from '../../../environments/environment';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as arGregorian from 'cldr-data/main/ar/ca-gregorian.json';
import * as arNumbers from 'cldr-data/main/ar/numbers.json';
import * as arTimeZones from 'cldr-data/main/ar/timeZoneNames.json';
import * as frGregorian from 'cldr-data/main/fr/ca-gregorian.json';
import * as frNumbers from 'cldr-data/main/fr/numbers.json';
import * as frTimeZones from 'cldr-data/main/fr/timeZoneNames.json';

/**
 * One-time EJ2 locale bootstrap (ar/fr CLDR + translated scheduler chrome).
 * English ships built-in. Called on every language switch; setCulture is
 * cheap, the loads run once.
 */
let bootstrapped = false;

// JSON-module interop without esModuleInterop (kept off: flatpickr relies
// on current semantics): namespace objects carry the payload on .default.
function cldr(mod: unknown): object {
  const rec = mod as Record<string, unknown>;
  return (rec['default'] ?? mod) as object;
}

// Community license key (user-claimed in the Syncfusion portal). Registered
// at module scope so it precedes the first scheduler render; empty =
// trial watermark until pasted.
registerLicense(environment.syncfusionKey);

const AR_SCHEDULE = {
  day: 'يوم',
  week: 'أسبوع',
  workWeek: 'أسبوع العمل',
  month: 'شهر',
  year: 'سنة',
  agenda: 'جدول الأعمال',
  timelineDay: 'الخط الزمني اليومي',
  timelineWeek: 'الخط الزمني الأسبوعي',
  timelineWorkWeek: 'خط أسبوع العمل',
  timelineMonth: 'الخط الزمني الشهري',
  today: 'اليوم',
  previous: 'السابق',
  next: 'التالي',
  noEvents: 'لا توجد حصص',
};

const FR_SCHEDULE = {
  day: 'Jour',
  week: 'Semaine',
  workWeek: 'Semaine de travail',
  month: 'Mois',
  year: 'Année',
  agenda: 'Agenda',
  timelineDay: 'Chronologie jour',
  timelineWeek: 'Chronologie semaine',
  timelineWorkWeek: 'Chronologie ouvrée',
  timelineMonth: 'Chronologie mois',
  today: "Aujourd'hui",
  previous: 'Précédent',
  next: 'Suivant',
  noEvents: 'Aucune séance',
};

export function ensureSchedulerLocale(lang: string): 'ar' | 'fr' | 'en' {
  const locale = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en';
  if (!bootstrapped) {
    loadCldr(
      cldr(numberingSystems),
      cldr(arGregorian),
      cldr(arNumbers),
      cldr(arTimeZones),
      cldr(frGregorian),
      cldr(frNumbers),
      cldr(frTimeZones),
    );
    L10n.load({ ar: { schedule: AR_SCHEDULE }, fr: { schedule: FR_SCHEDULE } });
    bootstrapped = true;
  }
  setCulture(locale);
  return locale;
}
