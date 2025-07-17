import ListItem from '@mui/material/ListItem';
import type { Bid } from '../../../models/BidResponse';
import { useState } from 'react';
import LogistBidModal from '../LogistBidModal';
import bidStore from '../../../store/BidStore';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../../store/AuthStore';
import OpeningManagerBidModal from '../OpeningManagerBidModal';
import LogistBidInfo from './LogistBidInfo';
import OpeningManagerBidInfo from './OpeningManagerBidInfo';

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
  const { role } = authStore;

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
      >
        {role === 'logistician' ? (
          <LogistBidInfo bid={bid} />
        ) : (
          <OpeningManagerBidInfo bid={bid} />
        )}
      </ListItem>
      {role === 'logistician' ? (
        <LogistBidModal open={open} onClose={handleClose} />
      ) : (
        <OpeningManagerBidModal open={open} onClose={handleClose} />
      )}
    </>
  );
});

export default BidListItem;
