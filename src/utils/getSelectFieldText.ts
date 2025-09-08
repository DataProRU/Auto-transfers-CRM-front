export const getTransitMethod = (method: string) => {
  switch (method) {
    case 't1':
      return 'T1';
    case 're_export':
      return 'Реэкспорт';
    case 'without_openning':
      return 'Без открытия';
    default:
      return 'Не указан';
  }
};

export const getAcceptanceType = (type: string) => {
  switch (type) {
    case 'with_re_export':
      return 'С реэспортом';
    case 'without_re_export':
      return 'Без реэспорта';
    default:
      return 'Не указан';
  }
};
