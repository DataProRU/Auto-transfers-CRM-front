import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogistLoadingBidModal from '../Logist/LogistLoadingBidModal';
import { makeBid, makeClient } from '@/utils/test/factories';
import bidStore from '@/store/BidStore';
import transporterStore from '@/store/TransporterStore';
import type { Transporter } from '@/models/TransporterResponse';

const makeTransporter = (
  overrides: Partial<Transporter> = {}
): Transporter => ({
  id: 1,
  number: 'AUTO001',
  ...overrides,
});

const mockedShowNotification = jest.fn();
jest.mock('@/providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
}));

jest.mock('@/store/BidStore', () => ({
  bid: null,
  updateBid: jest.fn(),
  bidError: null,
  setBidError: jest.fn(),
}));

const mockBidStore = bidStore as jest.Mocked<typeof bidStore>;
const mockUpdateBid = mockBidStore.updateBid as jest.MockedFunction<
  typeof mockBidStore.updateBid
>;
const mockSetBidError = mockBidStore.setBidError as jest.MockedFunction<
  typeof mockBidStore.setBidError
>;

jest.mock('@/store/TransporterStore', () => ({
  transporters: [],
  fetchTransporters: jest.fn(),
  isLoading: false,
}));

const mockTransporterStore = transporterStore as jest.Mocked<
  typeof transporterStore
>;

jest.mock('../../../UI/Combobox', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ onChange, label, value, error, helperText }: any) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <select
        id={label}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid='combobox'
      >
        <option value=''>Выберите автовоз</option>
        <option value='1'>Автовоз 1</option>
        <option value='2'>Автовоз 2</option>
      </select>
      {error && <div data-testid='error'>{helperText}</div>}
    </div>
  ),
}));

const defaultBid = makeBid({
  id: 1,
  brand: 'Toyota',
  model: 'Camry',
  vin: '1HGBH41JXMN109186',
  client: makeClient({ full_name: 'Иван Иванов' }),
  container_number: 'CONT123',
  arrival_date: '2024-02-20',
  openning_date: '2024-02-21',
  recipient: 'Получатель',
  transporter: 'Перевозчик',
  transit_method: 'without_openning',
  acceptance_type: 'without_re_export',
  location: 'Склад',
  approved_by_inspector: true,
  approved_by_title: false,
  approved_by_re_export: true,
  requested_title: false,
  notified_parking: true,
  notified_inspector: false,
  v_type: { id: 2, v_type: 'Легковой' },
  vehicle_transporter: makeTransporter({ id: 1, number: 'AUTO001' }),
  logistician_keys_number: 2,
});

const defaultTransporters = [
  makeTransporter({ id: 1, number: 'AUTO001' }),
  makeTransporter({ id: 2, number: 'AUTO002' }),
];

const renderLogistLoadingBidModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(<LogistLoadingBidModal {...defaultProps} />);
};

