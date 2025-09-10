import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TitleBidInfo from '../TitleBidInfo';
import { makeBid } from '@/utils/test/factories.ts';

describe('TitleBidInfo', () => {
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
    pickup_address: 'пр. Мира, д. 25',
  });

  const renderTitleBidInfo = (bid = defaultBid) => {
    return render(<TitleBidInfo bid={bid} />);
  };

  describe('Рендеринг', () => {
    it('рендерит компонент с правильным data-testid', () => {
      renderTitleBidInfo(defaultBid);

      expect(screen.getByTestId('titleBidInfo')).toBeInTheDocument();
    });

    it('отображает все поля', () => {
      const bid = makeBid({
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
        pickup_address: 'пр. Мира, д. 25',
      });
      renderTitleBidInfo(bid);

      expect(screen.getByText('BMW X5')).toBeInTheDocument();
      expect(screen.getByText('VIN: BMW123456789')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Анна Сидорова')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
      expect(
        screen.getByText('Адрес забора: пр. Мира, д. 25')
      ).toBeInTheDocument();
    });

    it('отображает "Не указан" для неизвестного метода транзита', () => {
      const bid = makeBid({
        transit_method: 'unknown_method',
      });
      renderTitleBidInfo(bid);

      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
    });

    it('отображает адрес забора когда он указан', () => {
      const bid = makeBid({
        pickup_address: 'ул. Ленина, д. 10',
      });
      renderTitleBidInfo(bid);

      expect(
        screen.getByText('Адрес забора: ул. Ленина, д. 10')
      ).toBeInTheDocument();
    });

    it('отображает "Не указан" когда адрес забора не указан', () => {
      const bid = makeBid({
        pickup_address: null,
      });
      renderTitleBidInfo(bid);

      expect(screen.getByText('Адрес забора: Не указан')).toBeInTheDocument();
    });
  });
});
