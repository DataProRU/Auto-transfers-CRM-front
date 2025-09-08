import Box from '@mui/material/Box';
import type { Bid } from '../../../models/BidResponse';
import Typography from '@mui/material/Typography';
import { getTransitMethod } from '../../../utils/getSelectFieldText';

interface TitleBidInfoProps {
  bid: Bid;
}

const TitleBidInfo = ({ bid }: TitleBidInfoProps) => {
  return (
    <Box data-testid='titleBidInfo' sx={{ width: '100%' }}>
      <Typography variant='subtitle1' fontWeight='bold'>
        {bid.brand} {bid.model}
      </Typography>
      <Typography variant='body2'>VIN: {bid.vin}</Typography>
      <Typography variant='body2'>Клиент: {bid.client.full_name}</Typography>
      <Typography variant='body2'>
        Метод транзита: {getTransitMethod(bid.transit_method!)}
      </Typography>
      {bid.pickup_address ? (
        <Typography variant='body2'>
          Адрес забора: {bid.pickup_address}
        </Typography>
      ) : (
        <Typography variant='body2'>Адрес забора: Не указан</Typography>
      )}
    </Box>
  );
};

export default TitleBidInfo;
