import Box from '@mui/material/Box';
import type { Bid } from '../../../models/BidResponse';
import Typography from '@mui/material/Typography';
import { getTransitMethod } from '../../../utils/getTransitMethod';

interface InspectorBidInfoProps {
  bid: Bid;
}

const InspectorBidInfo = ({ bid }: InspectorBidInfoProps) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant='subtitle1' fontWeight='bold'>
        {bid.brand} {bid.model}
      </Typography>
      <Typography variant='body2'>VIN: {bid.vin}</Typography>
      <Typography variant='body2'>Клиент: {bid.client.full_name}</Typography>
      <Typography variant='body2'>
        Метод транзита: {getTransitMethod(bid.transit_method!)}
      </Typography>
      {bid.location ? (
        <Typography variant='body2'>Местонахождение: {bid.location}</Typography>
      ) : (
        <Typography variant='body2'>Местонахождение: Не указано</Typography>
      )}
    </Box>
  );
};

export default InspectorBidInfo;
