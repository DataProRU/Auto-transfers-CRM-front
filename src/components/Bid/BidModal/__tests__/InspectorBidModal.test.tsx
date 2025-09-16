import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InspectorBidModal from '../InspectorBidModal';
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
  location: 'Склад №1',
  acceptance_date: '2024-01-15',
  transit_number: 'TN123456',
  inspection_done: 'yes',
  number_sent: true,
  inspection_paid: false,
  inspector_comment: 'Test comment',
  notified_logistician_by_inspector: true,
  inspection_date: '2024-01-16',
  number_sent_date: '2024-01-17',
});

const renderInspectorBidModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(<InspectorBidModal {...defaultProps} />);
};

const mockBidStore = bidStore as jest.Mocked<typeof bidStore>;
const updateBidMock = mockBidStore.updateBid as jest.MockedFunction<
  typeof mockBidStore.updateBid
>;
const setBidErrorMock = mockBidStore.setBidError as jest.MockedFunction<
  typeof mockBidStore.setBidError
>;

describe('InspectorBidModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBidStore.bid = defaultBid;
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('рендерится с заголовком заявки когда есть bid', () => {
      renderInspectorBidModal();

      expect(
        screen.getByText('Заявка на Toyota Camry VIN123456789012345')
      ).toBeInTheDocument();
    });

    it('отображает кнопки Отмена и Сохранить', () => {
      renderInspectorBidModal();

      expect(
        screen.getByRole('button', { name: 'Отмена' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Сохранить' })
      ).toBeInTheDocument();
    });

    it('отображает информацию о заявке в аккордеоне', () => {
      renderInspectorBidModal();

      expect(screen.getByText('Информация о заявке')).toBeInTheDocument();

      expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Camry')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Склад №1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15.01.2024')).toBeInTheDocument();
    });

    it('отображает поля формы для редактирования', () => {
      renderInspectorBidModal();

      expect(screen.getByLabelText('Транзитный номер')).toBeInTheDocument();
      expect(screen.getByLabelText('Сделан ли осмотр')).toBeInTheDocument();
      expect(screen.getByLabelText('Комментарий')).toBeInTheDocument();
    });

    it('заполняет форму данными из bid при открытии', () => {
      renderInspectorBidModal();

      expect(screen.getByDisplayValue('TN123456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test comment')).toBeInTheDocument();
    });

    it('отображает чекбоксы', () => {
      renderInspectorBidModal();

      expect(screen.getByLabelText('Отправил номер')).toBeInTheDocument();
      expect(screen.getByLabelText('Оплата осмотра')).toBeInTheDocument();
      expect(screen.getByLabelText('Уведомил логиста')).toBeInTheDocument();
    });

    it('отображает даты в read-only полях', () => {
      renderInspectorBidModal();

      expect(screen.getByDisplayValue('16.01.2024')).toBeInTheDocument(); // inspection_date
      expect(screen.getByDisplayValue('17.01.2024')).toBeInTheDocument(); // number_sent_date
    });
  });

  describe('Взаимодействие с формой', () => {
    it('позволяет редактировать транзитный номер', async () => {
      renderInspectorBidModal();

      const transitNumberInput = screen.getByLabelText('Транзитный номер');
      await userEvent.clear(transitNumberInput);
      await userEvent.type(transitNumberInput, 'NEW123');

      expect(transitNumberInput).toHaveValue('NEW123');
    });

    it('позволяет выбирать статус осмотра', async () => {
      renderInspectorBidModal();

      const inspectionSelect = screen.getByLabelText('Сделан ли осмотр');
      await userEvent.click(inspectionSelect);

      const noOption = screen.getByRole('option', { name: 'Нет' });
      await userEvent.click(noOption);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          expect.objectContaining({
            inspection_done: 'no',
          }),
          expect.any(Boolean)
        );
      });
    });

    it('позволяет редактировать комментарий', async () => {
      renderInspectorBidModal();

      const commentInput = screen.getByLabelText('Комментарий');
      await userEvent.clear(commentInput);
      await userEvent.type(commentInput, 'Новый комментарий');

      expect(commentInput).toHaveValue('Новый комментарий');
    });

    it('позволяет переключать чекбоксы', async () => {
      renderInspectorBidModal();

      const numberSentCheckbox = screen.getByLabelText('Отправил номер');
      const inspectionPaidCheckbox = screen.getByLabelText('Оплата осмотра');
      const notifiedCheckbox = screen.getByLabelText('Уведомил логиста');

      await userEvent.click(numberSentCheckbox);
      await userEvent.click(inspectionPaidCheckbox);
      await userEvent.click(notifiedCheckbox);

      expect(numberSentCheckbox).not.toBeChecked();
      expect(inspectionPaidCheckbox).toBeChecked();
      expect(notifiedCheckbox).not.toBeChecked();
    });
  });

  describe('onSubmit - отправка формы', () => {
    it('успешно отправляет форму и показывает уведомление об успехе', async () => {
      updateBidMock.mockResolvedValue(true);
      renderInspectorBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          expect.objectContaining({
            transit_number: 'TN123456',
            inspection_done: 'yes',
            number_sent: true,
            inspection_paid: false,
            inspector_comment: 'Test comment',
            notified_logistician_by_inspector: true,
            inspection_date: expect.any(String),
            number_sent_date: expect.any(String),
          }),
          expect.any(Boolean)
        );
      });

      expect(mockedShowNotification).toHaveBeenCalledWith(
        'Данные успешно изменены!',
        'success'
      );
    });

    it('показывает ошибку при неудачной отправке', async () => {
      updateBidMock.mockResolvedValue(false);
      mockBidStore.bidError = 'Ошибка обновления';
      renderInspectorBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка обновления',
          'error'
        );
      });
    });

    it('не отправляет форму если bid равен null', async () => {
      mockBidStore.bid = null;
      renderInspectorBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      expect(updateBidMock).not.toHaveBeenCalled();
    });

    it('правильно определяет inProgressCondition для without_openning', async () => {
      const bidWithoutOpening = makeBid({
        ...defaultBid,
        transit_method: 'without_openning',
      });
      mockBidStore.bid = bidWithoutOpening;
      updateBidMock.mockResolvedValue(true);
      renderInspectorBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          bidWithoutOpening.id,
          expect.any(Object),
          true
        );
      });
    });

    it('правильно определяет inProgressCondition для re_export', async () => {
      const bidReExport = makeBid({
        ...defaultBid,
        transit_method: 're_export',
        inspection_done: 'yes',
      });
      mockBidStore.bid = bidReExport;
      updateBidMock.mockResolvedValue(true);
      renderInspectorBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          bidReExport.id,
          expect.any(Object),
          true
        );
      });
    });

    it('правильно определяет inProgressCondition для re_export c inspection_done no', async () => {
      const bidReExport = makeBid({
        ...defaultBid,
        transit_method: 're_export',
        inspection_done: 'no',
      });
      mockBidStore.bid = bidReExport;
      updateBidMock.mockResolvedValue(true);
      renderInspectorBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateBidMock).toHaveBeenCalledWith(
          bidReExport.id,
          expect.any(Object),
          false
        );
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
      });
    });
  });

  describe('useEffect - обработка ошибок', () => {
    it('показывает уведомление об ошибке при bidError', async () => {
      mockBidStore.bidError = 'Ошибка загрузки';
      renderInspectorBidModal();

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка загрузки',
          'error'
        );
      });

      expect(setBidErrorMock).toHaveBeenCalledWith(null);
    });
  });
});
