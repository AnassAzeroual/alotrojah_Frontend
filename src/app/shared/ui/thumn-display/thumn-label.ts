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

/**
 * Smart weekly amount label — the name the seed rows use, so a level is
 * named for what a pupil memorises per WEEK, not per session. Quarter-hizb
 * steps read as fractions (2 ربع · 4 نصف · 6 ثلاثة أرباع · 8 حزب ·
 * 10 حزب و ربع); anything else stays in thumn (3 أثمان · 3.75 أثمان).
 * Matches the seed names: L1 نصف · L2 3 أثمان · L3 ربع.
 * Pure and total — safe for specs.
 */
export function weekAmountLabel(week: number | null): string {
  if (week === null || week <= 0) return '';
  const h = Math.floor(week / 8);
  const r = round2(week - h * 8);
  const fraction = r === 2 ? 'ربع' : r === 4 ? 'نصف' : r === 6 ? 'ثلاثة أرباع' : '';
  if (fraction !== '') return h === 0 ? fraction : `${h} ${hizbWord(h)} و ${fraction}`;
  if (r === 0) return h === 0 ? '' : `${h} ${hizbWord(h)}`;
  const rest = r === 1 ? 'ثمن' : `${r} ${thumnWord(r)}`;
  return h === 0 ? rest : `${h} ${hizbWord(h)} و ${rest}`;
}
