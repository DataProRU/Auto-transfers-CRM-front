import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LogistBidModal from '../Logist/LogistBidModal.tsx';
import bidStore from '@/store/BidStore';
import type { Bid } from '@/models/BidResponse';
import { makeBid } from '@/utils/test/factories.ts';

type MockBidStore = {
  bid: Bid | null;
  updateBid: jest.MockedFunction<typeof bidStore.updateBid>;
  bidError: string | null;
  setBidError: jest.MockedFunction<typeof bidStore.setBidError>;
};

jest.mock('@/store/BidStore', () => ({
  bid: null,
  updateBid: jest.fn(),
  bidError: null,
  setBidError: jest.fn(),
}));

const mockedShowNotification = jest.fn();
jest.mock('@/providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
}));

const updateBidMock = bidStore.updateBid as jest.MockedFunction<
  typeof bidStore.updateBid
>;
const setBidErrorMock = bidStore.setBidError as jest.MockedFunction<
  typeof bidStore.setBidError
>;

const mockBidStore = bidStore as unknown as MockBidStore;

const renderLogistBidModal = (
  props: Partial<{ open: boolean; onClose: () => void }> = {}
) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };
  return render(<LogistBidModal {...defaultProps} />);
};

function getCheckboxes() {
  return {
    titleCheckbox: screen.getByLabelText('Запросил тайтл') as HTMLInputElement,
    parkingCheckbox: screen.getByLabelText(
      'Уведомил стоянку (Без открытия)'
    ) as HTMLInputElement,
    inspectorCheckbox: screen.getByLabelText(
      'Уведомил осмотр (Без открытия)'
    ) as HTMLInputElement,
  };
}

