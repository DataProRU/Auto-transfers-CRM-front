import type { RejectBidFormData } from '../../../@types/bid';
import { rejectBidFormSchema } from '../../../schemas/bid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import bidStore from '../../../store/BidStore';
import { useNotification } from '../../../providers/Notification';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

interface RejectBidModalProps {
  open: boolean;
  onClose: () => void;
}

const RejectBidModal = observer(({ open, onClose }: RejectBidModalProps) => {
  const { bid, rejectBid, bidError, setBidError } = bidStore;
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectBidFormData>({
    resolver: zodResolver(rejectBidFormSchema),
  });

  useEffect(() => {
    if (bidError) {
      showNotification(bidError, 'error');
      setBidError(null);
    }
  }, [bidError, showNotification, setBidError]);

  const onSubmit = async (data: RejectBidFormData) => {
    if (bid) {
      const isSuccess = await rejectBid(bid.id, data);
      if (isSuccess) {
        showNotification('Заявка успешно отказана!', 'success');
        onClose();
      } else {
        showNotification(bidError || 'Не удалось отказать в заявке', 'error');
      }
    }
  };

  return (
    <Dialog
      data-testid='dialogRejectBidModal'
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      component='form'
    >
      <DialogTitle>Отказ в заявке</DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            mb: 2,
          }}
        >
          Для отказа в заявке, напишите причину отказа в форме ниже
        </DialogContentText>
        <Stack spacing={2}>
          <TextField
            id='reason'
            label='Причина отказа'
            multiline
            maxRows={4}
            {...register('logistician_comment')}
            error={!!errors.logistician_comment}
            helperText={errors.logistician_comment?.message}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button type='submit' variant='contained'>
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default RejectBidModal;
