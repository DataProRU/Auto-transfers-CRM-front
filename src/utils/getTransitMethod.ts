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
