import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OpeningManagerBidInfo from '../OpeningManagerBidInfo';
import { makeBid } from '@/utils/test/factories.ts';

const renderOpeningManagerBidInfo = (bid = makeBid()) => {
  return render(<OpeningManagerBidInfo bid={bid} />);
};

describe('OpeningManagerBidInfo', () => {
  describe('Рендеринг', () => {
    it('рендерит компонент с правильным data-testid', () => {
      const bid = makeBid();
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByTestId('openingManagerBidInfo')).toBeInTheDocument();
    });

    it('отображает марку и модель автомобиля', () => {
      const bid = makeBid({ brand: 'Toyota', model: 'Camry' });
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    it('отображает VIN номер', () => {
      const bid = makeBid({ vin: 'VIN123456789012345' });
      renderOpeningManagerBidInfo(bid);

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
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Клиент: Иван Иванов')).toBeInTheDocument();
    });

    it('отображает метод транзита', () => {
      const bid = makeBid({ transit_method: 't1' });
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Метод транзита: T1')).toBeInTheDocument();
    });
  });

  describe('Методы транзита', () => {
    it('отображает T1 для метода t1', () => {
      const bid = makeBid({ transit_method: 't1' });
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Метод транзита: T1')).toBeInTheDocument();
    });

    it('отображает Реэкспорт для метода re_export', () => {
      const bid = makeBid({ transit_method: 're_export' });
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
    });

    it('отображает Без открытия для метода without_openning', () => {
      const bid = makeBid({ transit_method: 'without_openning' });
      renderOpeningManagerBidInfo(bid);

      expect(
        screen.getByText('Метод транзита: Без открытия')
      ).toBeInTheDocument();
    });

    it('отображает Не указан для неизвестного метода', () => {
      const bid = makeBid({ transit_method: 'unknown_method' as any });
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
    });
  });

  describe('Дата прибытия контейнера', () => {
    it('отображает дату когда arrival_date указана', () => {
      const bid = makeBid({ arrival_date: '2024-01-15' });
      renderOpeningManagerBidInfo(bid);

      expect(
        screen.getByText('Предпологаемая дата прибытия контейнера: 15.01.2024')
      ).toBeInTheDocument();
    });

    it('отображает "Не указана" когда arrival_date не указана', () => {
      const bid = makeBid({ arrival_date: undefined });
      renderOpeningManagerBidInfo(bid);

      expect(
        screen.getByText('Предпологаемая дата прибытия: Не указана')
      ).toBeInTheDocument();
    });

    it('отображает "Не указана" когда arrival_date пустая строка', () => {
      const bid = makeBid({ arrival_date: '' });
      renderOpeningManagerBidInfo(bid);

      expect(
        screen.getByText('Предпологаемая дата прибытия: Не указана')
      ).toBeInTheDocument();
    });

    it('форматирует дату в правильном формате DD.MM.YYYY', () => {
      const bid = makeBid({ arrival_date: '2024-12-25' });
      renderOpeningManagerBidInfo(bid);

      expect(
        screen.getByText('Предпологаемая дата прибытия контейнера: 25.12.2024')
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
        arrival_date: '2024-03-20',
      });
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Audi A4')).toBeInTheDocument();
      expect(screen.getByText('VIN: AUDI123456789012')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Петр Петров')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Реэкспорт')).toBeInTheDocument();
      expect(
        screen.getByText('Предпологаемая дата прибытия контейнера: 20.03.2024')
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
        transit_method: undefined,
        arrival_date: undefined,
      });
      renderOpeningManagerBidInfo(bid);

      expect(screen.getByText('Test Car')).toBeInTheDocument();
      expect(screen.getByText('VIN: TEST123')).toBeInTheDocument();
      expect(screen.getByText('Клиент: Test Client')).toBeInTheDocument();
      expect(screen.getByText('Метод транзита: Не указан')).toBeInTheDocument();
      expect(
        screen.getByText('Предпологаемая дата прибытия: Не указана')
      ).toBeInTheDocument();
    });
  });
});
