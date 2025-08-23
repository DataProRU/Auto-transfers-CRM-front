import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DefaultRequests from '../DefaultRequests';
import type { Bid } from '@/models/BidResponse';
import '@testing-library/jest-dom';
import type { Client } from '@/models/UserResponse.ts';
import bidStore from '@/store/BidStore';

const mockedShowNotification = jest.fn();
jest.mock('@/providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
}));

const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 1,
  full_name: 'Test Client',
  phone: '+10000000000',
  telegram: '@test',
  company: null,
  address: null,
  email: 'test@example.com',
  ...overrides,
});
const makeBid = (overrides: Partial<Bid> = {}): Bid => ({
  id: 1,
  client: makeClient(),
  brand: 'Toyota',
  model: 'Camry',
  vin: 'VIN123456789012345',
  price: 25000,
  container_number: 'CONT123456',
  arrival_date: '2024-01-15',
  transporter: 'Test Transporter',
  recipient: 'Test Recipient',
  transit_method: null,
  location: null,
  requested_title: false,
  notified_parking: false,
  notified_inspector: false,
  openning_date: null,
  approved_by_inspector: false,
  approved_by_title: false,
  approved_by_re_export: false,
  opened: false,
  manager_comment: null,
  pickup_address: null,
  title_collection_date: null,
  took_title: null,
  notified_logistician_by_title: false,
  notified_logistician_by_inspector: false,
  acceptance_date: null,
  transit_number: null,
  inspection_done: null,
  inspection_date: null,
  number_sent: false,
  number_sent_date: null,
  inspection_paid: false,
  inspector_comment: null,
  export: false,
  prepared_documents: false,
  ...overrides,
});

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

  describe('отображение списков заявок', () => {
    it('показывает количество заявок в столбцах', () => {
      mockBidStore.untouchedBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
        makeBid({ id: 2, brand: 'Honda', model: 'Civic', vin: 'VIN2' }),
      ];
      mockBidStore.inProgressBids = [
        makeBid({ id: 3, brand: 'BMW', model: 'X5', vin: 'VIN3' }),
      ];

      renderDefaultRequests();

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
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
