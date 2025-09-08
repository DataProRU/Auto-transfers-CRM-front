import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getTransitMethod } from '../../../utils/getSelectFieldText';
import type { Bid } from '../../../models/BidResponse';
import moment from 'moment';

interface LogistBidInfoProps {
  bid: Bid;
}

const LogistBidInfo = ({ bid }: LogistBidInfoProps) => {
  return (
    <Box data-testid='logistBidInfo' sx={{ width: '100%' }}>
      <Typography variant='subtitle1' fontWeight='bold'>
        {bid.brand} {bid.model}
      </Typography>
      <Typography variant='body2'>VIN: {bid.vin}</Typography>
      <Typography variant='body2'>Клиент: {bid.client.full_name}</Typography>
      <Typography variant='body2'>
        Метод транзита: {getTransitMethod(bid.transit_method!)}
      </Typography>
      {bid.openning_date ? (
        <Typography variant='body2'>
          Дата открытия контейнера:{' '}
          {moment(bid.openning_date).format('DD.MM.YYYY')}
        </Typography>
      ) : (
        <Typography variant='body2'>
          Дата открытия контейнера: Не указана
        </Typography>
      )}
    </Box>
  );
};

export default LogistBidInfo;
