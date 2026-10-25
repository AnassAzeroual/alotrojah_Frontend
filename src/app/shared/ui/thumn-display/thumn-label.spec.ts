import { sessionAmountLabel, weekAmountLabel } from './thumn-label';

describe('sessionAmountLabel', () => {
  it('keeps legacy seed wording', () => {
    expect(sessionAmountLabel(1.25)).toBe('ثمن ويزيد');
    expect(sessionAmountLabel(1)).toBe('ثمن');
    expect(sessionAmountLabel(0.66)).toBe('أقل من ثمن');
    expect(sessionAmountLabel(null)).toBe('');
  });

  it('names quarters of hizb', () => {
    expect(sessionAmountLabel(2)).toBe('ربع حزب');
    expect(sessionAmountLabel(4)).toBe('نصف حزب');
    expect(sessionAmountLabel(6)).toBe('ثلاثة أرباع حزب');
  });

  it('decomposes larger amounts into hizb + remainder', () => {
    expect(sessionAmountLabel(8)).toBe('1 حزب');
    expect(sessionAmountLabel(16)).toBe('2 حزبان');
    expect(sessionAmountLabel(24)).toBe('3 أحزاب');
    expect(sessionAmountLabel(10)).toBe('1 حزب و 2 ثمنان');
    expect(sessionAmountLabel(3)).toBe('3 أثمان');
  });
});

describe('weekAmountLabel', () => {
  it('names the weekly total the way the seed rows do', () => {
    // L3 · L2 · L1 in the reference seed migration.
    expect(weekAmountLabel(2)).toBe('ربع');
    expect(weekAmountLabel(3)).toBe('3 أثمان');
    expect(weekAmountLabel(4)).toBe('نصف');
  });

  it('handles single thumn, quarters and whole hizb', () => {
    expect(weekAmountLabel(1)).toBe('ثمن');
    expect(weekAmountLabel(6)).toBe('ثلاثة أرباع');
    expect(weekAmountLabel(8)).toBe('1 حزب');
    expect(weekAmountLabel(16)).toBe('2 حزبان');
    expect(weekAmountLabel(24)).toBe('3 أحزاب');
  });

  it('decomposes hizb + remainder', () => {
    expect(weekAmountLabel(10)).toBe('1 حزب و ربع');
    expect(weekAmountLabel(11)).toBe('1 حزب و 3 أثمان');
    expect(weekAmountLabel(9)).toBe('1 حزب و ثمن');
  });

  it('keeps non-quarter amounts in thumn instead of rounding', () => {
    // 3 × 1.25 = 3.75: exact fractions only (owner decision 2026-10-24).
    expect(weekAmountLabel(3.75)).toBe('3.75 أثمان');
    expect(weekAmountLabel(5)).toBe('5 أثمان');
    expect(weekAmountLabel(7)).toBe('7 أثمان');
  });

  it('is blank for empty or non-positive weeks', () => {
    expect(weekAmountLabel(null)).toBe('');
    expect(weekAmountLabel(0)).toBe('');
    expect(weekAmountLabel(-3)).toBe('');
  });
});
