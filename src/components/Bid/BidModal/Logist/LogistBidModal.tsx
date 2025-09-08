import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import bidStore from '../../../../store/BidStore';
import moment from 'moment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import BidCheckbox from '../../BidCheckBox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { BidFormData } from '../../../../@types/bid';
import { zodResolver } from '@hookform/resolvers/zod';
import { bidFormSchema } from '../../../../schemas/bid';
import { useNotification } from '../../../../providers/Notification';
import RejectBidModal from '../RejectBidModal';

interface LogistBidModalProps {
  open: boolean;
  onClose: () => void;
}

const LogistBidModal = ({ open, onClose }: LogistBidModalProps) => {
  const { bid, updateBid, bidError, setBidError } = bidStore;
  const { showNotification } = useNotification();
  const [rejectOpen, setRejectOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    resetField,
    reset,
  } = useForm<BidFormData>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      transit_method: bid?.transit_method || '',
      acceptance_type: bid?.acceptance_type || '',
      location: bid?.location || '',
      requested_title: bid?.requested_title || false,
      notified_parking: bid?.notified_parking || false,
      notified_inspector: bid?.notified_inspector || false,
    },
  });

  const transitMethod = useWatch({
    control,
    name: 'transit_method',
  });

  const isReExport = transitMethod === 're_export';
  const isWithoutOpening = transitMethod === 'without_openning';

  useEffect(() => {
    if (bidError) {
      showNotification(bidError, 'error');
      setBidError(null);
    }
  }, [bidError, showNotification, setBidError]);

  useEffect(() => {
    if (!isReExport) {
      resetField('notified_parking', { defaultValue: false });
      resetField('notified_inspector', { defaultValue: false });
    }
    if (!isWithoutOpening) {
      resetField('acceptance_type', { defaultValue: '' });
    }
  }, [isReExport, isWithoutOpening, resetField]);

  useEffect(() => {
    if (bid) {
      reset({
        transit_method: bid.transit_method || '',
        acceptance_type: bid.acceptance_type || '',
        location: bid.location || '',
        requested_title: bid.requested_title || false,
        notified_parking: bid.notified_parking || false,
        notified_inspector: bid.notified_inspector || false,
      });
    }
  }, [bid, reset]);

  const onSubmit = async (data: BidFormData) => {
    if (bid) {
      const inProgressCondition = !!data.transit_method;
      const isSuccess = await updateBid(bid.id, data, inProgressCondition);
      if (isSuccess) {
        showNotification('Данные успешно изменены!', 'success');
        onClose();
      } else {
        showNotification(bidError || 'Не удалось изменить данные', 'error');
      }
    }
  };

  return (
    <>
      <Dialog
        data-testid='dialogLogistBidModal'
        open={open}
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        component='form'
      >
        <DialogTitle>
          Заявка на {bid?.brand} {bid?.model} {bid?.vin}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              mb: 2,
            }}
          >
            Для изменения данных заявки заполните активные поля ниже
          </DialogContentText>
          <Stack spacing={2}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1-content'
                id='panel1-header'
              >
                <Typography component='span'>Информация о заявке</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    label='Марка'
                    id='brand'
                    variant='outlined'
                    fullWidth
                    disabled
                    value={bid?.brand || ''}
                  />
                  <TextField
                    label='Модель'
                    id='model'
                    variant='outlined'
                    fullWidth
                    disabled
                    value={bid?.model || ''}
                  />
                  <TextField
                    label='VIN'
                    id='vin'
                    variant='outlined'
                    fullWidth
                    disabled
                    value={bid?.vin || ''}
                  />
                  <TextField
                    label='Клиент'
                    id='client'
                    variant='outlined'
                    fullWidth
                    disabled
                    value={bid?.client.full_name || ''}
                  />
                  <TextField
                    label='Номер контейнера'
                    id='container_number'
                    variant='outlined'
                    disabled
                    value={bid?.container_number || ''}
                  />
                  <TextField
                    label='Предпологаемая дата прибытия контейнера'
                    id='arrival_date'
                    variant='outlined'
                    disabled
                    value={
                      bid?.arrival_date
                        ? moment(bid?.arrival_date).format('DD.MM.YYYY')
                        : ''
                    }
                  />
                  <TextField
                    label='Предпологаемая дата открытия контейнера'
                    id='openning_date'
                    variant='outlined'
                    disabled
                    value={
                      bid?.openning_date
                        ? moment(bid?.openning_date).format('DD.MM.YYYY')
                        : ''
                    }
                  />
                  <TextField
                    label='Получатель'
                    id='recipient'
                    variant='outlined'
                    disabled
                    value={bid?.recipient || ''}
                  />
                  <TextField
                    label='Перевозчик'
                    id='transporter'
                    variant='outlined'
                    disabled
                    value={bid?.transporter || ''}
                  />
                  <BidCheckbox
                    checked={bid?.approved_by_inspector || false}
                    label='Осмотр'
                    disabled
                  />
                  <BidCheckbox
                    checked={bid?.approved_by_title || false}
                    label='Тайтл'
                    disabled
                  />
                  <BidCheckbox
                    checked={bid?.approved_by_re_export || false}
                    label='Реэкспорт'
                    disabled
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Controller
              name='transit_method'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id='transit_method'>Метод транзита</InputLabel>
                  <Select
                    labelId='transit_method'
                    id='transit_method'
                    label='Метод транзита'
                    value={field.value || ''}
                    onChange={field.onChange}
                  >
                    <MenuItem value={''}>Не выбрано</MenuItem>
                    <MenuItem value={'t1'}>Т1</MenuItem>
                    <MenuItem value={'re_export'}>Реэкспорт</MenuItem>
                    <MenuItem value={'without_openning'}>Без открытия</MenuItem>
                  </Select>
                  {errors.transit_method && (
                    <Typography color='error' variant='caption'>
                      {errors.transit_method.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name='acceptance_type'
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  sx={{
                    display: isWithoutOpening ? 'flex' : 'none',
                  }}
                >
                  <InputLabel id='acceptance_type'>Тип принятия</InputLabel>
                  <Select
                    labelId='acceptance_type'
                    id='acceptance_type'
                    label='Тип принятия'
                    value={field.value || ''}
                    onChange={field.onChange}
                  >
                    <MenuItem value={''}>Не выбрано</MenuItem>
                    <MenuItem value={'with_re_export'}>С реэспортом</MenuItem>
                    <MenuItem value={'without_re_export'}>
                      Без реэспорта
                    </MenuItem>
                  </Select>
                  {errors.acceptance_type && (
                    <Typography color='error' variant='caption'>
                      {errors.acceptance_type.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            <TextField
              label='Местонахождение'
              id='location'
              variant='outlined'
              {...register('location')}
              error={!!errors.location}
              helperText={errors.location?.message}
            />

            <Controller
              name='requested_title'
              control={control}
              render={({ field }) => (
                <>
                  <BidCheckbox
                    checked={field.value || false}
                    label='Запросил тайтл'
                    onChange={field.onChange}
                  />
                  {errors.requested_title && (
                    <Typography color='error' variant='caption'>
                      {errors.requested_title.message}
                    </Typography>
                  )}
                </>
              )}
            />

            <Controller
              name='notified_parking'
              control={control}
              render={({ field }) => (
                <BidCheckbox
                  checked={field.value || false}
                  label='Уведомил стоянку (Без открытия)'
                  onChange={field.onChange}
                  visible={isReExport}
                />
              )}
            />

            <Controller
              name='notified_inspector'
              control={control}
              render={({ field }) => (
                <BidCheckbox
                  checked={field.value || false}
                  label='Уведомил осмотр (Без открытия)'
                  onChange={field.onChange}
                  visible={isReExport}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectOpen(true)}
            color='error'
            disabled={bid?.transit_method !== null}
          >
            Отказать
          </Button>
          <Button onClick={onClose}>Отмена</Button>
          <Button type='submit' variant='contained'>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      <RejectBidModal
        data-testid='dialogRejectBidModal'
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
      />
    </>
  );
};

export default LogistBidModal;
