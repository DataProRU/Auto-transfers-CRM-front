import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

      expect(screen.getByTestId('datePickerInput')).toBeInTheDocument();
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

      renderRecieverBidModal();

      const fullAcceptanceCheckbox = screen.getByLabelText('Полное принятие');
      expect(fullAcceptanceCheckbox).toBeChecked();
    });
  });

  describe('Взаимодействие с формой', () => {
    it('позволяет выбирать дату прибытия', async () => {
      renderRecieverBidModal();

      const dateInput = screen.getByTestId(
        'datePickerInput'
      ) as HTMLInputElement;

      fireEvent.change(dateInput, { target: { value: '20.02.2024' } });

      expect(screen.getByDisplayValue('20.02.2024')).toBeInTheDocument();
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

      expect(screen.getByDisplayValue('20.02.2024')).toBeInTheDocument();

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
      const bid = makeBid({ vehicle_arrival_date: '' });
      mockBidStore.bid = bid;
      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Примерная дата прибытия не может быть пустой')
        ).toBeInTheDocument();
      });
    });

    it('проходит валидацию при корректных данных', async () => {
      mockUpdateExpandedBid.mockResolvedValue(true);
      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
        expect(mockUpdateExpandedBid).toHaveBeenCalled();
      });
    });
  });

  describe('Отправка формы', () => {
    it('вызывает updateExpandedBid при успешной отправке', async () => {
      const bid = makeBid({
        vehicle_arrival_date: '2024-02-20',
        receive_vehicle: false,
        receive_documents: false,
        receiver_keys_number: 2,
      });
      mockBidStore.bid = bid;
      const onClose = jest.fn();
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal({ onClose });

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalledWith(
          1,
          {
            vehicle_arrival_date: '2024-02-20',
            receive_vehicle: false,
            receive_documents: false,
            receiver_keys_number: 2,
          },
          true,
          false
        );
      });
    });

    it('правильно определяет inProgressCondition', async () => {
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Object),
          true,
          expect.any(Boolean)
        );
      });
    });

    it('определяет completedCondition как true при принятии автомобиля и документов', async () => {
      mockUpdateExpandedBid.mockResolvedValue(true);

      renderRecieverBidModal();

      const vehicleCheckbox = screen.getByLabelText('Принял автомобиль');
      await userEvent.click(vehicleCheckbox);

      const documentsCheckbox = screen.getByLabelText('Принял документы');
      await userEvent.click(documentsCheckbox);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Object),
          expect.any(Boolean),
          true
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

  describe('Валидация формы', () => {
    beforeEach(() => {
      mockBidStore.bid = defaultBid;
    });

    it('валидация проходит при корректной дате', async () => {
      renderRecieverBidModal();

      await userEvent.type(screen.getByTestId('datePickerInput'), '15.02.2024');

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateExpandedBid).toHaveBeenCalled();
      });
    });

    it('показывает ошибку при очистке поля даты', async () => {
      renderRecieverBidModal();

      const datePickerInput = screen.getByTestId('datePickerInput');

      await userEvent.type(datePickerInput, '15.02.2024');

      await userEvent.clear(datePickerInput);

      const form = document.querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText('Примерная дата прибытия не может быть пустой')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Обработка ошибок', () => {
    it('показывает уведомление об ошибке при неудачной отправке', async () => {
      mockUpdateExpandedBid.mockResolvedValue(false);
      mockBidStore.bidError = 'Ошибка сервера';

      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

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
      mockUpdateExpandedBid.mockResolvedValue(false);
      mockBidStore.bidError = null;

      renderRecieverBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Не удалось изменить данные',
          'error'
        );
      });
    });
  });

  describe('Закрытие модального окна', () => {
    it('вызывает onClose при клике на кнопку Отмена', async () => {
      const onClose = jest.fn();
      renderRecieverBidModal({ onClose });

      await userEvent.click(screen.getByText('Отмена'));
      expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике вне модального окна', async () => {
      const onClose = jest.fn();
      renderRecieverBidModal({ onClose });

      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        await userEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Условный рендеринг', () => {
    it('не рендерится когда open=false', () => {
      renderRecieverBidModal({ open: false });
      expect(
        screen.queryByTestId('dialogRecieverBidModal')
      ).not.toBeInTheDocument();
    });

    it('рендерится когда open=true', () => {
      renderRecieverBidModal({ open: true });
      expect(screen.getByTestId('dialogRecieverBidModal')).toBeInTheDocument();
    });
  });
});
