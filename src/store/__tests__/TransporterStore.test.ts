import transporterStore from '../TransporterStore';
import TransporterService from '@/services/TransporterService';
import { getAPIErrorMessage } from '@/utils/getAPIErrorMessage';
import type { AxiosResponse } from 'axios';
import type { Transporter } from '@/models/TransporterResponse';

jest.mock('@/services/TransporterService');
jest.mock('@/utils/getAPIErrorMessage');

const getTransportersMock =
  TransporterService.getTransporters as jest.MockedFunction<
    typeof TransporterService.getTransporters
  >;
const getAPIErrorMessageMock = getAPIErrorMessage as jest.MockedFunction<
  typeof getAPIErrorMessage
>;

const makeTransporter = (
  overrides: Partial<Transporter> = {}
): Transporter => ({
  id: 1,
  number: 'AUTO001',
  ...overrides,
});

describe('TransporterStore', () => {
  const resetStore = () => {
    transporterStore.setTransporters([]);
    transporterStore.setIsLoading(false);
    transporterStore.setError(null);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  describe('Сеттеры', () => {
    it('setTransporters устанавливает список транспортеров', () => {
      const transporters = [makeTransporter({ id: 1, number: 'AUTO001' })];
      transporterStore.setTransporters(transporters);
      expect(transporterStore.transporters).toEqual(transporters);
    });

    it('setIsLoading устанавливает состояние загрузки', () => {
      transporterStore.setIsLoading(true);
      expect(transporterStore.isLoading).toBe(true);

      transporterStore.setIsLoading(false);
      expect(transporterStore.isLoading).toBe(false);
    });

    it('setError устанавливает ошибку', () => {
      transporterStore.setError('Ошибка загрузки');
      expect(transporterStore.error).toBe('Ошибка загрузки');

      transporterStore.setError(null);
      expect(transporterStore.error).toBeNull();
    });
  });

  describe('fetchTransporters', () => {
    it('успешно загружает транспортеров', async () => {
      const mockTransporters = [
        makeTransporter({ id: 1, number: 'AUTO001' }),
        makeTransporter({ id: 2, number: 'AUTO002' }),
      ];

      getTransportersMock.mockResolvedValue({
        data: mockTransporters,
      } as AxiosResponse<Transporter[]>);

      await transporterStore.fetchTransporters();

      expect(transporterStore.isLoading).toBe(false);
      expect(transporterStore.transporters).toEqual(mockTransporters);
      expect(transporterStore.error).toBeNull();
      expect(getTransportersMock).toHaveBeenCalledTimes(1);
    });

    it('устанавливает состояние загрузки во время запроса', async () => {
      let resolvePromise: (value: AxiosResponse<Transporter[]>) => void;
      const promise = new Promise<AxiosResponse<Transporter[]>>((resolve) => {
        resolvePromise = resolve;
      });

      getTransportersMock.mockReturnValue(promise);

      const fetchPromise = transporterStore.fetchTransporters();

      expect(transporterStore.isLoading).toBe(true);

      resolvePromise!({
        data: [makeTransporter()],
      } as AxiosResponse<Transporter[]>);

      await fetchPromise;

      expect(transporterStore.isLoading).toBe(false);
    });

    it('обрабатывает ошибку при загрузке транспортеров', async () => {
      const errorMessage = 'Ошибка сервера';
      getTransportersMock.mockRejectedValue(new Error('Network Error'));
      getAPIErrorMessageMock.mockReturnValue(errorMessage);

      await transporterStore.fetchTransporters();

      expect(transporterStore.isLoading).toBe(false);
      expect(transporterStore.transporters).toEqual([]);
      expect(transporterStore.error).toBe(errorMessage);
      expect(getAPIErrorMessageMock).toHaveBeenCalledWith(expect.any(Error));
    });

    it('сбрасывает ошибку перед новым запросом', async () => {
      transporterStore.setError('Предыдущая ошибка');
      expect(transporterStore.error).toBe('Предыдущая ошибка');

      const mockTransporters = [makeTransporter()];
      getTransportersMock.mockResolvedValue({
        data: mockTransporters,
      } as AxiosResponse<Transporter[]>);

      await transporterStore.fetchTransporters();

      expect(transporterStore.error).toBeNull();
    });

    it('очищает список транспортеров при ошибке', async () => {
      const initialTransporters = [makeTransporter()];
      transporterStore.setTransporters(initialTransporters);
      expect(transporterStore.transporters).toEqual(initialTransporters);

      getTransportersMock.mockRejectedValue(new Error('Network Error'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка сети');

      await transporterStore.fetchTransporters();

      expect(transporterStore.transporters).toEqual([]);
    });

    it('всегда устанавливает isLoading в false в блоке finally', async () => {
      getTransportersMock.mockResolvedValue({
        data: [makeTransporter()],
      } as AxiosResponse<Transporter[]>);

      await transporterStore.fetchTransporters();
      expect(transporterStore.isLoading).toBe(false);

      getTransportersMock.mockRejectedValue(new Error('Network Error'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка сети');

      await transporterStore.fetchTransporters();
      expect(transporterStore.isLoading).toBe(false);
    });
  });

  describe('Инициализация', () => {
    it('инициализируется с пустыми значениями', () => {
      expect(transporterStore.transporters).toEqual([]);
      expect(transporterStore.isLoading).toBe(false);
      expect(transporterStore.error).toBeNull();
    });
  });
});
