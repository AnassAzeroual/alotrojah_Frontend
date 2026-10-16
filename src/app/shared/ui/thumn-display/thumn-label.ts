/** Thumn plural forms (data wording, always Arabic like the seed rows). */
const thumnWord = (n: number): string =>
  n === 1 ? 'ثمن' : n === 2 ? 'ثمنان' : n <= 10 ? 'أثمان' : 'ثمن';

/** Hizb plural forms (1 حزب · 2 حزبان · 3–10 أحزاب · else حزب). */
const hizbWord = (n: number): string =>
  n === 1 ? 'حزب' : n === 2 ? 'حزبان' : n <= 10 ? 'أحزاب' : 'حزب';

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Smart per-session amount label: quarters get their fraction name
 * (ربع/نصف/ثلاثة أرباع حزب), legacy seed units keep their wording
 * (ثمن ويزيد…), larger amounts decompose into hizb + remainder
 * (10 → "1 حزب و ثمنان"). Pure and total — safe for specs.
 */
export function sessionAmountLabel(unit: number | null): string {
  if (unit === null) return '';
  if (unit === 1.25) return 'ثمن ويزيد';
  if (unit === 1) return 'ثمن';
  if (unit === 0.66 || unit === 0.67) return 'أقل من ثمن';
  if (unit === 2) return 'ربع حزب';
  if (unit === 4) return 'نصف حزب';
  if (unit === 6) return 'ثلاثة أرباع حزب';
  const h = Math.floor(unit / 8);
  const r = round2(unit - h * 8);
  if (h === 0) return `${unit} ${thumnWord(unit)}`;
  const head = `${h} ${hizbWord(h)}`;
  return r === 0 ? head : `${head} و ${r} ${thumnWord(r)}`;
}