describe('LogistBidModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockBidStore.bid = null;
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('не рендерится когда open=false', () => {
      renderLogistBidModal({ open: false });

      expect(
        screen.queryByTestId('dialogLogistBidModal')
      ).not.toBeInTheDocument();
    });

    it('рендерится с заголовком заявки когда есть bid', () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      expect(
        screen.getByText(/Заявка на Toyota Camry VIN123456789012345/)
      ).toBeInTheDocument();
    });

    it('отображает информацию о заявке в аккордеоне', () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      expect(screen.getByText('Информация о заявке')).toBeInTheDocument();

      expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument(); // brand
      expect(screen.getByDisplayValue('Camry')).toBeInTheDocument(); // model
      expect(
        screen.getByDisplayValue('VIN123456789012345')
      ).toBeInTheDocument(); // vin
      expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument(); // client
      expect(screen.getByDisplayValue('CONT123456')).toBeInTheDocument(); // container_number
      expect(screen.getByDisplayValue('15.01.2024')).toBeInTheDocument(); // arrival_date
      expect(screen.getByDisplayValue('Test Recipient')).toBeInTheDocument(); // recipient
      expect(screen.getByDisplayValue('Test Transporter')).toBeInTheDocument(); // transporter
    });

    it('отображает форму с полями для редактирования', () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      expect(screen.getByLabelText('Метод транзита')).toBeInTheDocument();
      expect(screen.getByLabelText('Местонахождение')).toBeInTheDocument();
      expect(screen.getByLabelText('Запросил тайтл')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Уведомил стоянку (Без открытия)')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Уведомил осмотр (Без открытия)')
      ).toBeInTheDocument();
    });

    it('отображает кнопки действий', () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      expect(
        screen.getByRole('button', { name: 'Отказать' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Отмена' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Сохранить' })
      ).toBeInTheDocument();
    });
  });

  describe('Валидация формы', () => {
    it('показывает ошибку валидации для обязательного поля transit_method', async () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(
          screen.getByText(/Метод транзита обязателен/)
        ).toBeInTheDocument();
      });
    });

    it('не показывает ошибку когда transit_method заполнен', async () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      const transitMethodSelect = screen.getByLabelText('Метод транзита');
      await userEvent.click(transitMethodSelect);
      await userEvent.click(screen.getByText('Т1'));

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      expect(
        screen.queryByText(/Метод транзита обязателен/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Взаимодействие с формой', () => {
    it('заполняет форму редактирования данными из bid при открытии', () => {
      const bid = makeBid({
        transit_method: 't1',
        location: 'Test Location',
        requested_title: true,
        notified_parking: true,
        notified_inspector: false,
      });
      mockBidStore.bid = bid;
      renderLogistBidModal();

      const { titleCheckbox, parkingCheckbox, inspectorCheckbox } =
        getCheckboxes();

      expect(screen.getByText('Т1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();

      expect(titleCheckbox.checked).toBe(true);
      expect(parkingCheckbox.checked).toBe(true);
      expect(inspectorCheckbox.checked).toBe(false);
    });

    it('блокирует чекбоксы уведомлений когда не выбран re_export', () => {
      mockBidStore.bid = makeBid({ transit_method: 't1' });
      renderLogistBidModal();

      const { titleCheckbox, parkingCheckbox, inspectorCheckbox } =
        getCheckboxes();

      expect(titleCheckbox.disabled).toBe(false);
      expect(parkingCheckbox.disabled).toBe(true);
      expect(inspectorCheckbox.disabled).toBe(true);
    });

    it('разблокирует чекбоксы уведомлений когда выбран re_export', async () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      const transitMethodSelect = screen.getByLabelText('Метод транзита');
      await userEvent.click(transitMethodSelect);
      await userEvent.click(screen.getByText('Реэкспорт'));

      const { titleCheckbox, parkingCheckbox, inspectorCheckbox } =
        getCheckboxes();

      expect(titleCheckbox.disabled).toBe(false);
      expect(parkingCheckbox.disabled).toBe(false);
      expect(inspectorCheckbox.disabled).toBe(false);
    });
  });

  describe('Отправка формы', () => {
    it('успешно отправляет форму и показывает уведомление', async () => {
      const bid = makeBid();
      mockBidStore.bid = bid;
      updateBidMock.mockResolvedValue(true);

      renderLogistBidModal();

      const transitMethodSelect = screen.getByLabelText('Метод транзита');
      await userEvent.click(transitMethodSelect);
      await userEvent.click(screen.getByText('Т1'));

      await userEvent.type(
        screen.getByLabelText('Местонахождение'),
        'Test Location'
      );

      // Отправляем форму
      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          bid.id,
          {
            transit_method: 't1',
            location: 'Test Location',
            requested_title: false,
            notified_parking: false,
            notified_inspector: false,
          },
          true
        );
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
      });
    });

    it('показывает ошибку при неудачной отправке', async () => {
      const bid = makeBid();
      mockBidStore.bid = bid;
      mockBidStore.bidError = 'Ошибка обновления';
      updateBidMock.mockResolvedValue(false);

      renderLogistBidModal();

      // Заполняем форму
      const transitMethodSelect = screen.getByLabelText('Метод транзита');
      await userEvent.click(transitMethodSelect);
      await userEvent.click(screen.getByText('Т1'));

      // Отправляем форму
      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка обновления',
          'error'
        );
      });
    });

    it('не отправляет форму если нет bid', async () => {
      mockBidStore.bid = null;
      renderLogistBidModal();

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      expect(updateBidMock).not.toHaveBeenCalled();
    });
  });

  describe('Обработка ошибок', () => {
    it('показывает уведомление об ошибке из store', () => {
      mockBidStore.bid = makeBid();
      mockBidStore.bidError = 'Ошибка из store';

      renderLogistBidModal();

      expect(mockedShowNotification).toHaveBeenCalledWith(
        'Ошибка из store',
        'error'
      );
      expect(setBidErrorMock).toHaveBeenCalledWith(null);
    });
  });

  describe('Кнопка отказа', () => {
    it('активна когда transit_method равен null', () => {
      mockBidStore.bid = makeBid({ transit_method: null });
      renderLogistBidModal();

      const rejectButton = screen.getByRole('button', { name: 'Отказать' });
      expect(rejectButton).not.toBeDisabled();
    });

    it('неактивна когда transit_method не равен null', () => {
      mockBidStore.bid = makeBid({ transit_method: 't1' });
      renderLogistBidModal();

      const rejectButton = screen.getByRole('button', { name: 'Отказать' });
      expect(rejectButton).toBeDisabled();
    });

    it('открывает RejectBidModal при нажатии', async () => {
      mockBidStore.bid = makeBid({ transit_method: null });
      renderLogistBidModal();

      await userEvent.click(screen.getByRole('button', { name: 'Отказать' }));

      expect(screen.getByTestId('dialogRejectBidModal')).toBeInTheDocument();
    });

    it('не рендерит RejectBidModal когда rejectOpen=false', () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal();

      expect(
        screen.queryByTestId('dialogRejectBidModal')
      ).not.toBeInTheDocument();
    });
  });

  describe('Закрытие модала', () => {
    it('вызывает onClose при нажатии кнопки Отмена', async () => {
      mockBidStore.bid = makeBid();
      renderLogistBidModal({ onClose: mockOnClose });

      await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('вызывает onClose при успешной отправке формы', async () => {
      const bid = makeBid();
      mockBidStore.bid = bid;
      updateBidMock.mockResolvedValue(true);

      renderLogistBidModal({ onClose: mockOnClose });

      const transitMethodSelect = screen.getByLabelText('Метод транзита');
      await userEvent.click(transitMethodSelect);
      await userEvent.click(screen.getByText('Т1'));

      await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
