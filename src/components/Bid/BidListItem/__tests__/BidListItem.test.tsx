import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BidListItem from '../BidListItem';
import bidStore from '@/store/BidStore';
import { authStore } from '@/store/AuthStore';
import { makeBid } from '@/utils/test/factories.ts';

type MockBidStore = {
  setBid: jest.MockedFunction<typeof bidStore.setBid>;
};

type MockAuthStore = {
  role: string;
};

const mockedShowNotification = jest.fn();

jest.mock('@/providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
}));

jest.mock('@/store/BidStore', () => ({
  setBid: jest.fn(),
}));

jest.mock('@/store/AuthStore', () => ({
  authStore: {
    role: 'logistician',
  },
}));

const mockBidStore = bidStore as unknown as MockBidStore;
const mockAuthStore = authStore as unknown as MockAuthStore;

const renderBidListItem = (bid = makeBid()) => {
  return render(<BidListItem bid={bid} />);
};

describe('BidListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.role = 'logistician';
  });

  describe('Рендеринг', () => {
    it('рендерит элемент списка с правильным data-testid', () => {
      const bid = makeBid({ id: 123 });
      renderBidListItem(bid);

      expect(screen.getByTestId('bid-item-123')).toBeInTheDocument();
    });

    it('отображает LogistBidInfo для роли logistician', () => {
      mockAuthStore.role = 'logistician';
      const bid = makeBid({ brand: 'Toyota', model: 'Camry' });
      renderBidListItem(bid);

      expect(screen.getByTestId('logistBidInfo')).toBeInTheDocument();
    });

    it('отображает OpeningManagerBidInfo для роли opening_manager', () => {
      mockAuthStore.role = 'opening_manager';
      const bid = makeBid({ brand: 'Honda', model: 'Civic' });
      renderBidListItem(bid);

      expect(screen.getByTestId('openingManagerBidInfo')).toBeInTheDocument();
    });

    it('отображает TitleBidInfo для роли title', () => {
      mockAuthStore.role = 'title';
      const bid = makeBid({ brand: 'BMW', model: 'X5' });
      renderBidListItem(bid);

      expect(screen.getByTestId('titleBidInfo')).toBeInTheDocument();
    });

    it('отображает InspectorBidInfo для роли inspector', () => {
      mockAuthStore.role = 'inspector';
      const bid = makeBid({ brand: 'Audi', model: 'A4' });
      renderBidListItem(bid);

      expect(screen.getByTestId('inspectorBidInfo')).toBeInTheDocument();
    });

    it('отображает ReExportBidInfo для других ролей', () => {
      mockAuthStore.role = 're_export';
      const bid = makeBid({ brand: 'Mercedes', model: 'C-Class' });
      renderBidListItem(bid);

      expect(screen.getByTestId('reExportBidInfo')).toBeInTheDocument();
    });
  });

  describe('Интерактивность', () => {
    it('вызывает setBid и открывает модальное окно при клике', () => {
      const bid = makeBid({ id: 456 });
      renderBidListItem(bid);

      const listItem = screen.getByTestId('bid-item-456');
      fireEvent.click(listItem);

      expect(mockBidStore.setBid).toHaveBeenCalledWith(bid);
    });

    it('закрывает модальное окно и очищает bid при закрытии', () => {
      const bid = makeBid();
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      fireEvent.click(listItem);

      const closeButton = screen.getByRole('button', { name: /отмена/i });
      fireEvent.click(closeButton);

      expect(mockBidStore.setBid).toHaveBeenCalledWith(null);
    });
  });

  describe('Цвета фона по методу транзита', () => {
    it('применяет синий цвет для t1', () => {
      const bid = makeBid({ transit_method: 't1' });
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      expect(listItem).toHaveStyle({ backgroundColor: '#2196f3' });
    });

    it('применяет голубой цвет для re_export', () => {
      const bid = makeBid({ transit_method: 're_export' });
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      expect(listItem).toHaveStyle({ backgroundColor: '#e0f7fa' });
    });

    it('применяет зеленый цвет для without_openning', () => {
      const bid = makeBid({ transit_method: 'without_openning' });
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      expect(listItem).toHaveStyle({ backgroundColor: '#e8f5e9' });
    });

    it('применяет белый цвет по умолчанию', () => {
      const bid = makeBid({ transit_method: null });
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      expect(listItem).toHaveStyle({ backgroundColor: '#ffffff' });
    });

    it('применяет белый цвет для неизвестного метода транзита', () => {
      const bid = makeBid({ transit_method: 'unknown_method' });
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      expect(listItem).toHaveStyle({ backgroundColor: '#ffffff' });
    });
  });

  describe('Модальные окна', () => {
    it('отображает LogistBidModal для роли logistician', () => {
      mockAuthStore.role = 'logistician';
      const bid = makeBid();
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      fireEvent.click(listItem);

      expect(screen.getByTestId('dialogLogistBidModal')).toBeInTheDocument();
    });

    it('отображает OpeningManagerBidModal для роли opening_manager', () => {
      mockAuthStore.role = 'opening_manager';
      const bid = makeBid();
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      fireEvent.click(listItem);

      expect(
        screen.getByTestId('dialogOpeningManagerBidModal')
      ).toBeInTheDocument();
    });

    it('отображает TitleBidModal для роли title', () => {
      mockAuthStore.role = 'title';
      const bid = makeBid();
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      fireEvent.click(listItem);

      expect(screen.getByTestId('dialogTitleBidModal')).toBeInTheDocument();
    });

    it('отображает InspectorBidModal для роли inspector', () => {
      mockAuthStore.role = 'inspector';
      const bid = makeBid();
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      fireEvent.click(listItem);

      expect(screen.getByTestId('dialogInspectorBidModal')).toBeInTheDocument();
    });

    it('отображает ReExportBidModal для других ролей', () => {
      mockAuthStore.role = 're_export';
      const bid = makeBid();
      renderBidListItem(bid);

      const listItem = screen.getByTestId(`bid-item-${bid.id}`);
      fireEvent.click(listItem);

      expect(screen.getByTestId('dialogReExportBidModal')).toBeInTheDocument();
    });
  });
});
