import RejectBidModal from '../RejectBidModal';
import bidStore from '@/store/BidStore';
import { makeBid } from '@/utils/test/factories.ts';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
  rejectBid: jest.fn(),
}));

const renderRejectBidModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(<RejectBidModal {...defaultProps} />);
};

const mockBidStore = bidStore as jest.Mocked<typeof bidStore>;
const setBidErrorMock = mockBidStore.setBidError as jest.MockedFunction<
  typeof mockBidStore.setBidError
>;
const mockRejectBid = mockBidStore.rejectBid as jest.MockedFunction<
  typeof mockBidStore.rejectBid
>;

describe('OpeningRejectBidModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBidStore.bid = makeBid({ transit_method: null });
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('рендерит модальное окно с правильным data-testid', () => {
      renderRejectBidModal();
      expect(screen.getByTestId('dialogRejectBidModal')).toBeInTheDocument();
    });
    it('рендерит поле Причина отказа ', () => {
      renderRejectBidModal();
      expect(screen.getByLabelText('Причина отказа')).toBeInTheDocument();
    });
    it('рендерит кнопки Отмена и Применить ', () => {
      renderRejectBidModal();

      const cancelButton = screen.getByText('Отмена');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveAttribute('type', 'button');

      const submitButton = screen.getByText('Применить');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Валидация', () => {
    it('показывает ошибку валидации для обязательного поля logistician_comment', async () => {
      renderRejectBidModal();
      const submitButton = screen.getByText('Применить');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Необходимо заполнить причину отказа в заявке')
        ).toBeInTheDocument();
      });
    });
    it('не показывает ошибку когда поле заполнено', async () => {
      renderRejectBidModal();

      const commentInput = screen.getByLabelText('Причина отказа');
      await userEvent.type(commentInput, 'Valid reason');

      const submitButton = screen.getByText('Применить');
      await userEvent.click(submitButton);

      expect(
        screen.queryByText('Необходимо заполнить причину отказа в заявке')
      ).not.toBeInTheDocument();
    });
  });

  describe('useEffect - обработка bidError', () => {
    it('показывает уведомление об ошибке когда bidError не null', () => {
      mockBidStore.bidError = 'Ошибка из store';
      renderRejectBidModal();

      expect(mockedShowNotification).toHaveBeenCalledWith(
        'Ошибка из store',
        'error'
      );
      expect(setBidErrorMock).toHaveBeenCalledWith(null);
    });

    it('не показывает уведомление когда bidError null', () => {
      mockBidStore.bidError = null;
      renderRejectBidModal();

      expect(mockedShowNotification).not.toHaveBeenCalled();
      expect(setBidErrorMock).not.toHaveBeenCalled();
    });

    it('показывает уведомление при изменении bidError', () => {
      const { rerender } = renderRejectBidModal();

      expect(mockedShowNotification).not.toHaveBeenCalled();

      mockBidStore.bidError = 'Новая ошибка';
      rerender(<RejectBidModal open={true} onClose={jest.fn()} />);

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
      mockRejectBid.mockResolvedValue(true);

      renderRejectBidModal({ onClose });

      const commentInput = screen.getByLabelText('Причина отказа');
      await userEvent.type(commentInput, 'Test rejection reason');

      const submitButton = screen.getByText('Применить');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRejectBid).toHaveBeenCalledWith(mockBidStore.bid!.id, {
          logistician_comment: 'Test rejection reason',
        });
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Заявка успешно отказана!',
          'success'
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('показывает ошибку при неудачной отправке', async () => {
      mockRejectBid.mockResolvedValue(false);
      mockBidStore.bidError = 'Ошибка сервера';

      renderRejectBidModal();

      const commentInput = screen.getByLabelText('Причина отказа');
      await userEvent.type(commentInput, 'Test rejection reason');

      const submitButton = screen.getByText('Применить');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRejectBid).toHaveBeenCalledWith(mockBidStore.bid!.id, {
          logistician_comment: 'Test rejection reason',
        });
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка сервера',
          'error'
        );
      });
    });

    it('показывает ошибку по умолчанию при неудачной отправке без bidError', async () => {
      mockRejectBid.mockResolvedValue(false);
      mockBidStore.bidError = null;

      renderRejectBidModal();

      const commentInput = screen.getByLabelText('Причина отказа');
      await userEvent.type(commentInput, 'Test rejection reason');

      const submitButton = screen.getByText('Применить');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Не удалось отказать в заявке',
          'error'
        );
      });
    });

    it('не отправляет форму если bid равен null', async () => {
      mockBidStore.bid = null;

      renderRejectBidModal();

      const commentInput = screen.getByLabelText('Причина отказа');
      await userEvent.type(commentInput, 'Test rejection reason');

      const submitButton = screen.getByText('Применить');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRejectBid).not.toHaveBeenCalled();
        expect(mockedShowNotification).not.toHaveBeenCalled();
      });
    });

    it('не отправляет форму при ошибке валидации', async () => {
      renderRejectBidModal();

      const submitButton = screen.getByText('Применить');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Необходимо заполнить причину отказа в заявке')
        ).toBeInTheDocument();
      });

      expect(mockRejectBid).not.toHaveBeenCalled();
      expect(mockedShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Закрытие модального окна', () => {
    it('вызывает onClose при клике на кнопку Отмена', () => {
      const onClose = jest.fn();
      renderRejectBidModal({ onClose });

      fireEvent.click(screen.getByText('Отмена'));
      expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике вне модального окна', () => {
      const onClose = jest.fn();
      renderRejectBidModal({ onClose });

      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Условный рендеринг', () => {
    it('не рендерится когда open=false', () => {
      renderRejectBidModal({ open: false });
      expect(
        screen.queryByTestId('dialogRejectBidModal')
      ).not.toBeInTheDocument();
    });

    it('рендерится когда open=true', () => {
      renderRejectBidModal({ open: true });
      expect(screen.getByTestId('dialogRejectBidModal')).toBeInTheDocument();
    });
  });
});
