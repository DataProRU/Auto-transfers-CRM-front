import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ReExportBidModal from '../ReExportBidModal';
import bidStore from '@/store/BidStore';
import type { Bid } from '@/models/BidResponse';
import { makeBid } from '@/utils/test/factories.ts';

type MockBidStore = {
  bid: Bid | null;
  updateExpandedBid: jest.MockedFunction<typeof bidStore.updateExpandedBid>;
  bidError: string | null;
  setBidError: jest.MockedFunction<typeof bidStore.setBidError>;
};

jest.mock('@/store/BidStore', () => ({
  bid: null,
  updateExpandedBid: jest.fn(),
  bidError: null,
  setBidError: jest.fn(),
}));

const mockedShowNotification = jest.fn();
jest.mock('@/providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
}));

const updateExpandedBidMock = bidStore.updateExpandedBid as jest.MockedFunction<
  typeof bidStore.updateExpandedBid
>;
const setBidErrorMock = bidStore.setBidError as jest.MockedFunction<
  typeof bidStore.setBidError
>;

const mockBidStore = bidStore as unknown as MockBidStore;

const defaultBid = makeBid({
  brand: 'Toyota',
  model: 'Camry',
  vin: 'VIN123456789012345',
  recipient: 'Test Recipient',
  price: 25000,
  title_collection_date: '2024-01-15',
  export: false,
  prepared_documents: false,
});

const renderReExportBidModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(<ReExportBidModal {...defaultProps} />);
};

function getCheckboxes() {
  return {
    exportCheckbox: screen.getByLabelText('Эспорт') as HTMLInputElement,
    preparedDocumentsCheckbox: screen.getByLabelText(
      'Подготовил документы'
    ) as HTMLInputElement,
  };
}

