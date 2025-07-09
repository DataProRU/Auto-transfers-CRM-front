import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import type { Bid } from '../../models/BidResponse';
import { useState } from 'react';
import LogistBidModal from './LogistBidModal';
import bidStore from '../../store/BidStore';
import { observer } from 'mobx-react-lite';

interface BidListItemProps {
  bid: Bid;
}

const transitMethodColors = {
  t1: '#2196f3',
  re_export: '#e0f7fa',
  without_openning: '#e8f5e9',
  default: '#ffffff',
};

const BidListItem = observer(({ bid }: BidListItemProps) => {
  const [open, setOpen] = useState(false);
  const { setBid } = bidStore;

  const handleOpen = () => {
    setOpen(true);
    setBid(bid);
  };
  const handleClose = () => {
    setOpen(false);
    setBid(null);
  };

  const getBackgroundColor = () => {
    if (!bid.transit_method) return transitMethodColors.default;
    return (
      transitMethodColors[
        bid.transit_method as keyof typeof transitMethodColors
      ] || transitMethodColors.default
    );
  };

  const getTransitMethod = (method: string) => {
    switch (method) {
      case 't1':
        return 'T1';
      case 're_export':
        return 'Реэкспорт';
      case 'without_openning':
        return 'Без открытия';
      default:
        return 'Не указан';
    }
  };

  return (
    <>
      <ListItem
        sx={{
          py: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: getBackgroundColor(),
          '&:hover': {
            backgroundColor: (theme) => theme.palette.action.hover,
            transform: 'scale(1.01)',
          },
        }}
        onClick={handleOpen}
        onMouseEnter={() => {
          /* Можно добавить дополнительную логику при наведении */
        }}
        onMouseLeave={() => {
          /* Можно добавить дополнительную логику при уходе курсора */
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant='subtitle1' fontWeight='bold'>
            {bid.brand} {bid.model}
          </Typography>
          <Typography variant='body2'>VIN: {bid.vin}</Typography>
          <Typography variant='body2'>
            Клиент: {bid.client.full_name}
          </Typography>
          <Typography variant='body2'>
            Метод транзита: {getTransitMethod(bid.transit_method!)}
          </Typography>
          {bid.openning_date && (
            <Typography variant='body2'>
              Дата открытия контейнера:{' '}
              {new Date(bid.openning_date).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </ListItem>
      <LogistBidModal open={open} onClose={handleClose} />
    </>
  );
});

export default BidListItem;
