import {
  getTransitMethod,
  getAcceptanceType,
} from '@/utils/getSelectFieldText';

describe('getTransitMethod и getAcceptanceType', () => {
  describe('getTransitMethod', () => {
    it('должен возвращать "T1" при выборе "t1"', () => {
      expect(getTransitMethod('t1')).toBe('T1');
    });

    it('должен возвращать "Реэкспорт" при выборе "re_export"', () => {
      expect(getTransitMethod('re_export')).toBe('Реэкспорт');
    });

    it('должен возвращать "Без открытия" при выборе "without_openning"', () => {
      expect(getTransitMethod('without_openning')).toBe('Без открытия');
    });

    it('должен возвращать "Не указан" для unknown', () => {
      expect(getTransitMethod('unknown')).toBe('Не указан');
    });

    it('должен возвращать "Не указан" для пустой строки', () => {
      expect(getTransitMethod('')).toBe('Не указан');
    });
  });

  describe('getAcceptanceType', () => {
    it('должен возвращать "С реэспортом" при выборе "with_re_export"', () => {
      expect(getAcceptanceType('with_re_export')).toBe('С реэспортом');
    });

    it('должен возвращать "Без реэспорта" при выборе "without_re_export"', () => {
      expect(getAcceptanceType('without_re_export')).toBe('Без реэспорта');
    });

    it('должен возвращать "Не указан" для unknown', () => {
      expect(getAcceptanceType('unknown')).toBe('Не указан');
    });

    it('должен возвращать "Не указан" для пустой строки', () => {
      expect(getAcceptanceType('')).toBe('Не указан');
    });
  });
});
