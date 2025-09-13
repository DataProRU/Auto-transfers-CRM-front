import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecieverBidModal from '../RecieverBidModal';
import { makeBid, makeClient } from '@/utils/test/factories';
import bidStore from '@/store/BidStore';
import userEvent from '@testing-library/user-event';
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
  updateExpandedBid: jest.fn(),
  bidError: null,
  setBidError: jest.fn(),
}));

const mockBidStore = bidStore as jest.Mocked<typeof bidStore>;
const mockUpdateExpandedBid =
  mockBidStore.updateExpandedBid as jest.MockedFunction<
    typeof mockBidStore.updateExpandedBid
  >;
const mockSetBidError = mockBidStore.setBidError as jest.MockedFunction<
  typeof mockBidStore.setBidError
>;

const defaultBid = makeBid({
  id: 1,
  brand: 'Toyota',
  model: 'Camry',
  vin: '1HGBH41JXMN109186',
  client: makeClient({ full_name: 'Иван Иванов' }),
  vehicle_arrival_date: '2024-02-20',
  receive_vehicle: false,
  receive_documents: false,
  receiver_keys_number: 0,
  logistician_keys_number: 2,
  vehicle_transporter: makeTransporter({ id: 1, number: 'AUTO001' }),
});

const renderRecieverBidModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(<RecieverBidModal {...defaultProps} />);
};

function getCheckboxes() {
  return {
    acceptedCarCheckbox: screen.getByLabelText(
      'Принял автомобиль'
    ) as HTMLInputElement,
    acceptedDocumentsCheckbox: screen.getByLabelText(
      'Принял документы'
    ) as HTMLInputElement,
    fullAcceptedCheckbox: screen.getByLabelText(
      'Полное принятие'
    ) as HTMLInputElement,
  };
}

