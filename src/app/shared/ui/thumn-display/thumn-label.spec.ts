import { sessionAmountLabel } from './thumn-label';

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
