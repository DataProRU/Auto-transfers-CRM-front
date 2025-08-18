import { getTransitMethod } from '../getTransitMethod';

describe('getTransitMethod', () => {
  it('should return "T1" for method "t1"', () => {
    expect(getTransitMethod('t1')).toBe('T1');
  });

  it('should return "Реэкспорт" for method "re_export"', () => {
    expect(getTransitMethod('re_export')).toBe('Реэкспорт');
  });

  it('should return "Без открытия" for method "without_openning"', () => {
    expect(getTransitMethod('without_openning')).toBe('Без открытия');
  });

  it('should return "Не указан" for unknown method', () => {
    expect(getTransitMethod('unknown')).toBe('Не указан');
  });

  it('should return "Не указан" for empty string', () => {
    expect(getTransitMethod('')).toBe('Не указан');
  });
});