describe('LogistLoadingBidModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBidStore.bid = defaultBid;
    mockTransporterStore.transporters = defaultTransporters;
    mockTransporterStore.isLoading = false;
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('отображает модальное окно с заголовком', () => {
      renderLogistLoadingBidModal();

      expect(
        screen.getByText('Заявка на Toyota Camry 1HGBH41JXMN109186')
      ).toBeInTheDocument();
    });

    it('отображает описание модального окна', () => {
      renderLogistLoadingBidModal();

      expect(
        screen.getByText(
          'Для изменения данных заявки заполните активные поля ниже'
        )
      ).toBeInTheDocument();
    });

    it('отображает кнопки Отмена и Сохранить', () => {
      renderLogistLoadingBidModal();

      expect(
        screen.getByRole('button', { name: 'Отмена' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Сохранить' })
      ).toBeInTheDocument();
    });

    it('отображает поля формы: автовоз и количество ключей', () => {
      renderLogistLoadingBidModal();

      expect(screen.getByLabelText('Автовоз')).toBeInTheDocument();
      expect(screen.getByLabelText('Отправлено ключей')).toBeInTheDocument();
    });
  });

  describe('Информация о заявке', () => {
    it('отображает аккордеон с информацией о заявке', () => {
      renderLogistLoadingBidModal();

      const accordion = screen.getByText('Информация о заявке');
      expect(accordion).toBeInTheDocument();
    });

    it('отображает все поля информации о заявке в аккордеоне', async () => {
      const user = userEvent.setup();
      renderLogistLoadingBidModal();

      // Открываем аккордеон
      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      await user.click(accordionButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Camry')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Иван Иванов')).toBeInTheDocument();
        expect(
          screen.getByDisplayValue('1HGBH41JXMN109186')
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('CONT123')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Получатель')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Перевозчик')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Без открытия')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Без реэспорта')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Склад')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Легковой')).toBeInTheDocument();
      });
    });

    it('отображает даты в правильном формате', async () => {
      const user = userEvent.setup();
      renderLogistLoadingBidModal();

      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      await user.click(accordionButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('20.02.2024')).toBeInTheDocument();
        expect(screen.getByDisplayValue('21.02.2024')).toBeInTheDocument();
      });
    });

    it('отображает чекбоксы с правильными состояниями', async () => {
      const user = userEvent.setup();
      renderLogistLoadingBidModal();

      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      await user.click(accordionButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Осмотр')).toBeChecked();
        expect(screen.getByLabelText('Тайтл')).not.toBeChecked();
        expect(screen.getByLabelText('Экспорт')).toBeChecked();
        expect(screen.getByLabelText('Запросил тайтл')).not.toBeChecked();
        expect(
          screen.getByLabelText('Уведомил стоянку (без открытия)')
        ).toBeChecked();
        expect(
          screen.getByLabelText('Уведомил осмотр (Без открытия)')
        ).not.toBeChecked();
      });
    });

    it('условно отображает поле типа принятия для without_openning', async () => {
      const user = userEvent.setup();
      renderLogistLoadingBidModal();

      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      await user.click(accordionButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Без реэспорта')).toBeInTheDocument();
      });
    });

    it('не отображает поле типа принятия для других методов транзита', async () => {
      const user = userEvent.setup();
      const bidWithoutAcceptance = makeBid({
        ...defaultBid,
        transit_method: 're_export',
        acceptance_type: null,
      });
      mockBidStore.bid = bidWithoutAcceptance;

      renderLogistLoadingBidModal();

      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      await user.click(accordionButton);

      await waitFor(() => {
        expect(
          screen.queryByDisplayValue('Без реэспорта')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Взаимодействие с формой', () => {
    it('позволяет выбирать автовоз', async () => {
      renderLogistLoadingBidModal();

      const combobox = screen.getByTestId('combobox');
      await userEvent.selectOptions(combobox, '2');

      expect(combobox).toHaveValue('2');
    });

    it('позволяет выбирать количество ключей', async () => {
      renderLogistLoadingBidModal();

      const keysSelect = screen.getByLabelText('Отправлено ключей');
      await userEvent.click(keysSelect);

      const option = screen.getByRole('option', { name: '3' });
      await userEvent.click(option);

      expect(keysSelect).toHaveTextContent('3');
    });

    it('инициализирует форму с данными из bid', () => {
      renderLogistLoadingBidModal();

      const combobox = screen.getByTestId('combobox');
      expect(combobox).toHaveValue('1');

      const keysSelect = screen.getByLabelText('Отправлено ключей');
      expect(keysSelect).toHaveTextContent('2');
    });
  });

  describe('Валидация', () => {
    it('требует выбора автовоза', async () => {
      const bid = makeBid({
        vehicle_transporter: 0,
      });
      mockBidStore.bid = bid;

      renderLogistLoadingBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Автовоз не может быть пустым')
        ).toBeInTheDocument();
      });
    });

    it('требует количество ключей не менее 1', async () => {
      renderLogistLoadingBidModal();

      const keysSelect = screen.getByLabelText('Отправлено ключей');
      await userEvent.click(keysSelect);

      const option = screen.getByRole('option', { name: '0' });
      await userEvent.click(option);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Количество ключей должно быть не менее 1')
        ).toBeInTheDocument();
      });
    });

    it('проходит валидацию при корректных данных', async () => {
      mockUpdateBid.mockResolvedValue(true);
      renderLogistLoadingBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateBid).toHaveBeenCalled();
      });
    });
  });

  describe('Отправка формы', () => {
    it('вызывает updateBid при успешной отправке', async () => {
      const onClose = jest.fn();
      mockUpdateBid.mockResolvedValue(true);

      renderLogistLoadingBidModal({ onClose });

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateBid).toHaveBeenCalledWith(
          1,
          {
            vehicle_transporter: 1,
            logistician_keys_number: 2,
          },
          true,
          'loading'
        );
      });
    });

    it('правильно определяет inProgressCondition', async () => {
      mockUpdateBid.mockResolvedValue(true);

      renderLogistLoadingBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateBid).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Object),
          true,
          'loading'
        );
      });
    });

    it('определяет inProgressCondition как false при отсутствии автовоза', async () => {
      mockUpdateBid.mockResolvedValue(true);

      renderLogistLoadingBidModal();

      const combobox = screen.getByTestId('combobox');
      await userEvent.selectOptions(combobox, '');

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateBid).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Object),
          false,
          'loading'
        );
      });
    });

    it('показывает уведомление об успехе и закрывает модальное окно', async () => {
      const onClose = jest.fn();
      mockUpdateBid.mockResolvedValue(true);

      renderLogistLoadingBidModal({ onClose });

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('не отправляет форму если bid равен null', async () => {
      mockBidStore.bid = null;

      renderLogistLoadingBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateBid).not.toHaveBeenCalled();
      });
    });
  });

  describe('Обработка ошибок', () => {
    it('показывает уведомление об ошибке при неудачной отправке', async () => {
      mockUpdateBid.mockResolvedValue(false);
      mockBidStore.bidError = 'Ошибка сервера';

      renderLogistLoadingBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetBidError).toHaveBeenCalledWith(null);
      });
    });

    it('показывает уведомление об ошибке из bidError', async () => {
      mockBidStore.bidError = 'Ошибка валидации';

      renderLogistLoadingBidModal();

      await waitFor(() => {
        expect(mockSetBidError).toHaveBeenCalledWith(null);
      });
    });

    it('показывает дефолтное сообщение об ошибке', async () => {
      mockUpdateBid.mockResolvedValue(false);
      mockBidStore.bidError = null;

      renderLogistLoadingBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Не удалось изменить данные',
          'error'
        );
        expect(mockUpdateBid).toHaveBeenCalled();
      });
    });
  });

  describe('Закрытие модального окна', () => {
    it('вызывает onClose при клике на кнопку Отмена', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      renderLogistLoadingBidModal({ onClose });

      const cancelButton = screen.getByRole('button', { name: 'Отмена' });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике вне модального окна', async () => {
      const onClose = jest.fn();

      renderLogistLoadingBidModal({ onClose });

      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        await userEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Условный рендеринг', () => {
    it('не отображает модальное окно когда open = false', () => {
      renderLogistLoadingBidModal({ open: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('отображает модальное окно когда open = true', () => {
      renderLogistLoadingBidModal({ open: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('отображает loading состояние для Combobox', () => {
      mockTransporterStore.isLoading = true;

      renderLogistLoadingBidModal();

      const combobox = screen.getByTestId('combobox');
      expect(combobox).toBeInTheDocument();
    });
  });
});
