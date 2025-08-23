import { render, screen, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DefaultRequests from '../DefaultRequests';
import '@testing-library/jest-dom';
import bidStore from '@/store/BidStore';
import { makeBid, makeClient } from '@/utils/test/factories.ts';

const mockedShowNotification = jest.fn();
jest.mock('@/providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
}));

jest.mock('@/store/BidStore', () => ({
  __esModule: true,
  default: {
    fetchBids: jest.fn().mockResolvedValue([]),
    bidError: null,
    isBidLoading: false,
    untouchedBids: [],
    inProgressBids: [],
  },
}));

const mockBidStore = bidStore as jest.Mocked<typeof bidStore>;
const mockFetchBids = mockBidStore.fetchBids;

jest.mock('@/store/AuthStore', () => ({
  authStore: {
    role: 'logistician',
  },
}));

const renderDefaultRequests = () => {
  return render(
    <BrowserRouter>
      <DefaultRequests />
    </BrowserRouter>
  );
};

describe('DefaultRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockBidStore.bidError = null;
    mockBidStore.isBidLoading = false;
    mockBidStore.untouchedBids = [];
    mockBidStore.inProgressBids = [];
  });

  describe('Рендеринг', () => {
    it('рендерит заголовок страницы', () => {
      renderDefaultRequests();
      expect(screen.getByText('Заявки')).toBeInTheDocument();
    });

    it('рендерит две колонки: Необработанные и В работе', () => {
      renderDefaultRequests();
      expect(screen.getByText('Необработанные')).toBeInTheDocument();
      expect(screen.getByText('В работе')).toBeInTheDocument();
    });
  });

  describe('Загрузка данных', () => {
    it('вызывает fetchBids при монтировании компонента', () => {
      renderDefaultRequests();
      expect(mockFetchBids).toHaveBeenCalledTimes(1);
    });

    it('показывает индикатор загрузки когда isBidLoading=true', () => {
      mockBidStore.isBidLoading = true;
      renderDefaultRequests();
      expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
    });

    it('не показывает индикатор загрузки когда isBidLoading=false', () => {
      mockBidStore.isBidLoading = false;
      renderDefaultRequests();
      expect(screen.queryByText('Загрузка данных...')).not.toBeInTheDocument();
    });
  });

  describe('Отображение списков заявок', () => {
    it('показывает количество заявок в столбцах', () => {
      mockBidStore.untouchedBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
        makeBid({ id: 2, brand: 'Honda', model: 'Civic', vin: 'VIN2' }),
      ];
      mockBidStore.inProgressBids = [
        makeBid({ id: 3, brand: 'BMW', model: 'X5', vin: 'VIN3' }),
      ];

      renderDefaultRequests();

      const untouchedSection = screen
        .getByText('Необработанные')
        .closest('div') as HTMLElement;
      const inProgressSection = screen
        .getByText('В работе')
        .closest('div') as HTMLElement;

      expect(within(untouchedSection).getByText('2')).toBeInTheDocument();
      expect(within(inProgressSection).getByText('1')).toBeInTheDocument();
    });

    it('отображает необработанные заявки', () => {
      const untouchedBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
        makeBid({ id: 2, brand: 'Honda', model: 'Civic', vin: 'VIN2' }),
      ];
      mockBidStore.untouchedBids = untouchedBids;

      renderDefaultRequests();

      expect(screen.getByTestId('bid-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('bid-item-2')).toBeInTheDocument();
    });

    it('отображает заявки в работе', () => {
      const inProgressBids = [
        makeBid({ id: 3, brand: 'BMW', model: 'X5', vin: 'VIN3' }),
        makeBid({ id: 4, brand: 'Audi', model: 'A4', vin: 'VIN4' }),
      ];
      mockBidStore.inProgressBids = inProgressBids;

      renderDefaultRequests();

      expect(screen.getByTestId('bid-item-3')).toBeInTheDocument();
      expect(screen.getByTestId('bid-item-4')).toBeInTheDocument();
    });

    it('показывает сообщение когда нет необработанных заявок', () => {
      mockBidStore.untouchedBids = [];
      mockBidStore.inProgressBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
      ];

      renderDefaultRequests();

      expect(screen.getByText('Нет необработанных заявок')).toBeInTheDocument();
    });

    it('показывает сообщение когда нет заявок в работе', () => {
      mockBidStore.untouchedBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
      ];
      mockBidStore.inProgressBids = [];

      renderDefaultRequests();

      expect(screen.getByText('Нет заявок в работе')).toBeInTheDocument();
    });

    it('показывает оба сообщения когда нет заявок вообще', () => {
      mockBidStore.untouchedBids = [];
      mockBidStore.inProgressBids = [];

      renderDefaultRequests();

      expect(screen.getByText('Нет необработанных заявок')).toBeInTheDocument();
      expect(screen.getByText('Нет заявок в работе')).toBeInTheDocument();
    });
  });

  describe('Обработка ошибок', () => {
    it('показывает уведомление об ошибке когда bidError не null', async () => {
      mockBidStore.bidError = 'Ошибка загрузки заявок';

      renderDefaultRequests();

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка загрузки заявок',
          'error'
        );
      });
    });

    it('не показывает уведомление когда bidError null', () => {
      mockBidStore.bidError = null;

      renderDefaultRequests();

      expect(mockedShowNotification).not.toHaveBeenCalled();
    });

    it('показывает уведомление при изменении bidError', async () => {
      expect(mockedShowNotification).not.toHaveBeenCalled();

      mockBidStore.bidError = 'Новая ошибка';
      renderDefaultRequests();

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Новая ошибка',
          'error'
        );
      });
    });
  });

  describe('интеграция с BidListItem', () => {
    it('передает правильные данные в BidListItem', () => {
      const bid = makeBid({
        id: 1,
        brand: 'Toyota',
        model: 'Camry',
        vin: 'VIN123456789012345',
        transit_method: 't1',
        client: makeClient({ full_name: 'Иван Иванов' }),
        container_number: 'CONT123456',
        arrival_date: '2024-01-15',
      });
      mockBidStore.untouchedBids = [bid];

      renderDefaultRequests();

      expect(screen.getByTestId('bid-item-1')).toBeInTheDocument();
    });
  });
});
