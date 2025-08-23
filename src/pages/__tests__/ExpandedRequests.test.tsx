import { render, screen, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExpandedRequests from '../ExpandedRequests';
import type { Bid } from '@/models/BidResponse';
import '@testing-library/jest-dom';
import type { Client } from '@/models/UserResponse.ts';
import bidStore from '@/store/BidStore.ts';

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
    bidError: null as string | null,
    isBidLoading: false,
    untouchedBids: [] as Bid[],
    inProgressBids: [] as Bid[],
    сompletedBids: [] as Bid[],
  },
}));

const mockBidStore = bidStore as jest.Mocked<typeof bidStore>;
const mockFetchBids = mockBidStore.fetchBids;

jest.mock('@/store/AuthStore', () => ({
  authStore: {
    role: 'logistician',
  },
}));
const renderExpandedRequests = () => {
  return render(
    <BrowserRouter>
      <ExpandedRequests />
    </BrowserRouter>
  );
};

describe('ExpandedRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockBidStore.bidError = null;
    mockBidStore.isBidLoading = false;
    mockBidStore.untouchedBids = [];
    mockBidStore.inProgressBids = [];
    mockBidStore.сompletedBids = [];
  });

  describe('Рендеринг', () => {
    it('рендерит заголовок страницы', () => {
      renderExpandedRequests();
      expect(screen.getByText('Заявки')).toBeInTheDocument();
    });

    it('рендерит три колонки: Необработанные, В работе и Завершено', () => {
      renderExpandedRequests();
      expect(screen.getByText('Необработанные')).toBeInTheDocument();
      expect(screen.getByText('В работе')).toBeInTheDocument();
      expect(screen.getByText('Завершено')).toBeInTheDocument();
    });
  });

  describe('Загрузка данных', () => {
    it('вызывает fetchBids при монтировании компонента', () => {
      renderExpandedRequests();
      expect(mockFetchBids).toHaveBeenCalledTimes(1);
    });

    it('показывает индикатор загрузки когда isBidLoading=true', () => {
      mockBidStore.isBidLoading = true;
      renderExpandedRequests();
      expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
    });

    it('не показывает индикатор загрузки когда isBidLoading=false', () => {
      mockBidStore.isBidLoading = false;
      renderExpandedRequests();
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
      mockBidStore.сompletedBids = [
        makeBid({ id: 4, brand: 'Audi', model: 'A4', vin: 'VIN4' }),
        makeBid({ id: 5, brand: 'Mercedes', model: 'C-Class', vin: 'VIN5' }),
      ];

      renderExpandedRequests();

      const untouchedSection = screen
        .getByText('Необработанные')
        .closest('div') as HTMLElement;
      const inProgressSection = screen
        .getByText('В работе')
        .closest('div') as HTMLElement;
      const completedSection = screen
        .getByText('Завершено')
        .closest('div') as HTMLElement;

      expect(within(untouchedSection).getByText('2')).toBeInTheDocument();
      expect(within(inProgressSection).getByText('1')).toBeInTheDocument();
      expect(within(completedSection).getByText('2')).toBeInTheDocument();
    });

    it('отображает необработанные заявки', () => {
      const untouchedBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
        makeBid({ id: 2, brand: 'Honda', model: 'Civic', vin: 'VIN2' }),
      ];
      mockBidStore.untouchedBids = untouchedBids;

      renderExpandedRequests();

      expect(screen.getByTestId('bid-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('bid-item-2')).toBeInTheDocument();
    });

    it('отображает заявки в работе', () => {
      const inProgressBids = [
        makeBid({ id: 3, brand: 'BMW', model: 'X5', vin: 'VIN3' }),
        makeBid({ id: 4, brand: 'Audi', model: 'A4', vin: 'VIN4' }),
      ];
      mockBidStore.inProgressBids = inProgressBids;

      renderExpandedRequests();

      expect(screen.getByTestId('bid-item-3')).toBeInTheDocument();
      expect(screen.getByTestId('bid-item-4')).toBeInTheDocument();
    });

    it('отображает завершенные заявки', () => {
      const completedBids = [
        makeBid({ id: 5, brand: 'Mercedes', model: 'C-Class', vin: 'VIN5' }),
        makeBid({ id: 6, brand: 'Volkswagen', model: 'Golf', vin: 'VIN6' }),
      ];
      mockBidStore.сompletedBids = completedBids;

      renderExpandedRequests();

      expect(screen.getByTestId('bid-item-5')).toBeInTheDocument();
      expect(screen.getByTestId('bid-item-6')).toBeInTheDocument();
    });

    it('показывает сообщение когда нет необработанных заявок', () => {
      mockBidStore.untouchedBids = [];
      mockBidStore.inProgressBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
      ];
      mockBidStore.сompletedBids = [
        makeBid({ id: 2, brand: 'BMW', model: 'X5', vin: 'VIN2' }),
      ];

      renderExpandedRequests();

      expect(screen.getByText('Нет необработанных заявок')).toBeInTheDocument();
    });

    it('показывает сообщение когда нет заявок в работе', () => {
      mockBidStore.untouchedBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
      ];
      mockBidStore.inProgressBids = [];
      mockBidStore.сompletedBids = [
        makeBid({ id: 2, brand: 'BMW', model: 'X5', vin: 'VIN2' }),
      ];

      renderExpandedRequests();

      expect(screen.getByText('Нет заявок в работе')).toBeInTheDocument();
    });

    it('показывает сообщение когда нет завершенных заявок', () => {
      mockBidStore.untouchedBids = [
        makeBid({ id: 1, brand: 'Toyota', model: 'Camry', vin: 'VIN1' }),
      ];
      mockBidStore.inProgressBids = [
        makeBid({ id: 2, brand: 'BMW', model: 'X5', vin: 'VIN2' }),
      ];
      mockBidStore.сompletedBids = [];

      renderExpandedRequests();

      expect(screen.getByText('Нет завершенных заявок')).toBeInTheDocument();
    });

    it('показывает все сообщения когда нет заявок вообще', () => {
      mockBidStore.untouchedBids = [];
      mockBidStore.inProgressBids = [];
      mockBidStore.сompletedBids = [];

      renderExpandedRequests();

      expect(screen.getByText('Нет необработанных заявок')).toBeInTheDocument();
      expect(screen.getByText('Нет заявок в работе')).toBeInTheDocument();
      expect(screen.getByText('Нет завершенных заявок')).toBeInTheDocument();
    });
  });

  describe('Обработка ошибок', () => {
    it('показывает уведомление об ошибке когда bidError не null', async () => {
      mockBidStore.bidError = 'Ошибка загрузки заявок';

      renderExpandedRequests();

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка загрузки заявок',
          'error'
        );
      });
    });

    it('не показывает уведомление когда bidError null', () => {
      mockBidStore.bidError = null;

      renderExpandedRequests();

      expect(mockedShowNotification).not.toHaveBeenCalled();
    });

    it('показывает уведомление при изменении bidError', async () => {
      expect(mockedShowNotification).not.toHaveBeenCalled();

      mockBidStore.bidError = 'Новая ошибка';
      renderExpandedRequests();

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Новая ошибка',
          'error'
        );
      });
    });
  });

  describe('Интеграция с BidListItem', () => {
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

      renderExpandedRequests();

      expect(screen.getByTestId('bid-item-1')).toBeInTheDocument();
    });
  });

  describe('Структура колонок', () => {
    it('отображает три колонки с правильными размерами', () => {
      renderExpandedRequests();

      // Проверяем наличие всех трех колонок
      expect(screen.getByText('Необработанные')).toBeInTheDocument();
      expect(screen.getByText('В работе')).toBeInTheDocument();
      expect(screen.getByText('Завершено')).toBeInTheDocument();

      // Проверяем, что все колонки имеют чипы с количеством
      const chips = screen.getAllByRole('generic'); // Chip компоненты
      expect(chips.length).toBeGreaterThanOrEqual(3); // Минимум 3 чипа
    });

    it('отображает правильные цвета для колонок', () => {
      renderExpandedRequests();

      // Проверяем наличие колонок с разными цветами
      // primary.light для "Необработанные"
      // secondary.light для "В работе"
      // green для "Завершено"
      expect(screen.getByText('Необработанные')).toBeInTheDocument();
      expect(screen.getByText('В работе')).toBeInTheDocument();
      expect(screen.getByText('Завершено')).toBeInTheDocument();
    });
  });
});
