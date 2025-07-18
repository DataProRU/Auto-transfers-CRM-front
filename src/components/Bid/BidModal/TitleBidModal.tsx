import { useEffect } from 'react';
import { useNotification } from '../../../providers/Notification';
import bidStore from '../../../store/BidStore';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import { Controller, useForm } from 'react-hook-form';
import type { TitleBidFormData } from '../../../@types/bid';
import { zodResolver } from '@hookform/resolvers/zod';
import { TitleBidFormSchema } from '../../../schemas/bid';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import BidCheckbox from '../BidCheckBox';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ruRU } from '@mui/x-date-pickers/locales';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import moment from 'moment';

interface TitleModalProps {
  open: boolean;
  onClose: () => void;
}

const TitleBidModal = ({ open, onClose }: TitleModalProps) => {
  const { bid, updateTitleBid, bidError, setBidError } = bidStore;
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<TitleBidFormData>({
    resolver: zodResolver(TitleBidFormSchema),
    defaultValues: {
      pickup_address: bid?.pickup_address || '',
      took_title: bid?.took_title || '',
      notified_logistician_by_title:
        bid?.notified_logistician_by_title || false,
    },
  });

  useEffect(() => {
    if (bidError) {
      showNotification(bidError, 'error');
      setBidError(null);
    }
  }, [bidError, showNotification, setBidError]);

  useEffect(() => {
    if (bid) {
      reset({
        pickup_address: bid?.pickup_address || '',
        took_title: bid?.took_title || '',
        notified_logistician_by_title:
          bid?.notified_logistician_by_title || false,
      });
    }
  }, [bid, reset]);

  const onSubmit = async (data: TitleBidFormData) => {
    if (bid) {
      const payload = {
        ...data,
        title_collection_date:
          data.took_title === 'yes' || data.took_title === 'consignment'
            ? moment().format('YYYY-MM-DD')
            : null,
      };
      const isSuccess = await updateTitleBid(bid.id, payload);
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
        open={open}
        onClose={onClose}
        component='form'
        onSubmit={handleSubmit(onSubmit)}
      >
        <DialogTitle>
          Заявка на {bid?.brand} {bid?.model} {bid?.vin}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider
            dateAdapter={AdapterMoment}
            adapterLocale='ru'
            localeText={
              ruRU.components.MuiLocalizationProvider.defaultProps.localeText
            }
          >
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
                      value={bid?.brand}
                    />
                    <TextField
                      label='Модель'
                      id='model'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={bid?.model}
                    />
                    <TextField
                      label='VIN'
                      id='vin'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={bid?.vin}
                    />
                    <TextField
                      label='Комментарий менеджера'
                      id='reason'
                      variant='outlined'
                      disabled
                      multiline
                      maxRows={4}
                      value={bid?.manager_comment || ''}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              <TextField
                id='comment'
                label='Адрес забора'
                multiline
                maxRows={4}
                {...register('pickup_address')}
                error={!!errors.pickup_address}
                helperText={errors.pickup_address?.message}
              />
              <FormControl fullWidth>
                <InputLabel id='took_title'>Забрал тайтл</InputLabel>
                <Select
                  labelId='took_title'
                  id='took_title'
                  label='Забрал тайтл'
                  {...register('took_title')}
                  defaultValue={bid?.took_title || 'no'}
                >
                  <MenuItem value={'no'}>Нет</MenuItem>
                  <MenuItem value={'yes'}>Да</MenuItem>
                  <MenuItem value={'consignment'}>Коносамент</MenuItem>
                </Select>
                {errors.took_title && (
                  <Typography color='error' variant='caption'>
                    {errors.took_title.message}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label='Дата забора тайтла'
                id='title_collection_date'
                variant='outlined'
                fullWidth
                disabled
                value={
                  bid?.title_collection_date
                    ? moment(bid?.title_collection_date).format('DD.MM.YYYY')
                    : 'Не указана'
                }
              />
              <Controller
                name='notified_logistician_by_title'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Уведомил логиста'
                    onChange={field.onChange}
                  />
                )}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type='submit' variant='contained'>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TitleBidModal;
