import Box from '@mui/material/Box';
import type { Bid } from '../../../models/BidResponse';
import Typography from '@mui/material/Typography';
import { getTransitMethod } from '../../../utils/getSelectFieldText';

interface ReExportBidInfoProps {
  bid: Bid;
}

const ReExportBidInfo = ({ bid }: ReExportBidInfoProps) => {
  return (
    <Box data-testid='reExportBidInfo' sx={{ width: '100%' }}>
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
        <Typography variant='body2'>Адрес забора: Не указано</Typography>
      )}
    </Box>
  );
};

export default ReExportBidInfo;
