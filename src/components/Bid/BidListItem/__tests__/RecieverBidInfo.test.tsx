import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecieverBidInfo from '../RecieverBidInfo';
import { makeBid, makeClient } from '@/utils/test/factories.ts';

describe('RecieverBidInfo', () => {
  const defaultBid = makeBid({
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    vin: 'VIN123456789012345',
    transit_method: 're_export',
    client: makeClient({
      full_name: 'Иван Иванов',
    }),
    vehicle_transporter: {
      id: 1,
      number: 'АВ-123-45',
    },
    pickup_address: 'ул. Ленина, д. 10',
  });

  const renderReExportBidInfo = (bid = defaultBid) => {
    return render(<RecieverBidInfo bid={bid} />);
  };

  describe('Рендеринг', () => {
    it('рендерит компонент с правильным data-testid', () => {
      renderReExportBidInfo(defaultBid);

      expect(screen.getByTestId('recieverBidInfo')).toBeInTheDocument();
    });

    it('отображает все поля', () => {
      renderReExportBidInfo();

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('VIN: VIN123456789012345')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Иван Иванов')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
      expect(screen.getByText('№ автовоза: АВ-123-45')).toBeInTheDocument();
    });

    it('отображает "Не указан" для неизвестного метода транзита', () => {
      const bid = makeBid({
        transit_method: 'unknown_method',
      });
      renderReExportBidInfo(bid);

      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
    });

    it('отображает № автовоза "Не указан" когда его нет', () => {
      const bid = makeBid({
        vehicle_transporter: undefined,
      });
      renderReExportBidInfo(bid);

      expect(screen.getByText('№ автовоза: Не указан')).toBeInTheDocument();
    });
  });
});
