import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getTransitMethod } from '../../../utils/getSelectFieldText';
import moment from 'moment';
import type { Bid } from '../../../models/BidResponse';

interface OpeningManagerBidInfoProps {
  bid: Bid;
}

const OpeningManagerBidInfo = ({ bid }: OpeningManagerBidInfoProps) => {
  return (
    <Box data-testid='openingManagerBidInfo' sx={{ width: '100%' }}>
      <Typography variant='subtitle1' fontWeight='bold'>
        {bid.brand} {bid.model}
      </Typography>
      <Typography variant='body2'>VIN: {bid.vin}</Typography>
      <Typography variant='body2'>Клиент: {bid.client.full_name}</Typography>
      <Typography variant='body2'>
        Метод транзита: {getTransitMethod(bid.transit_method!)}
      </Typography>
      {bid.arrival_date ? (
        <Typography variant='body2'>
          Предпологаемая дата прибытия контейнера:{' '}
          {moment(bid.arrival_date).format('DD.MM.YYYY')}
        </Typography>
      ) : (
        <Typography variant='body2'>
          Предпологаемая дата прибытия: Не указана
        </Typography>
      )}
    </Box>
  );
};

export default OpeningManagerBidInfo;
