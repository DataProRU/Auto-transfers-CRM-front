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
import type { InspectorBidFormData } from '../../../@types/bid';
import { zodResolver } from '@hookform/resolvers/zod';
import { InspectorBidFormSchema } from '../../../schemas/bid';
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

interface InspectorModalProps {
  open: boolean;
  onClose: () => void;
}

const InspectorBidModal = ({ open, onClose }: InspectorModalProps) => {
  const { bid, updateBid, bidError, setBidError } = bidStore;
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<InspectorBidFormData>({
    resolver: zodResolver(InspectorBidFormSchema),
    defaultValues: {
      transit_number: bid?.transit_number || '',
      inspection_done: bid?.transit_number || '',
      number_sent: bid?.number_sent || false,
      inspection_paid: bid?.inspection_paid || false,
      inspector_comment: bid?.inspector_comment || '',
      notified_logistician_by_inspector:
        bid?.notified_logistician_by_inspector || false,
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
        transit_number: bid?.transit_number || '',
        inspection_done: bid?.inspection_done || '',
        number_sent: bid?.number_sent || false,
        inspection_paid: bid?.inspection_paid || false,
        inspector_comment: bid?.inspector_comment || '',
        notified_logistician_by_inspector:
          bid?.notified_logistician_by_inspector || false,
      });
    }
  }, [bid, reset]);

  const onSubmit = async (data: InspectorBidFormData) => {
    if (bid) {
      const payload = {
        ...data,
        inspection_date:
          data.inspection_done === 'yes' ? moment().format('YYYY-MM-DD') : null,
        number_sent_date:
          data.number_sent === true ? moment().format('YYYY-MM-DD') : null,
      };
      const isSuccess = await updateBid(
        bid.id,
        payload,
        (bid?.transit_method === 'without_openning' &&
          payload.notified_logistician_by_inspector === true) ||
          (bid?.transit_method === 're_export' &&
            payload.inspection_done === 'yes')
      );
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
                      label='Местонахождение'
                      id='location'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={bid?.location}
                    />
                    <TextField
                      label='Дата принятия'
                      id='location'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={
                        bid?.acceptance_date
                          ? moment(bid?.acceptance_date).format('DD.MM.YYYY')
                          : 'Не указана'
                      }
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              <TextField
                id='transit_number'
                label='Транзитный номер'
                {...register('transit_number')}
                error={!!errors.transit_number}
                helperText={errors.transit_number?.message}
              />
              <FormControl fullWidth>
                <InputLabel id='inspection_done'>Сделан ли осмотр</InputLabel>
                <Select
                  labelId='inspection_done'
                  id='inspection_done'
                  label='Сделан ли осмотр'
                  {...register('inspection_done')}
                  defaultValue={bid?.inspection_done || 'no'}
                >
                  <MenuItem value={'no'}>Нет</MenuItem>
                  <MenuItem value={'yes'}>Да</MenuItem>
                  <MenuItem value={'consignment'}>Нужен осмотр</MenuItem>
                  <MenuItem value={'consignment'}>Нужна экспертиза</MenuItem>
                </Select>
                {errors.inspection_done && (
                  <Typography color='error' variant='caption'>
                    {errors.inspection_done.message}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label='Дата осмотра'
                id='inspection_date'
                variant='outlined'
                fullWidth
                disabled
                value={
                  bid?.inspection_date
                    ? moment(bid?.inspection_date).format('DD.MM.YYYY')
                    : 'Не указана'
                }
              />
              <Controller
                name='number_sent'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Отправил номер'
                    onChange={field.onChange}
                  />
                )}
              />
              <TextField
                label='Дата отправки номера'
                id='number_sent_date'
                variant='outlined'
                fullWidth
                disabled
                value={
                  bid?.number_sent_date
                    ? moment(bid?.number_sent_date).format('DD.MM.YYYY')
                    : 'Не указана'
                }
              />
              <Controller
                name='inspection_paid'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Оплата осмотра'
                    onChange={field.onChange}
                  />
                )}
              />
              <TextField
                id='inspector_comment'
                label='Комментарий'
                multiline
                maxRows={4}
                {...register('inspector_comment')}
                error={!!errors.inspector_comment}
                helperText={errors.inspector_comment?.message}
              />
              <Controller
                name='notified_logistician_by_inspector'
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

export default InspectorBidModal;
