import Box from '@mui/material/Box';
import type { Bid } from '../../../models/BidResponse';
import Typography from '@mui/material/Typography';
import { getTransitMethod } from '../../../utils/getSelectFieldText';
import type { Transporter } from '../../../models/TransporterResponse';

interface RecieverBidInfoProps {
  bid: Bid;
}

const RecieverBidInfo = ({ bid }: RecieverBidInfoProps) => {
  return (
    <Box data-testid='recieverBidInfo' sx={{ width: '100%' }}>
      <Typography variant='subtitle1' fontWeight='bold'>
        {bid.brand} {bid.model}
      </Typography>
      <Typography variant='body2'>VIN: {bid.vin}</Typography>
      <Typography variant='body2'>Клиент: {bid.client.full_name}</Typography>
      <Typography variant='body2'>
        Метод транзита: {getTransitMethod(bid.transit_method!)}
      </Typography>
      <Typography variant='body2'>
        № автовоза:{' '}
        {(bid?.vehicle_transporter as Transporter)?.number || 'Не указан'}
      </Typography>
    </Box>
  );
};

export default RecieverBidInfo;
