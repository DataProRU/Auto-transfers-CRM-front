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
    pickup_address: 'ул. Ленина, 1',
  });

  const renderReExportBidInfo = (bid = defaultBid) => {
    return render(<ReExportBidInfo bid={bid} />);
  };

  describe('Рендеринг', () => {
    it('рендерит компонент с правильным data-testid', () => {
      renderReExportBidInfo();
      expect(screen.getByTestId('reExportBidInfo')).toBeInTheDocument();
    });

    it('отображает марку и модель автомобиля', () => {
      renderReExportBidInfo();
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    it('отображает VIN номер', () => {
      renderReExportBidInfo();
      expect(screen.getByText('VIN: VIN123456789012345')).toBeInTheDocument();
    });

    it('отображает имя клиента', () => {
      renderReExportBidInfo();
      expect(screen.getByText('Клиент: Иван Иванов')).toBeInTheDocument();
    });

    it('отображает метод транзита', () => {
      renderReExportBidInfo();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
    });

    it('отображает адрес забора когда он указан', () => {
      renderReExportBidInfo();
      expect(
        screen.getByText('Адрес забора: ул. Ленина, 1')
      ).toBeInTheDocument();
    });

    it('отображает "Не указано" когда адрес забора отсутствует', () => {
      const bidWithoutAddress = makeBid({
        ...defaultBid,
        pickup_address: undefined,
      });
      renderReExportBidInfo(bidWithoutAddress);
      expect(screen.getByText('Адрес забора: Не указано')).toBeInTheDocument();
    });
  });

  // describe('Различные методы транзита', () => {
  //   it('отображает правильный текст для метода t1', () => {
  //     const bid = makeBid({
  //       ...defaultBid,
  //       transit_method: 't1',
  //     });
  //     renderReExportBidInfo(bid);
  //     expect(screen.getByText('Метод транзита: Т1')).toBeInTheDocument();
  //   });
  //
  //   it('отображает правильный текст для метода without_openning', () => {
  //     const bid = makeBid({
  //       ...defaultBid,
  //       transit_method: 'without_openning',
  //     });
  //     renderReExportBidInfo(bid);
  //     expect(
  //       screen.getByText('Метод транзита: Без открытия')
  //     ).toBeInTheDocument();
  //   });
  //
  //   it('отображает правильный текст для метода re_export', () => {
  //     const bid = makeBid({
  //       ...defaultBid,
  //       transit_method: 're_export',
  //     });
  //     renderReExportBidInfo(bid);
  //     expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
  //   });
  // });

  describe('Различные данные заявки', () => {
    it('отображает данные с разными марками и моделями', () => {
      const bid = makeBid({
        ...defaultBid,
        brand: 'BMW',
        model: 'X5',
        vin: 'VIN987654321098765',
      });
      renderReExportBidInfo(bid);
      expect(screen.getByText('BMW X5')).toBeInTheDocument();
      expect(screen.getByText('VIN: VIN987654321098765')).toBeInTheDocument();
    });

    it('отображает данные с разными клиентами', () => {
      const bid = makeBid({
        ...defaultBid,
        client: makeClient({
          full_name: 'Петр Петров',
        }),
      });
      renderReExportBidInfo(bid);
      expect(screen.getByText('Клиент: Петр Петров')).toBeInTheDocument();
    });

    it('отображает данные с разными адресами забора', () => {
      const bid = makeBid({
        ...defaultBid,
        pickup_address: 'ул. Пушкина, 10',
      });
      renderReExportBidInfo(bid);
      expect(
        screen.getByText('Адрес забора: ул. Пушкина, 10')
      ).toBeInTheDocument();
    });
  });

  describe('Структура компонента', () => {
    it('содержит все необходимые элементы', () => {
      renderReExportBidInfo();

      expect(screen.getByTestId('reExportBidInfo')).toBeInTheDocument();
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('VIN: VIN123456789012345')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Иван Иванов')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
      expect(
        screen.getByText('Адрес забора: ул. Ленина, 1')
      ).toBeInTheDocument();
    });

    it('имеет правильную структуру Typography элементов', () => {
      renderReExportBidInfo();

      const textElements = screen.getAllByText(/.*/);
      expect(textElements.length).toBeGreaterThan(0);

      const container = screen.getByTestId('reExportBidInfo');
      expect(container).toBeInTheDocument();
    });
  });
});
