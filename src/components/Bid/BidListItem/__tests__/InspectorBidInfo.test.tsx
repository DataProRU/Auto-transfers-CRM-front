import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InspectorBidInfo from '../InspectorBidInfo';
import { makeBid } from '@/utils/test/factories.ts';

describe('InspectorBidInfo', () => {
  const defaultBid = makeBid({
    brand: 'BMW',
    model: 'X5',
    vin: 'BMW123456789',
    client: {
      id: 1,
      full_name: 'Анна Сидорова',
      phone: '+9876543210',
      telegram: '@anna',
      company: null,
      address: null,
      email: 'anna@example.com',
    },
    transit_method: 're_export',
    location: 'Склад №1',
  });

  const renderInspectorBidInfo = (bid = defaultBid) => {
    return render(<InspectorBidInfo bid={bid} />);
  };

  describe('Рендеринг', () => {
    it('рендерит компонент с правильным data-testid', () => {
      renderInspectorBidInfo(defaultBid);

      expect(screen.getByTestId('inspectorBidInfo')).toBeInTheDocument();
    });

    it('отображает все поля', () => {
      renderInspectorBidInfo();

      expect(screen.getByText('BMW X5')).toBeInTheDocument();
      expect(screen.getByText('VIN: BMW123456789')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Анна Сидорова')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
      expect(screen.getByText('Местонахождение: Склад №1')).toBeInTheDocument();
    });

    it('отображает "Не указан" для неизвестного метода транзита', () => {
      const bid = makeBid({
        transit_method: 'unknown_method',
      });
      renderInspectorBidInfo(bid);

      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
    });

    it('отображает местонахождение когда оно указано', () => {
      const bid = makeBid({
        location: 'ул. Ленина, д. 10',
      });
      renderInspectorBidInfo(bid);

      expect(
        screen.getByText('Местонахождение: ул. Ленина, д. 10')
      ).toBeInTheDocument();
    });

    it('отображает "Не указано" когда местонахождение не указано', () => {
      const bid = makeBid({
        location: null,
      });
      renderInspectorBidInfo(bid);

      expect(
        screen.getByText('Местонахождение: Не указано')
      ).toBeInTheDocument();
    });

    it('отображает разные методы транзита корректно', () => {
      const t1Bid = makeBid({ transit_method: 't1' });
      renderInspectorBidInfo(t1Bid);
      expect(screen.getByText('Метод транзита: T1')).toBeInTheDocument();

      const withoutOpeningBid = makeBid({ transit_method: 'without_openning' });
      renderInspectorBidInfo(withoutOpeningBid);
      expect(
        screen.getByText('Метод транзита: Без открытия')
      ).toBeInTheDocument();
    });

    it('отображает информацию о клиенте корректно', () => {
      const bid = makeBid({
        client: {
          id: 2,
          full_name: 'Иван Петров',
          phone: '+1234567890',
          telegram: '@ivan',
          company: 'ООО Тест',
          address: 'г. Москва',
          email: 'ivan@test.com',
        },
      });
      renderInspectorBidInfo(bid);

      expect(screen.getByText('Клиент: Иван Петров')).toBeInTheDocument();
    });
  });
});
