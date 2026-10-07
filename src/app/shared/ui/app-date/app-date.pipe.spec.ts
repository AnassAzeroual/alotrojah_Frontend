import { AppDatePipe } from './app-date.pipe';

describe('AppDatePipe', () => {
  const pipe = new AppDatePipe();

  it('renders ISO dates as day/month/year', () => {
    expect(pipe.transform('2015-01-15')).toBe('15/01/2015');
    expect(pipe.transform('2026-11-18')).toBe('18/11/2026');
  });

  it('renders the empty dash for nullish input', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('')).toBe('—');
  });

  it('passes unparsable values through instead of blanking them', () => {
    expect(pipe.transform('not-a-date')).toBe('not-a-date');
  });
});
