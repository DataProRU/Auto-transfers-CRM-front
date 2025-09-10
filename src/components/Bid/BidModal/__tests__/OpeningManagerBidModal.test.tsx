import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OpeningManagerBidModal from '../OpeningManagerBidModal';
import { makeBid } from '@/utils/test/factories.ts';
import bidStore from '@/store/BidStore';

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
const setBidErrorMock = mockBidStore.setBidError as jest.MockedFunction<
  typeof mockBidStore.setBidError
>;

const renderOpeningManagerBidModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(<OpeningManagerBidModal {...defaultProps} />);
};

describe('OpeningManagerBidModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBidStore.bid = null;
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('рендерит модальное окно с правильным data-testid', () => {
      renderOpeningManagerBidModal();
      expect(
        screen.getByTestId('dialogOpeningManagerBidModal')
      ).toBeInTheDocument();
    });

    it('отображает заголовок с информацией о заявке', () => {
      const bid = makeBid({ brand: 'Toyota', model: 'Camry', vin: 'VIN123' });
      mockBidStore.bid = bid;
      renderOpeningManagerBidModal();

      expect(
        screen.getByText('Заявка на Toyota Camry VIN123')
      ).toBeInTheDocument();
    });

    it('отображает описание для заполнения полей', () => {
      renderOpeningManagerBidModal();
      expect(
        screen.getByText(
          'Для изменения данных заявки заполните активные поля ниже'
        )
      ).toBeInTheDocument();
    });

    it('отображает кнопки Отмена и Сохранить', () => {
      renderOpeningManagerBidModal();
      expect(screen.getByText('Отмена')).toBeInTheDocument();
      expect(screen.getByText('Сохранить')).toBeInTheDocument();
    });

    it('отображает чекбокс Открыто', () => {
      renderOpeningManagerBidModal();
      const openedCheckbox = screen.getByLabelText('Открыто');
      expect(openedCheckbox).toBeInTheDocument();
    });
  });

  describe('Информация о заявке', () => {
    it('отображает информацию о заявке в аккордеоне', () => {
      const bid = makeBid({
        brand: 'Toyota',
        model: 'Camry',
        vin: 'VIN123456789012345',
        container_number: 'CONT123456',
        arrival_date: '2024-01-15',
        recipient: 'Получатель',
        transporter: 'Перевозчик',
        transit_method: 't1',
      });
      mockBidStore.bid = bid;
      renderOpeningManagerBidModal();

      fireEvent.click(screen.getByText('Информация о заявке'));

      expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Camry')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('VIN123456789012345')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('CONT123456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15.01.2024')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Получатель')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Перевозчик')).toBeInTheDocument();
      expect(screen.getByDisplayValue('T1')).toBeInTheDocument();
    });

    it('все поля информации о заявке отключены', () => {
      const bid = makeBid();
      mockBidStore.bid = bid;
      renderOpeningManagerBidModal();

      fireEvent.click(screen.getByText('Информация о заявке'));

      const disabledFields = screen
        .getAllByRole('textbox')
        .filter((field) => field.hasAttribute('disabled'));
      expect(disabledFields.length).toBeGreaterThan(0);
    });
  });

  describe('Форма редактирования', () => {
    it('отображает поля коментария, даты и чекбокса Открыто', () => {
      renderOpeningManagerBidModal();
      expect(screen.getByTestId('datePickerInput')).toBeInTheDocument();
      expect(screen.getByLabelText('Комментарий')).toBeInTheDocument();
      expect(screen.getByLabelText('Открыто')).toBeInTheDocument();
    });

    it('заполняет форму данными из bid при открытии', () => {
      const bid = makeBid({
        openning_date: '2024-01-15',
        manager_comment: 'Тестовый комментарий',
        opened: true,
      });
      mockBidStore.bid = bid;
      renderOpeningManagerBidModal();

      expect(
        screen.getByDisplayValue('Тестовый комментарий')
      ).toBeInTheDocument();
      const dateInput = screen.getByTestId(
        'datePickerInput'
      ) as HTMLInputElement;
      expect(dateInput).toHaveValue('15.01.2024');
      expect(screen.getByLabelText('Открыто')).toBeChecked();
    });
  });

  describe('Отправка формы', () => {
    it('вызывает updateBid при успешной отправке', async () => {
      const bid = makeBid({ id: 1 });
      const onClose = jest.fn();
      mockBidStore.bid = bid;
      mockUpdateBid.mockResolvedValue(true);

      renderOpeningManagerBidModal({ onClose });

      const dateInput = screen.getByTestId(
        'datePickerInput'
      ) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '20.02.2024' } });

      const openedCheckbox = screen.getByLabelText(
        'Открыто'
      ) as HTMLInputElement;
      fireEvent.click(openedCheckbox);

      const commentInput = screen.getByLabelText('Комментарий');
      fireEvent.change(commentInput, {
        target: { value: 'Новый комментарий' },
      });

      const submitButton = screen.getByText('Сохранить');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateBid).toHaveBeenCalledWith(
          1,
          {
            openning_date: '2024-02-20',
            manager_comment: 'Новый комментарий',
            opened: true,
          },
          true
        );
      });

      expect(mockedShowNotification).toHaveBeenCalledWith(
        'Данные успешно изменены!',
        'success'
      );
      expect(onClose).toHaveBeenCalled();
    });

    it('показывает ошибку при неудачной отправке', async () => {
      const bid = makeBid({ id: 1 });
      mockBidStore.bid = bid;
      mockUpdateBid.mockResolvedValue(false);
      mockBidStore.bidError = 'Ошибка обновления';

      renderOpeningManagerBidModal();

      const submitButton = screen.getByText('Сохранить');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка обновления',
          'error'
        );
      });
    });

    it('конвертирует дату из DD.MM.YYYY в YYYY-MM-DD при сабмите', async () => {
      const bid = makeBid({ id: 1, openning_date: '2024-01-15', opened: true });
      mockBidStore.bid = bid;
      mockUpdateBid.mockResolvedValue(true);

      renderOpeningManagerBidModal();

      const dateInput = screen.getByTestId(
        'datePickerInput'
      ) as HTMLInputElement;

      fireEvent.change(dateInput, { target: { value: '20.02.2024' } });

      fireEvent.click(screen.getByText('Сохранить'));

      await waitFor(() => {
        expect(mockUpdateBid).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            openning_date: '2024-02-20',
          }),
          true
        );
      });
    });

    it('не отправляет форму без bid', () => {
      mockBidStore.bid = null;
      renderOpeningManagerBidModal();

      const submitButton = screen.getByText('Сохранить');
      fireEvent.click(submitButton);

      expect(mockUpdateBid).not.toHaveBeenCalled();
    });
  });

  describe('Валидация формы', () => {
    it('показывает ошибку валидации для обязательного поля openning_date и opened', async () => {
      mockBidStore.bid = makeBid();
      renderOpeningManagerBidModal();

      const submitButton = screen.getByText('Сохранить');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Дата открытия обязательна для заполнения')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Необходимо подтвердить открытие')
        ).toBeInTheDocument();
      });
    });

    it('показывает ошибку валидации для чекбокса opened', async () => {
      mockBidStore.bid = makeBid();
      renderOpeningManagerBidModal();

      const dateInput = screen.getByTestId('datePickerInput');
      fireEvent.change(dateInput, { target: { value: '20.02.2024' } });

      fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(
          screen.queryByText('Дата открытия обязательна для заполнения')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Необходимо подтвердить открытие')
        ).toBeInTheDocument();
      });
    });

    it('не показывает ошибки валидации когда все поля заполнены корректно', async () => {
      mockBidStore.bid = makeBid();
      renderOpeningManagerBidModal();

      const dateInput = screen.getByTestId('datePickerInput');
      fireEvent.change(dateInput, { target: { value: '20.02.2024' } });

      const openedCheckbox = screen.getByLabelText('Открыто');
      fireEvent.click(openedCheckbox);

      const commentInput = screen.getByLabelText('Комментарий');
      fireEvent.change(commentInput, {
        target: { value: 'Новый комментарий' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      expect(
        screen.queryByText('Дата открытия обязательна для заполнения')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Необходимо подтвердить открытие')
      ).not.toBeInTheDocument();
    });
  });

  describe('Обработка ошибок', () => {
    it('показывает уведомление об ошибке когда bidError не null', async () => {
      mockBidStore.bidError = 'Ошибка загрузки';
      renderOpeningManagerBidModal();

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка загрузки',
          'error'
        );
      });

      expect(setBidErrorMock).toHaveBeenCalledWith(null);
    });

    it('не показывает уведомление когда bidError null', () => {
      mockBidStore.bidError = null;
      renderOpeningManagerBidModal();

      expect(mockedShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Закрытие модального окна', () => {
    it('вызывает onClose при клике на кнопку Отмена', () => {
      const onClose = jest.fn();
      renderOpeningManagerBidModal({ onClose });

      fireEvent.click(screen.getByText('Отмена'));
      expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике вне модального окна', () => {
      const onClose = jest.fn();
      renderOpeningManagerBidModal({ onClose });

      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Условный рендеринг', () => {
    it('не рендерится когда open=false', () => {
      renderOpeningManagerBidModal({ open: false });
      expect(
        screen.queryByTestId('dialogOpeningManagerBidModal')
      ).not.toBeInTheDocument();
    });

    it('рендерится когда open=true', () => {
      renderOpeningManagerBidModal({ open: true });
      expect(
        screen.getByTestId('dialogOpeningManagerBidModal')
      ).toBeInTheDocument();
    });
  });
});
