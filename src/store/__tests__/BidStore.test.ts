import bidStore from '../BidStore';
import BidService from '@/services/BidService';
import { getAPIErrorMessage } from '@/utils/getAPIErrorMessage';
import type { AxiosResponse } from 'axios';
import type { Bid } from '@/models/BidResponse';
import { makeBid } from '@/utils/test/factories.ts';
import type {
  BidFormData,
  InspectorBidFormData,
  LogistBidLoadingFormData,
  OpeningManagerBidFormData,
  RejectBidFormData,
  TitleBidFormData,
  ReExportBidFormData,
  RecieverBidFormData,
} from '@/@types/bid';

jest.mock('@/services/BidService');
jest.mock('@/utils/getAPIErrorMessage');

const getBidsMock = BidService.getBids as jest.MockedFunction<
  typeof BidService.getBids
>;
const changeBidMock = BidService.changeBid as jest.MockedFunction<
  typeof BidService.changeBid
>;
const rejectBidMock = BidService.rejectBid as jest.MockedFunction<
  typeof BidService.rejectBid
>;
const getAPIErrorMessageMock = getAPIErrorMessage as jest.MockedFunction<
  typeof getAPIErrorMessage
>;

describe('BidStore', () => {
  const resetStore = () => {
    bidStore.setBid(null);
    bidStore.setIsBidLoaging(false);
    bidStore.setBidError(null);
    bidStore.setuntouchedBids([]);
    bidStore.setInProgressBids([]);
    bidStore.setCompletedBids([]);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  describe('setters', () => {
    it('устанавливает значения сеттерами', () => {
      const bid = makeBid({ id: 1 });
      bidStore.setBid(bid);
      expect(bidStore.bid).toEqual(bid);

      bidStore.setIsBidLoaging(true);
      expect(bidStore.isBidLoading).toBe(true);

      bidStore.setBidError('err');
      expect(bidStore.bidError).toBe('err');

      bidStore.setuntouchedBids([makeBid({ id: 1 })]);
      expect(bidStore.untouchedBids.map((b) => b.id)).toEqual([1]);

      bidStore.setInProgressBids([makeBid({ id: 2 })]);
      expect(bidStore.inProgressBids.map((b) => b.id)).toEqual([2]);

      bidStore.setCompletedBids([makeBid({ id: 3 })]);
      expect(bidStore.сompletedBids.map((b) => b.id)).toEqual([3]);
    });
  });

  describe('fetchBids', () => {
    it('заполняет списки и переключает загрузку', async () => {
      getBidsMock.mockResolvedValue({
        data: {
          untouched: [makeBid({ id: 1 })],
          in_progress: [makeBid({ id: 2 })],
          completed: [makeBid({ id: 3 })],
        },
      } as AxiosResponse<{
        untouched: Bid[];
        in_progress: Bid[];
        completed?: Bid[];
      }>);

      const promise = bidStore.fetchBids();
      expect(bidStore.isBidLoading).toBe(true);
      await promise;

      expect(bidStore.untouchedBids.map((b) => b.id)).toEqual([1]);
      expect(bidStore.inProgressBids.map((b) => b.id)).toEqual([2]);
      expect(bidStore.сompletedBids.map((b) => b.id)).toEqual([3]);
      expect(bidStore.isBidLoading).toBe(false);
    });

    it('при ошибке устанавливает bidError, чистит inProgress и выключает загрузку', async () => {
      getBidsMock.mockRejectedValue(new Error('fail'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка загрузки');

      await bidStore.fetchBids();

      expect(getAPIErrorMessage).toHaveBeenCalled();
      expect(bidStore.bidError).toBe('Ошибка загрузки');
      expect(bidStore.inProgressBids).toEqual([]);
      expect(bidStore.isBidLoading).toBe(false);
    });

    it('не трогает completed если его нет в ответе', async () => {
      bidStore.setCompletedBids([makeBid({ id: 99 })]);

      getBidsMock.mockResolvedValue({
        data: {
          untouched: [makeBid({ id: 1 })],
          in_progress: [makeBid({ id: 2 })],
          // completed отсутствует
        },
      } as AxiosResponse<{
        untouched: Bid[];
        in_progress: Bid[];
        completed?: Bid[];
      }>);

      await bidStore.fetchBids();
      expect(bidStore.сompletedBids.map((b) => b.id)).toEqual([99]);
    });
  });

  describe('updateBid', () => {
    it('перемещает заявку из untouched в inProgress (field=true) и мержит данные', async () => {
      bidStore.setuntouchedBids([makeBid({ id: 1, brand: 'A' })]);

      changeBidMock.mockResolvedValue({
        data: { vehicle_transporter: 1 },
      } as AxiosResponse<{ vehicle_transporter: number }>);

      const formData = { b: 2 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | TitleBidFormData
        | InspectorBidFormData
        | LogistBidLoadingFormData;
      const ok = await bidStore.updateBid(1, formData, true);
      expect(ok).toBe(true);

      expect(bidStore.untouchedBids).toEqual([]);
      expect(bidStore.inProgressBids.find((b) => b.id === 1)).toMatchObject({
        brand: 'A',
        b: 2,
      });
    });

    it('обновляет inProgress по id если записи нет в untouched (inProgressCondition=true)', async () => {
      bidStore.setInProgressBids([makeBid({ id: 2, brand: 'B' })]);

      changeBidMock.mockResolvedValue({
        data: { vehicle_transporter: 1 },
      } as AxiosResponse<{ vehicle_transporter: number }>);

      const formData = { b: 3 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | TitleBidFormData
        | InspectorBidFormData
        | LogistBidLoadingFormData;
      const ok = await bidStore.updateBid(2, formData, true);
      expect(ok).toBe(true);

      expect(bidStore.inProgressBids.find((b) => b.id === 2)).toMatchObject({
        brand: 'B',
        b: 3,
      });
    });

    it('перемещает заявку из inProgress в untouched при inProgressCondition=false', async () => {
      bidStore.setInProgressBids([makeBid({ id: 3, brand: 'C' })]);

      changeBidMock.mockResolvedValue({
        data: { vehicle_transporter: 1 },
      } as AxiosResponse<{ vehicle_transporter: number }>);

      const formData = { b: 2 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | TitleBidFormData
        | InspectorBidFormData
        | LogistBidLoadingFormData;
      const ok = await bidStore.updateBid(3, formData, false);
      expect(ok).toBe(true);

      expect(bidStore.inProgressBids.find((b) => b.id === 3)).toBeUndefined();
      expect(bidStore.untouchedBids.find((b) => b.id === 3)).toMatchObject({
        brand: 'C',
        b: 2,
      });
    });

    it('обновляет заявку в untouched при inProgressCondition=false если заявка не найдена в inProgress', async () => {
      bidStore.setuntouchedBids([makeBid({ id: 4, brand: 'BMW' })]);

      changeBidMock.mockResolvedValue({
        data: { vehicle_transporter: 2 },
      } as AxiosResponse<{ vehicle_transporter: number }>);

      const formData = { c: 5 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | TitleBidFormData
        | InspectorBidFormData
        | LogistBidLoadingFormData;
      const ok = await bidStore.updateBid(4, formData, false);
      expect(ok).toBe(true);

      expect(bidStore.untouchedBids.find((b) => b.id === 4)).toMatchObject({
        brand: 'BMW',
        vehicle_transporter: 2,
      });

      expect(bidStore.inProgressBids.find((b) => b.id === 4)).toBeUndefined();
    });

    it('при ошибке устанавливает bidError и возвращает false', async () => {
      changeBidMock.mockRejectedValue(new Error('fail'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка обновления');

      const formData = { x: 1 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | TitleBidFormData
        | InspectorBidFormData
        | LogistBidLoadingFormData;
      const ok = await bidStore.updateBid(1, formData, true);
      expect(ok).toBe(false);
      expect(bidStore.bidError).toBe('Ошибка обновления');
    });
  });

  describe('updateExpandedBid', () => {
    it('перемещает заявку из untouched в completed при inProgressCondition=true и completedCondition=true', async () => {
      const bid = makeBid({ id: 1, brand: 'BMW' });
      bidStore.setuntouchedBids([bid]);

      changeBidMock.mockResolvedValue({} as AxiosResponse);

      const formData = { export: true } as unknown as
        | ReExportBidFormData
        | RecieverBidFormData;
      const ok = await bidStore.updateExpandedBid(1, formData, true, true);

      expect(ok).toBe(true);
      expect(bidStore.untouchedBids).toHaveLength(0);
      expect(bidStore.inProgressBids).toHaveLength(0);
      expect(bidStore.сompletedBids).toHaveLength(1);
      expect(bidStore.сompletedBids[0]).toMatchObject({
        id: 1,
        brand: 'BMW',
        export: true,
      });
    });
    it('перемещает заявку из inProgress в completed при inProgressCondition=true и completedCondition=true', async () => {
      const bid = makeBid({ id: 2, brand: 'Audi' });
      bidStore.setInProgressBids([bid]);

      changeBidMock.mockResolvedValue({} as AxiosResponse);

      const formData = { receive_vehicle: true } as unknown as
        | ReExportBidFormData
        | RecieverBidFormData;
      const ok = await bidStore.updateExpandedBid(2, formData, true, true);

      expect(ok).toBe(true);
      expect(bidStore.untouchedBids).toHaveLength(0);
      expect(bidStore.inProgressBids).toHaveLength(0);
      expect(bidStore.сompletedBids).toHaveLength(1);
      expect(bidStore.сompletedBids[0]).toMatchObject({
        id: 2,
        brand: 'Audi',
        receive_vehicle: true,
      });
    });

    it('обновляет заявку в completed если она уже там при inProgressCondition=true и completedCondition=true', async () => {
      const bid = makeBid({ id: 3, brand: 'Toyota' });
      bidStore.setCompletedBids([bid]);

      changeBidMock.mockResolvedValue({} as AxiosResponse);

      const formData = { prepared_documents: true } as unknown as
        | ReExportBidFormData
        | RecieverBidFormData;
      const ok = await bidStore.updateExpandedBid(3, formData, true, true);

      expect(ok).toBe(true);
      expect(bidStore.сompletedBids).toHaveLength(1);
      expect(bidStore.сompletedBids[0]).toMatchObject({
        id: 3,
        brand: 'Toyota',
        prepared_documents: true,
      });
    });
    it('перемещает заявку из untouched в inProgress при inProgressCondition=true и completedCondition=false', async () => {
      const bid = makeBid({ id: 4, brand: 'Honda' });
      bidStore.setuntouchedBids([bid]);

      changeBidMock.mockResolvedValue({} as AxiosResponse);

      const formData = { vehicle_arrival_date: '2024-02-20' } as unknown as
        | ReExportBidFormData
        | RecieverBidFormData;
      const ok = await bidStore.updateExpandedBid(4, formData, true, false);

      expect(ok).toBe(true);
      expect(bidStore.untouchedBids).toHaveLength(0);
      expect(bidStore.inProgressBids).toHaveLength(1);
      expect(bidStore.сompletedBids).toHaveLength(0);
      expect(bidStore.inProgressBids[0]).toMatchObject({
        id: 4,
        brand: 'Honda',
        vehicle_arrival_date: '2024-02-20',
      });
    });

    it('обновляет заявку в inProgress если она уже там при inProgressCondition=true и completedCondition=false', async () => {
      const bid = makeBid({ id: 5, brand: 'Nissan' });
      bidStore.setInProgressBids([bid]);

      changeBidMock.mockResolvedValue({} as AxiosResponse);

      const formData = { receive_documents: true } as unknown as
        | ReExportBidFormData
        | RecieverBidFormData;
      const ok = await bidStore.updateExpandedBid(5, formData, true, false);

      expect(ok).toBe(true);
      expect(bidStore.inProgressBids).toHaveLength(1);
      expect(bidStore.inProgressBids[0]).toMatchObject({
        id: 5,
        brand: 'Nissan',
        receive_documents: true,
      });
    });

    it('перемещает заявку из inProgress в untouched при inProgressCondition=false', async () => {
      const bid = makeBid({ id: 6, brand: 'Mazda' });
      bidStore.setInProgressBids([bid]);

      changeBidMock.mockResolvedValue({} as AxiosResponse);

      const formData = { receiver_keys_number: 3 } as unknown as
        | ReExportBidFormData
        | RecieverBidFormData;
      const ok = await bidStore.updateExpandedBid(6, formData, false, false);

      expect(ok).toBe(true);
      expect(bidStore.untouchedBids).toHaveLength(1);
      expect(bidStore.inProgressBids).toHaveLength(0);
      expect(bidStore.сompletedBids).toHaveLength(0);
      expect(bidStore.untouchedBids[0]).toMatchObject({
        id: 6,
        brand: 'Mazda',
        receiver_keys_number: 3,
      });
    });

    it('при ошибке устанавливает bidError и возвращает false', async () => {
      changeBidMock.mockRejectedValue(new Error('Ошибка сервера'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка обновления');

      const formData = { export: true } as unknown as
        | ReExportBidFormData
        | RecieverBidFormData;
      const ok = await bidStore.updateExpandedBid(1, formData, true, true);

      expect(ok).toBe(false);
      expect(bidStore.bidError).toBe('Ошибка обновления');
    });
  });

  describe('rejectBid', () => {
    it('если transit_method !== null — удаляет из inProgress', async () => {
      bidStore.setInProgressBids([makeBid({ id: 30 }), makeBid({ id: 31 })]);
      bidStore.setuntouchedBids([makeBid({ id: 40 })]);

      rejectBidMock.mockResolvedValue({
        data: { transit_method: 'truck' },
      } as AxiosResponse<{ transit_method: string | null }>);

      const ok = await bidStore.rejectBid(
        31,
        {} as unknown as RejectBidFormData
      );
      expect(ok).toBe(true);

      expect(bidStore.inProgressBids.map((b) => b.id)).toEqual([30]);
      expect(bidStore.untouchedBids.map((b) => b.id)).toEqual([40]);
    });

    it('если transit_method === null — удаляет из untouched', async () => {
      bidStore.setInProgressBids([makeBid({ id: 50 })]);
      bidStore.setuntouchedBids([makeBid({ id: 60 }), makeBid({ id: 61 })]);

      rejectBidMock.mockResolvedValue({
        data: { transit_method: null },
      } as AxiosResponse<{ transit_method: string | null }>);

      const ok = await bidStore.rejectBid(
        60,
        {} as unknown as RejectBidFormData
      );
      expect(ok).toBe(true);

      expect(bidStore.untouchedBids.map((b) => b.id)).toEqual([61]);
      expect(bidStore.inProgressBids.map((b) => b.id)).toEqual([50]);
    });

    it('при ошибке — bidError и false', async () => {
      rejectBidMock.mockRejectedValue(new Error('fail'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка отклонения');

      const ok = await bidStore.rejectBid(
        1,
        {} as unknown as RejectBidFormData
      );
      expect(ok).toBe(false);
      expect(bidStore.bidError).toBe('Ошибка отклонения');
    });
  });
});
