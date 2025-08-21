import bidStore from '../BidStore';
import BidService from '../../services/BidService';
import { getAPIErrorMessage } from '../../utils/getAPIErrorMessage';
import type { AxiosResponse } from 'axios';
import type { Bid } from '../../models/BidResponse';
import type { Client } from '../../models/UserResponse';
import type {
  BidFormData,
  InspectorBidFormData,
  OpeningManagerBidFormData,
  ReExportBidFormData,
  RejectBidFormData,
  TitleBidFormData,
} from '../../@types/bid';

jest.mock('../../services/BidService');
jest.mock('../../utils/getAPIErrorMessage');

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

// Strictly typed helper to convert a function to a jest mock

// Factories for domain types to avoid using `any`
const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 1,
  full_name: 'Test Client',
  phone: '+10000000000',
  telegram: '@test',
  company: null,
  address: null,
  email: 'test@example.com',
  ...overrides,
});

const makeBid = (overrides: Partial<Bid> = {}): Bid => ({
  id: 1,
  client: makeClient(),
  brand: 'Brand',
  model: 'Model',
  vin: 'VIN0000000000000',
  price: 0,
  container_number: 'C123',
  arrival_date: '2024-01-01',
  transporter: 'transporter',
  recipient: 'recipient',
  transit_method: null,
  location: null,
  requested_title: false,
  notified_parking: false,
  notified_inspector: false,
  openning_date: null,
  approved_by_inspector: false,
  approved_by_title: false,
  approved_by_re_export: false,
  opened: false,
  manager_comment: null,
  pickup_address: null,
  title_collection_date: null,
  took_title: null,
  notified_logistician_by_title: false,
  notified_logistician_by_inspector: false,
  acceptance_date: null,
  transit_number: null,
  inspection_done: null,
  inspection_date: null,
  number_sent: false,
  number_sent_date: null,
  inspection_paid: false,
  inspector_comment: null,
  export: false,
  prepared_documents: false,
  ...overrides,
});

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

      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const formData = { b: 2 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | InspectorBidFormData;
      const ok = await bidStore.updateBid(1, formData, true);
      expect(ok).toBe(true);

      expect(bidStore.untouchedBids).toEqual([]);
      expect(bidStore.inProgressBids.find((b) => b.id === 1)).toMatchObject({
        brand: 'A',
        b: 2,
      });
    });

    it('обновляет inProgress по id если записи нет в untouched (field=true)', async () => {
      bidStore.setInProgressBids([makeBid({ id: 2, brand: 'B' })]);

      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const formData = { b: 3 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | InspectorBidFormData;
      const ok = await bidStore.updateBid(2, formData, true);
      expect(ok).toBe(true);

      expect(bidStore.inProgressBids.find((b) => b.id === 2)).toMatchObject({
        brand: 'B',
        b: 3,
      });
    });

    it('перемещает заявку из inProgress в untouched при field=false', async () => {
      bidStore.setInProgressBids([makeBid({ id: 3, brand: 'C' })]);

      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const formData = { b: 2 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | InspectorBidFormData;
      const ok = await bidStore.updateBid(3, formData, false);
      expect(ok).toBe(true);

      expect(bidStore.inProgressBids.find((b) => b.id === 3)).toBeUndefined();
      expect(bidStore.untouchedBids.find((b) => b.id === 3)).toMatchObject({
        brand: 'C',
        b: 2,
      });
    });

    it('при ошибке устанавливает bidError и возвращает false', async () => {
      changeBidMock.mockRejectedValue(new Error('fail'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка обновления');

      const formData = { x: 1 } as unknown as
        | BidFormData
        | OpeningManagerBidFormData
        | InspectorBidFormData;
      const ok = await bidStore.updateBid(1, formData, true);
      expect(ok).toBe(false);
      expect(bidStore.bidError).toBe('Ошибка обновления');
    });
  });

  describe('updateTitleBid', () => {
    it('при notified=true и took_title yes/consignment переносит в completed', async () => {
      bidStore.setuntouchedBids([makeBid({ id: 10, brand: 'X' })]);
      bidStore.setInProgressBids([makeBid({ id: 11, brand: 'Y' })]);

      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const data = {
        notified_logistician_by_title: true,
        took_title: 'yes',
        x: 5,
      } as unknown as TitleBidFormData;

      const ok = await bidStore.updateTitleBid(10, data);
      expect(ok).toBe(true);

      expect(bidStore.untouchedBids.find((b) => b.id === 10)).toBeUndefined();
      expect(bidStore.inProgressBids.map((b) => b.id)).toEqual([11]);
      expect(bidStore.сompletedBids.find((b) => b.id === 10)).toMatchObject({
        brand: 'X',
      });
    });

    it('при notified=true и took_title другое — переносит в inProgress/обновляет', async () => {
      bidStore.setuntouchedBids([makeBid({ id: 12, brand: 'Z' })]);

      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const data = {
        notified_logistician_by_title: true,
        took_title: 'no',
        y: 9,
      } as unknown as TitleBidFormData;

      const ok = await bidStore.updateTitleBid(12, data);
      expect(ok).toBe(true);

      expect(bidStore.untouchedBids.find((b) => b.id === 12)).toBeUndefined();
      expect(bidStore.inProgressBids.find((b) => b.id === 12)).toBeDefined();
    });

    it('при notified=false переносит из inProgress в untouched', async () => {
      bidStore.setInProgressBids([makeBid({ id: 13, brand: 'Q' })]);

      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const ok = await bidStore.updateTitleBid(13, {
        notified_logistician_by_title: false,
      } as unknown as TitleBidFormData);
      expect(ok).toBe(true);

      expect(bidStore.inProgressBids.find((b) => b.id === 13)).toBeUndefined();
      expect(bidStore.untouchedBids.find((b) => b.id === 13)).toBeDefined();
    });

    it('при ошибке — bidError и false', async () => {
      changeBidMock.mockRejectedValue(new Error('fail'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка тайтла');

      const ok = await bidStore.updateTitleBid(
        1,
        {} as unknown as TitleBidFormData
      );
      expect(ok).toBe(false);
      expect(bidStore.bidError).toBe('Ошибка тайтла');
    });
  });

  describe('updateReExportBid', () => {
    it('prepared_documents=true и export=true — переносит в completed', async () => {
      bidStore.setuntouchedBids([makeBid({ id: 20, brand: 'R' })]);
      bidStore.setInProgressBids([makeBid({ id: 21, brand: 'S' })]);

      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const data = {
        prepared_documents: true,
        export: true,
        z: 7,
      } as unknown as ReExportBidFormData;
      const ok = await bidStore.updateReExportBid(20, data);

      expect(ok).toBe(true);
      expect(bidStore.untouchedBids.find((b) => b.id === 20)).toBeUndefined();
      expect(bidStore.inProgressBids.map((b) => b.id)).toEqual([21]);
      expect(bidStore.сompletedBids.find((b) => b.id === 20)).toBeDefined();
    });

    it('prepared_documents=true и export=false — переносит в inProgress/обновляет', async () => {
      bidStore.setuntouchedBids([makeBid({ id: 22, brand: 'T' })]);
      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const data = {
        prepared_documents: true,
        export: false,
        k: 3,
      } as unknown as ReExportBidFormData;
      const ok = await bidStore.updateReExportBid(22, data);

      expect(ok).toBe(true);
      expect(bidStore.untouchedBids.find((b) => b.id === 22)).toBeUndefined();
      expect(bidStore.inProgressBids.find((b) => b.id === 22)).toBeDefined();
    });

    it('prepared_documents=false — переносит из inProgress в untouched', async () => {
      bidStore.setInProgressBids([makeBid({ id: 23, brand: 'U' })]);
      changeBidMock.mockResolvedValue({} as AxiosResponse<unknown>);

      const ok = await bidStore.updateReExportBid(23, {
        prepared_documents: false,
      } as unknown as ReExportBidFormData);

      expect(ok).toBe(true);
      expect(bidStore.inProgressBids.find((b) => b.id === 23)).toBeUndefined();
      expect(bidStore.untouchedBids.find((b) => b.id === 23)).toBeDefined();
    });

    it('при ошибке — bidError и false', async () => {
      changeBidMock.mockRejectedValue(new Error('fail'));
      getAPIErrorMessageMock.mockReturnValue('Ошибка реэкспорта');

      const ok = await bidStore.updateReExportBid(
        1,
        {} as unknown as ReExportBidFormData
      );
      expect(ok).toBe(false);
      expect(bidStore.bidError).toBe('Ошибка реэкспорта');
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
