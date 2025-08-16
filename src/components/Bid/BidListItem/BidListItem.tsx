import ListItem from '@mui/material/ListItem';
import type { Bid } from '../../../models/BidResponse';
import { useState } from 'react';
import LogistBidModal from '../BidModal/LogistBidModal';
import bidStore from '../../../store/BidStore';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../../store/AuthStore';
import OpeningManagerBidModal from '../BidModal/OpeningManagerBidModal';
import LogistBidInfo from './LogistBidInfo';
import OpeningManagerBidInfo from './OpeningManagerBidInfo';
import TitleBidInfo from './TitleBidInfo';
import TitleBidModal from '../BidModal/TitleBidModal';
import InspectorBidInfo from './InspectorBidInfo';
import InspectorBidModal from '../BidModal/InspectorBidModal';
import ReExportBidInfo from './ReExportBidInfo';
import ReExportBidModal from '../BidModal/ReExportBidModal';

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
        ) : role === 'opening_manager' ? (
          <OpeningManagerBidInfo bid={bid} />
        ) : role === 'title' ? (
          <TitleBidInfo bid={bid} />
        ) : role === 'inspector' ? (
          <InspectorBidInfo bid={bid} />
        ) : (
          <ReExportBidInfo bid={bid} />
        )}
      </ListItem>
      {role === 'logistician' ? (
        <LogistBidModal open={open} onClose={handleClose} />
      ) : role === 'opening_manager' ? (
        <OpeningManagerBidModal open={open} onClose={handleClose} />
      ) : role === 'title' ? (
        <TitleBidModal open={open} onClose={handleClose} />
      ) : role === 'inspector' ? (
        <InspectorBidModal open={open} onClose={handleClose} />
      ) : (
        <ReExportBidModal open={open} onClose={handleClose} />
      )}
    </>
  );
});

export default BidListItem;