describe('ReExportBidModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockBidStore.bid = defaultBid;
    mockBidStore.bidError = null;
  });

  describe('Рендеринг', () => {
    it('рендерится с заголовком заявки когда есть bid', () => {
      renderReExportBidModal();

      expect(
        screen.getByText(/Заявка на Toyota Camry VIN123456789012345/)
      ).toBeInTheDocument();
    });

    it('отображает чекбоксы с правильными значениями по умолчанию', () => {
      renderReExportBidModal();

      const { exportCheckbox, preparedDocumentsCheckbox } = getCheckboxes();

      expect(exportCheckbox).not.toBeChecked();
      expect(preparedDocumentsCheckbox).not.toBeChecked();
    });

    it('отображает чекбоксы с переданными значениями из bid', () => {
      const bid = makeBid({
        export: true,
        prepared_documents: true,
      });
      mockBidStore.bid = bid;
      renderReExportBidModal();

      const { exportCheckbox, preparedDocumentsCheckbox } = getCheckboxes();

      expect(exportCheckbox).toBeChecked();
      expect(preparedDocumentsCheckbox).toBeChecked();
    });

    it('отображает кнопки Отмена и Сохранить', () => {
      renderReExportBidModal();
      expect(screen.getByText('Отмена')).toBeInTheDocument();
      expect(screen.getByText('Сохранить')).toBeInTheDocument();
    });
  });

  describe('Информация о заявке', () => {
    it('отображает информацию о заявке в аккордеоне', () => {
      renderReExportBidModal();

      userEvent.click(screen.getByText('Информация о заявке'));
      expect(screen.getByText('Информация о заявке')).toBeInTheDocument();

      expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Camry')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('VIN123456789012345')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Recipient')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25000')).toBeInTheDocument();
    });

    it('отображает дату забора тайтла в правильном формате', () => {
      renderReExportBidModal();

      expect(screen.getByDisplayValue('15.01.2024')).toBeInTheDocument();
    });

    it('отображает пустую дату когда title_collection_date не указан', async () => {
      const bid = makeBid({
        title_collection_date: null,
      });
      mockBidStore.bid = bid;
      renderReExportBidModal();

      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      await userEvent.click(accordionButton);

      const dateField = screen.getByLabelText('Дата забора тайтла');
      expect(dateField).toHaveValue('');
    });

    it('все поля информации о заявке отключены', () => {
      const bid = makeBid();
      mockBidStore.bid = bid;
      renderReExportBidModal();

      const accordionButton = screen.getByRole('button', {
        name: 'Информация о заявке',
      });
      userEvent.click(accordionButton);

      const brandField = screen.getByLabelText('Марка');
      const modelField = screen.getByLabelText('Модель');
      const vinField = screen.getByLabelText('VIN');
      const recipientField = screen.getByLabelText('Получатель');
      const priceField = screen.getByLabelText('Цена автомобиля');
      const dateField = screen.getByLabelText('Дата забора тайтла');

      expect(brandField).toBeDisabled();
      expect(modelField).toBeDisabled();
      expect(vinField).toBeDisabled();
      expect(recipientField).toBeDisabled();
      expect(priceField).toBeDisabled();
      expect(dateField).toBeDisabled();
    });
  });

  describe('Взаимодействие с формой', () => {
    beforeEach(() => {
      mockBidStore.bid = defaultBid;
    });

    it('позволяет изменять состояние чекбокса "Эспорт"', async () => {
      renderReExportBidModal();

      const { exportCheckbox } = getCheckboxes();
      expect(exportCheckbox).not.toBeChecked();

      await userEvent.click(exportCheckbox);
      expect(exportCheckbox).toBeChecked();

      await userEvent.click(exportCheckbox);
      expect(exportCheckbox).not.toBeChecked();
    });

    it('позволяет изменять состояние чекбокса "Подготовил документы"', async () => {
      renderReExportBidModal();

      const { preparedDocumentsCheckbox } = getCheckboxes();
      expect(preparedDocumentsCheckbox).not.toBeChecked();

      await userEvent.click(preparedDocumentsCheckbox);
      expect(preparedDocumentsCheckbox).toBeChecked();

      await userEvent.click(preparedDocumentsCheckbox);
      expect(preparedDocumentsCheckbox).not.toBeChecked();
    });

    it('отправляет форму с правильными данными', async () => {
      const onClose = jest.fn();
      updateExpandedBidMock.mockResolvedValue(true);
      renderReExportBidModal({ onClose });

      const { exportCheckbox, preparedDocumentsCheckbox } = getCheckboxes();

      await userEvent.click(exportCheckbox);
      await userEvent.click(preparedDocumentsCheckbox);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateExpandedBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          {
            export: true,
            prepared_documents: true,
          },
          true,
          true
        );

        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('правильно определяет inProgressCondition и completedCondition', async () => {
      updateExpandedBidMock.mockResolvedValue(true);
      renderReExportBidModal();

      const { preparedDocumentsCheckbox } = getCheckboxes();
      await userEvent.click(preparedDocumentsCheckbox);

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateExpandedBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          expect.objectContaining({
            prepared_documents: true,
          }),
          true,
          false
        );
      });

      updateExpandedBidMock.mockClear();
      await userEvent.click(preparedDocumentsCheckbox); // снимаем галочку

      const { exportCheckbox } = getCheckboxes();
      await userEvent.click(exportCheckbox);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateExpandedBidMock).toHaveBeenCalledWith(
          defaultBid.id,
          expect.objectContaining({
            export: true,
          }),
          false,
          true
        );
      });
    });

    it('вызывает onClose и уведомление об успехе при успешной отправке формы', async () => {
      const mockOnClose = jest.fn();
      updateExpandedBidMock.mockResolvedValue(true);
      renderReExportBidModal({ onClose: mockOnClose });

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Данные успешно изменены!',
          'success'
        );
      });
    });

    it('показывает уведомление об ошибке при неуспешной отправке', async () => {
      updateExpandedBidMock.mockResolvedValue(false);
      mockBidStore.bidError = 'Ошибка сервера';
      renderReExportBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка сервера',
          'error'
        );
      });
    });

    it('показывает уведомление об ошибке по умолчанию при неуспешной отправке', async () => {
      updateExpandedBidMock.mockResolvedValue(false);
      mockBidStore.bidError = null;
      renderReExportBidModal();

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

  describe('useEffect - обработка ошибок', () => {
    it('показывает уведомление об ошибке при bidError', async () => {
      mockBidStore.bidError = 'Ошибка загрузки';
      renderReExportBidModal();

      await waitFor(() => {
        expect(mockedShowNotification).toHaveBeenCalledWith(
          'Ошибка загрузки',
          'error'
        );
      });

      expect(setBidErrorMock).toHaveBeenCalledWith(null);
    });
  });

  describe('useEffect - сброс формы', () => {
    it('сбрасывает форму при изменении bid', () => {
      const bid1 = makeBid({
        export: false,
        prepared_documents: false,
      });
      const bid2 = makeBid({
        export: true,
        prepared_documents: true,
      });

      mockBidStore.bid = bid1;
      const { rerender } = renderReExportBidModal();

      let { exportCheckbox, preparedDocumentsCheckbox } = getCheckboxes();
      expect(exportCheckbox).not.toBeChecked();
      expect(preparedDocumentsCheckbox).not.toBeChecked();

      mockBidStore.bid = bid2;
      rerender(<ReExportBidModal open={true} onClose={jest.fn()} />);

      ({ exportCheckbox, preparedDocumentsCheckbox } = getCheckboxes());
      expect(exportCheckbox).toBeChecked();
      expect(preparedDocumentsCheckbox).toBeChecked();
    });
  });

  describe('Кнопки', () => {
    beforeEach(() => {
      mockBidStore.bid = defaultBid;
    });

    it('вызывает onClose при нажатии кнопки "Отмена"', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      renderReExportBidModal({ onClose: mockOnClose });

      const cancelButton = screen.getByRole('button', { name: 'Отмена' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('отправляет форму при нажатии кнопки "Сохранить"', async () => {
      const user = userEvent.setup();
      updateExpandedBidMock.mockResolvedValue(true);
      renderReExportBidModal();

      const submitButton = screen.getByRole('button', { name: 'Сохранить' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateExpandedBidMock).toHaveBeenCalled();
      });
    });
  });

  describe('Условный рендеринг', () => {
    it('не рендерится когда open=false', () => {
      mockBidStore.bid = null;
      renderReExportBidModal({ open: false });

      expect(
        screen.queryByTestId('dialogReExportBidModal')
      ).not.toBeInTheDocument();
    });

    it('рендерится когда open=true', () => {
      renderReExportBidModal({ open: true });
      expect(screen.getByTestId('dialogReExportBidModal')).toBeInTheDocument();
    });
  });
});
