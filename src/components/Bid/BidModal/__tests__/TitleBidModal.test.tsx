import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TitleBidModal from '../TitleBidModal';
import bidStore from '@/store/BidStore';
import { makeBid } from '@/utils/test/factories.ts';

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

const defaultBid = makeBid({
  brand: 'Toyota',
  model: 'Camry',
  vin: 'VIN123456789012345',
  pickup_address: 'ул. Ленина, д. 10',
  took_title: 'yes',
  title_collection_date: '2024-01-15',
  manager_comment: 'Test comment',
});

const renderTitleBidModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(<TitleBidModal {...defaultProps} />);
};

const mockBidStore = bidStore as jest.Mocked<typeof bidStore>;
const updateBidMock = mockBidStore.updateBid as jest.MockedFunction<
  typeof mockBidStore.updateBid
>;
const setBidErrorMock = mockBidStore.setBidError as jest.MockedFunction<
  typeof mockBidStore.setBidError
>;

describe('TitleBidModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBidStore.bid = defaultBid;
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('рендерится с заголовком заявки когда есть bid', () => {
      renderTitleBidModal();

      expect(
        screen.getByText(/Заявка на Toyota Camry VIN123456789012345/)
      ).toBeInTheDocument();
    });

    it('отображает кнопки Отмена и Сохранить', () => {
      renderTitleBidModal();

      expect(
        screen.getByRole('button', { name: 'Отмена' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Сохранить' })
      ).toBeInTheDocument();
    });

    it('отображает информацию о заявке в аккордеоне', () => {
      renderTitleBidModal();

      expect(screen.getByText('Информация о заявке')).toBeInTheDocument();

      expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Camry')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('VIN123456789012345')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test comment')).toBeInTheDocument();
    });

    it('отображает поля формы для редактирования', () => {
      renderTitleBidModal();

      expect(screen.getByLabelText('Адрес забора')).toBeInTheDocument();
      expect(screen.getByLabelText('Забрал тайтл')).toBeInTheDocument();
      expect(screen.getByLabelText('Дата забора тайтла')).toBeInTheDocument();
    });

    it('заполняет форму данными из bid при открытии', () => {
      renderTitleBidModal();

      expect(screen.getByDisplayValue('ул. Ленина, д. 10')).toBeInTheDocument();
      expect(screen.getByText('Да')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15.01.2024')).toBeInTheDocument();
    });

    it('отображает "Не указана" для даты забора тайтла когда дата отсутствует', () => {
      mockBidStore.bid = { ...defaultBid, title_collection_date: null };
      renderTitleBidModal();

      expect(screen.getByDisplayValue('Не указана')).toBeInTheDocument();
    });

    it('все поля информации о заявке отключены', () => {
      renderTitleBidModal();

      const brandField = screen.getByDisplayValue(defaultBid.brand);
      const modelField = screen.getByDisplayValue(defaultBid.model);
      const vinField = screen.getByDisplayValue(defaultBid.vin);
      const dateField = screen.getByLabelText('Дата забора тайтла');

      expect(brandField).toBeDisabled();
      expect(modelField).toBeDisabled();
      expect(vinField).toBeDisabled();
      expect(dateField).toBeDisabled();
    });
  });

  describe('useEffect - обработка bidError', () => {
    it('показывает уведомление об ошибке когда bidError не null', () => {
      mockBidStore.bidError = 'Ошибка из store';
      renderTitleBidModal();

      expect(mockedShowNotification).toHaveBeenCalledWith(
        'Ошибка из store',
        'error'
      );
      expect(setBidErrorMock).toHaveBeenCalledWith(null);
    });

    it('не показывает уведомление когда bidError null', () => {
      mockBidStore.bidError = null;
      renderTitleBidModal();

      expect(mockedShowNotification).not.toHaveBeenCalled();
      expect(setBidErrorMock).not.toHaveBeenCalled();
    });

    it('показывает уведомление при изменении bidError', () => {
      const { rerender } = renderTitleBidModal();

      expect(mockedShowNotification).not.toHaveBeenCalled();

      mockBidStore.bidError = 'Новая ошибка';
      rerender(<TitleBidModal open={true} onClose={jest.fn()} />);

      expect(mockedShowNotification).toHaveBeenCalledWith(
        'Новая ошибка',
        'error'
      );
      expect(setBidErrorMock).toHaveBeenCalledWith(null);
    });
  });

  describe('onSubmit - отправка формы', () => {
    it('успешно отправляет форму и показывает уведомление об успехе', async () => {
      const onClose = jest.fn();
      updateBidMock.mockResolvedValue(true);

      renderTitleBidModal({ onClose });

      const pickupAddressInput = screen.getByLabelText('Адрес забора');
      await userEvent.clear(pickupAddressInput);
      await userEvent.type(pickupAddressInput, 'ул. Пушкина, д. 5');

      const titleSelect = screen.getByLabelText('Забрал тайтл');
      await userEvent.click(titleSelect);
      const optionYes = await screen.findByRole('option', {
        name: 'Да',
      });
      await userEvent.click(optionYes);

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          {
            pickup_address: 'ул. Пушкина, д. 5',
            took_title: 'yes',
            title_collection_date: expect.any(String),
          },
          true
        );
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('устанавливает title_collection_date для значения "consignment"', async () => {
      updateBidMock.mockResolvedValue(true);

      renderTitleBidModal();

      const tookTitleSelect = screen.getByLabelText('Забрал тайтл');
      await userEvent.click(tookTitleSelect);
      await userEvent.click(screen.getByText('Коносамент'));

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          {
            pickup_address: defaultBid.pickup_address,
            took_title: 'consignment',
            title_collection_date: expect.any(String),
          },
          true
        );
      });
    });

    it('не устанавливает title_collection_date для значения "no"', async () => {
      updateBidMock.mockResolvedValue(true);

      renderTitleBidModal();

      const tookTitleSelect = screen.getByLabelText('Забрал тайтл');
      await userEvent.click(tookTitleSelect);
      await userEvent.click(screen.getByText('Нет'));

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          {
            pickup_address: defaultBid.pickup_address,
            took_title: 'no',
            title_collection_date: null,
          },
          false
        );
      });
    });

    it('показывает ошибку при неудачной отправке', async () => {
      mockBidStore.bidError = 'Ошибка сервера';
      updateBidMock.mockResolvedValue(false);

      renderTitleBidModal();

      const tookTitleSelect = screen.getByLabelText('Забрал тайтл');
      await userEvent.click(tookTitleSelect);
      const yesOption = screen.getByRole('option', { name: 'Да' });
      await userEvent.click(yesOption);

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка сервера',
          'error'
        );
      });
    });

    it('показывает ошибку по умолчанию при неудачной отправке без bidError', async () => {
      mockBidStore.bidError = null;
      updateBidMock.mockResolvedValue(false);

      renderTitleBidModal();

      const tookTitleSelect = screen.getByLabelText('Забрал тайтл');
      await userEvent.click(tookTitleSelect);
      const yesOption = screen.getByRole('option', { name: 'Да' });
      await userEvent.click(yesOption);

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Не удалось изменить данные',
          'error'
        );
      });
    });

    it('не отправляет форму если нет bid', async () => {
      mockBidStore.bid = null;
      renderTitleBidModal();

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      expect(updateBidMock).not.toHaveBeenCalled();
    });
  });

  describe('Закрытие модального окна', () => {
    it('вызывает onClose при клике на кнопку Отмена', () => {
      const onClose = jest.fn();
      renderTitleBidModal({ onClose });

      fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
      expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике вне модального окна', () => {
      const onClose = jest.fn();
      renderTitleBidModal({ onClose });

      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('вызывает onClose при успешной отправке формы', async () => {
      const onClose = jest.fn();
      updateBidMock.mockResolvedValue(true);

      renderTitleBidModal({ onClose });

      const tookTitleSelect = screen.getByLabelText('Забрал тайтл');
      await userEvent.click(tookTitleSelect);
      const yesOption = screen.getByRole('option', { name: 'Да' });
      await userEvent.click(yesOption);

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Условный рендеринг', () => {
    it('не рендерится когда open=false', () => {
      renderTitleBidModal({ open: false });
      expect(
        screen.queryByTestId('dialogTitleBidModal')
      ).not.toBeInTheDocument();
    });

    it('рендерится когда open=true', () => {
      renderTitleBidModal({ open: true });
      expect(screen.getByTestId('dialogTitleBidModal')).toBeInTheDocument();
    });
  });
});
