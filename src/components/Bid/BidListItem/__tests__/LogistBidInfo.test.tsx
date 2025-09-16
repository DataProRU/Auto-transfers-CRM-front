import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogistBidInfo from '../LogistBidInfo';
import { makeBid } from '@/utils/test/factories.ts';

const renderLogistBidInfo = (bid = makeBid()) => {
  return render(<LogistBidInfo bid={bid} />);
};

describe('LogistBidInfo', () => {
  describe('Рендеринг', () => {
    it('рендерит компонент с правильным data-testid', () => {
      const bid = makeBid();
      renderLogistBidInfo(bid);

      expect(screen.getByTestId('logistBidInfo')).toBeInTheDocument();
    });

    it('отображает марку и модель автомобиля', () => {
      const bid = makeBid({ brand: 'Toyota', model: 'Camry' });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    it('отображает VIN номер', () => {
      const bid = makeBid({ vin: 'VIN123456789012345' });
      renderLogistBidInfo(bid);

      expect(screen.getByText('VIN: VIN123456789012345')).toBeInTheDocument();
    });

    it('отображает имя клиента', () => {
      const bid = makeBid({
        client: {
          full_name: 'Иван Иванов',
          id: 1,
          phone: '+1234567890',
          telegram: '@ivan',
          company: null,
          address: null,
          email: 'ivan@example.com',
        },
      });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Клиент: Иван Иванов')).toBeInTheDocument();
    });

    it('отображает метод транзита', () => {
      const bid = makeBid({ transit_method: 't1' });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Метод транзита: T1')).toBeInTheDocument();
    });
  });

  describe('Методы транзита', () => {
    it('отображает T1 для метода t1', () => {
      const bid = makeBid({ transit_method: 't1' });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Метод транзита: T1')).toBeInTheDocument();
    });

    it('отображает Реэкспорт для метода re_export', () => {
      const bid = makeBid({ transit_method: 're_export' });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
    });

    it('отображает Без открытия для метода without_openning', () => {
      const bid = makeBid({ transit_method: 'without_openning' });
      renderLogistBidInfo(bid);

      expect(
        screen.getByText('Метод транзита: Без открытия')
      ).toBeInTheDocument();
    });

    it('отображает Не указан для неизвестного метода', () => {
      const bid = makeBid({ transit_method: 'unknown_method' });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
    });
  });

  describe('Дата открытия контейнера', () => {
    it('отображает дату когда openning_date указана', () => {
      const bid = makeBid({ openning_date: '2024-01-15' });
      renderLogistBidInfo(bid);

      expect(
        screen.getByText('Дата открытия контейнера: 15.01.2024')
      ).toBeInTheDocument();
    });

    it('отображает "Не указана" когда openning_date не указана', () => {
      const bid = makeBid({ openning_date: null });
      renderLogistBidInfo(bid);

      expect(
        screen.getByText('Дата открытия контейнера: Не указана')
      ).toBeInTheDocument();
    });

    it('отображает "Не указана" когда openning_date пустая строка', () => {
      const bid = makeBid({ openning_date: '' });
      renderLogistBidInfo(bid);

      expect(
        screen.getByText('Дата открытия контейнера: Не указана')
      ).toBeInTheDocument();
    });

    it('форматирует дату в правильном формате DD.MM.YYYY', () => {
      const bid = makeBid({ openning_date: '2024-12-25' });
      renderLogistBidInfo(bid);

      expect(
        screen.getByText('Дата открытия контейнера: 25.12.2024')
      ).toBeInTheDocument();
    });
  });

  describe('Интеграция с данными', () => {
    it('корректно отображает все поля заявки', () => {
      const bid = makeBid({
        brand: 'Audi',
        model: 'A4',
        vin: 'AUDI123456789012',
        client: {
          full_name: 'Петр Петров',
          id: 2,
          phone: '+9876543210',
          telegram: '@petr',
          company: null,
          address: null,
          email: 'petr@example.com',
        },
        transit_method: 're_export',
        openning_date: '2024-03-20',
      });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Audi A4')).toBeInTheDocument();
      expect(screen.getByText('VIN: AUDI123456789012')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Петр Петров')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
      expect(
        screen.getByText('Дата открытия контейнера: 20.03.2024')
      ).toBeInTheDocument();
    });

    it('обрабатывает заявку с минимальными данными', () => {
      const bid = makeBid({
        brand: 'Test',
        model: 'Car',
        vin: 'TEST123',
        client: {
          full_name: 'Test Client',
          id: 1,
          phone: '+1234567890',
          telegram: '@test',
          company: null,
          address: null,
          email: 'test@example.com',
        },
        transit_method: null,
        openning_date: null,
      });
      renderLogistBidInfo(bid);

      expect(screen.getByText('Test Car')).toBeInTheDocument();
      expect(screen.getByText('VIN: TEST123')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Test Client')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
      expect(
        screen.getByText('Дата открытия контейнера: Не указана')
      ).toBeInTheDocument();
    });
  });
});
