import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReExportBidInfo from '../ReExportBidInfo';
import { makeBid, makeClient } from '@/utils/test/factories.ts';

describe('ReExportBidInfo', () => {
  const defaultBid = makeBid({
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    vin: 'VIN123456789012345',
    transit_method: 're_export',
    client: makeClient({
      full_name: 'Иван Иванов',
    }),
    pickup_address: 'ул. Ленина, д. 10',
  });

  const renderReExportBidInfo = (bid = defaultBid) => {
    return render(<ReExportBidInfo bid={bid} />);
  };

  describe('Рендеринг', () => {
    it('рендерит компонент с правильным data-testid', () => {
      renderReExportBidInfo(defaultBid);

      expect(screen.getByTestId('reExportBidInfo')).toBeInTheDocument();
    });

    it('отображает все поля', () => {
      renderReExportBidInfo();

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('VIN: VIN123456789012345')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Иван Иванов')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
      expect(
        screen.getByText('Адрес забора: ул. Ленина, д. 10')
      ).toBeInTheDocument();
    });

    it('отображает "Не указан" для неизвестного метода транзита', () => {
      const bid = makeBid({
        transit_method: 'unknown_method',
      });
      renderReExportBidInfo(bid);

      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
    });

    it('отображает адрес забора когда он указан', () => {
      const bid = makeBid({
        pickup_address: 'ул. Ленина, д. 10',
      });
      renderReExportBidInfo(bid);

      expect(
        screen.getByText('Адрес забора: ул. Ленина, д. 10')
      ).toBeInTheDocument();
    });

    it('отображает "Не указан" когда адрес забора не указан', () => {
      const bid = makeBid({
        pickup_address: null,
      });
      renderReExportBidInfo(bid);

      expect(screen.getByText('Адрес забора: Не указано')).toBeInTheDocument();
    });
  });
});