describe('RecieverBidModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBidStore.bid = defaultBid;
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('отображает модальное окно с заголовком', () => {
      renderRecieverBidModal();

      expect(
        screen.getByText('Заявка на Toyota Camry 1HGBH41JXMN109186')
      ).toBeInTheDocument();
    });

    it('отображает описание модального окна', () => {
      renderRecieverBidModal();

      expect(
        screen.getByText(
          'Для изменения данных заявки заполните активные поля ниже'
        )
      ).toBeInTheDocument();
    });

    it('отображает кнопки Отмена и Сохранить', () => {
      renderRecieverBidModal();

      expect(
        screen.getByRole('button', { name: 'Отмена' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Сохранить' })
      ).toBeInTheDocument();
    });

    it('отображает поля формы', () => {
      renderRecieverBidModal();

      const {
        acceptedCarCheckbox,
        acceptedDocumentsCheckbox,
        fullAcceptedCheckbox,
      } = getCheckboxes();

      expect(
        screen.getByLabelText('Примерная дата прибытия')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Принял ключей')).toBeInTheDocument();
      expect(acceptedCarCheckbox).toBeInTheDocument();
      expect(acceptedDocumentsCheckbox).toBeInTheDocument();
      expect(fullAcceptedCheckbox).toBeInTheDocument();
    });
  });

  describe('Информация о заявке', () => {
    it('отображает аккордеон с информацией о заявке', () => {
      renderRecieverBidModal();

      const accordion = screen.getByText('Информация о заявке');
      expect(accordion).toBeInTheDocument();
    });

    it('отображает все поля информации о заявке в аккордеоне', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      await user.click(accordionButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Camry')).toBeInTheDocument();
        expect(
          screen.getByDisplayValue('1HGBH41JXMN109186')
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('AUTO001')).toBeInTheDocument();
      });
    });

    it('отображает чекбокс полного принятия как отключенный', () => {
      renderRecieverBidModal();

      const fullAcceptanceCheckbox = screen.getByLabelText('Полное принятие');
      expect(fullAcceptanceCheckbox).toBeDisabled();
    });

    it('отображает чекбокс полного принятия как отмеченный когда оба условия выполнены', () => {
      const bidWithFullAcceptance = makeBid({
        ...defaultBid,
        receive_vehicle: true,
        receive_documents: true,
      });
      mockBidStore.bid = bidWithFullAcceptance;

      const { fullAcceptedCheckbox } = getCheckboxes();

      renderRecieverBidModal();

      expect(fullAcceptedCheckbox.checked).toBe(true);
    });
  });

  describe('Взаимодействие с формой', () => {
    it('позволяет выбирать дату прибытия', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const dateInput = screen.getByLabelText('Примерная дата прибытия');
      await user.clear(dateInput);
      await user.type(dateInput, '25.02.2024');

      expect(dateInput).toHaveValue('25.02.2024');
    });

    it('позволяет выбирать количество принятых ключей', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const keysSelect = screen.getByLabelText('Принял ключей');
      await user.click(keysSelect);

      const option = screen.getByRole('option', { name: '3' });
      await user.click(option);

      expect(keysSelect).toHaveTextContent('3');
    });

    it('позволяет отмечать чекбокс принятия автомобиля', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const vehicleCheckbox = screen.getByLabelText('Принял автомобиль');
      await user.click(vehicleCheckbox);

      expect(vehicleCheckbox).toBeChecked();
    });

    it('позволяет отмечать чекбокс принятия документов', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const documentsCheckbox = screen.getByLabelText('Принял документы');
      await user.click(documentsCheckbox);

      expect(documentsCheckbox).toBeChecked();
    });

    it('инициализирует форму с данными из bid', () => {
      renderRecieverBidModal();

      const dateInput = screen.getByLabelText('Примерная дата прибытия');
      expect(dateInput).toHaveValue('20.02.2024');

      const keysSelect = screen.getByLabelText('Принял ключей');
      expect(keysSelect).toHaveTextContent('2'); // logistician_keys_number

      const vehicleCheckbox = screen.getByLabelText('Принял автомобиль');
      expect(vehicleCheckbox).not.toBeChecked();

      const documentsCheckbox = screen.getByLabelText('Принял документы');
      expect(documentsCheckbox).not.toBeChecked();
    });
  });

  describe('Валидация', () => {
    it('требует указания даты прибытия', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const dateInput = screen.getByLabelText('Примерная дата прибытия');
      await user.clear(dateInput);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Примерная дата прибытия не может быть пустой')
        ).toBeInTheDocument();
      });
    });

    it('требует корректный формат даты', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const dateInput = screen.getByLabelText('Примерная дата прибытия');
      await user.clear(dateInput);
      await user.type(dateInput, '2024-02-20');

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Дата должна быть в формате ДД.ММ.ГГГГ')
        ).toBeInTheDocument();
      });
    });

    it('требует корректную дату', async () => {
      const user = userEvent.setup();
      renderRecieverBidModal();

      const dateInput = screen.getByLabelText('Примерная дата прибытия');
      await user.clear(dateInput);
      await user.type(dateInput, '32.13.2024');

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Некорректная дата')).toBeInTheDocument();
      });
    });

    it('проходит валидацию при корректных данных', async () => {
      const user = userEvent.setup();
      mockUpdateExpandedBid.mockResolvedValue(true);
      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalled();
      });
    });
  });

  describe('Отправка формы', () => {
    it('вызывает updateExpandedBid при успешной отправке', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal({ onClose });

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalledWith(
          1,
          {
            vehicle_arrival_date: '2024-02-20',
            receive_vehicle: false,
            receive_documents: false,
            receiver_keys_number: 2,
          },
          true, // inProgressCondition = true когда есть дата
          false // completedCondition = false когда не все условия выполнены
        );
      });
    });

    it('правильно определяет inProgressCondition', async () => {
      const user = userEvent.setup();
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Object),
          true, // inProgressCondition = true когда есть дата прибытия
          expect.any(Boolean)
        );
      });
    });

    it('определяет inProgressCondition как false при отсутствии даты', async () => {
      const user = userEvent.setup();
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal();

      // Убираем дату
      const dateInput = screen.getByLabelText('Примерная дата прибытия');
      await user.clear(dateInput);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Object),
          false, // inProgressCondition = false когда нет даты
          expect.any(Boolean)
        );
      });
    });

    it('определяет completedCondition как true при принятии автомобиля и документов', async () => {
      const user = userEvent.setup();
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal();

      // Отмечаем оба чекбокса
      const vehicleCheckbox = screen.getByLabelText('Принял автомобиль');
      await user.click(vehicleCheckbox);

      const documentsCheckbox = screen.getByLabelText('Принял документы');
      await user.click(documentsCheckbox);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Object),
          expect.any(Boolean),
          true // completedCondition = true когда приняты и автомобиль, и документы
        );
      });
    });

    it('показывает уведомление об успехе и закрывает модальное окно', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal({ onClose });

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
      });
    });

    it('не отправляет форму если bid равен null', async () => {
      const user = userEvent.setup();
      mockBidStore.bid = null;

      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).not.toHaveBeenCalled();
      });
    });
  });

  describe('Обработка ошибок', () => {
    it('показывает уведомление об ошибке при неудачной отправке', async () => {
      const user = userEvent.setup();
      mockUpdateExpandedBid.mockResolvedValue(false);
      mockBidStore.bidError = 'Ошибка сервера';

      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка сервера',
          'error'
        );
      });
    });

    it('показывает уведомление об ошибке из bidError', async () => {
      mockBidStore.bidError = 'Ошибка валидации';

      renderRecieverBidModal();

      await waitFor(() => {
        expect(mockSetBidError).toHaveBeenCalledWith(null);
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка валидации',
          'error'
        );
      });
    });

    it('показывает дефолтное сообщение об ошибке', async () => {
      const user = userEvent.setup();
      mockUpdateExpandedBid.mockResolvedValue(false);
      mockBidStore.bidError = null;

      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Не удалось изменить данные',
          'error'
        );
      });
    });
  });
});
