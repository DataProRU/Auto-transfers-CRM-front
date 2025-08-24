import { Controller, useForm } from 'react-hook-form';
import { useNotification } from '../../../providers/Notification';
import bidStore from '../../../store/BidStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import type { RecieverBidFormData } from '../../../@types/bid';
import { RecieverBidFormSchema } from '../../../schemas/bid';
import moment from 'moment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ruRU } from '@mui/x-date-pickers/locales';
import DialogContentText from '@mui/material/DialogContentText';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import type { Transporter } from '../../../models/TransporterResponse';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BidCheckbox from '../BidCheckBox';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

moment.locale('ru');

interface RecieverModalProps {
  open: boolean;
  onClose: () => void;
}

const RecieverBidModal = ({ open, onClose }: RecieverModalProps) => {
  const { bid, updateExpandedBid, bidError, setBidError } = bidStore;
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<RecieverBidFormData>({
    resolver: zodResolver(RecieverBidFormSchema),
    defaultValues: {
      vehicle_arrival_date: bid?.vehicle_arrival_date
        ? moment(bid.vehicle_arrival_date).format('DD.MM.YYYY')
        : null,
      receive_vehicle: bid?.receive_vehicle || false,
      receive_documents: bid?.receive_documents || false,
      full_acceptance: bid?.full_acceptance || false,
      receiver_keys_number: bid?.receiver_keys_number || 0,
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
        vehicle_arrival_date: bid?.vehicle_arrival_date
          ? moment(bid.vehicle_arrival_date).format('DD.MM.YYYY')
          : null,
        receive_vehicle: bid?.receive_vehicle || false,
        receive_documents: bid?.receive_documents || false,
        full_acceptance: bid?.full_acceptance || false,
        receiver_keys_number: bid?.receiver_keys_number || 0,
      });
    }
  }, [bid, reset]);

  const onSubmit = async (data: RecieverBidFormData) => {
    if (bid) {
      const convertedData = {
        ...data,
        vehicle_arrival_date: data.vehicle_arrival_date
          ? moment(data.vehicle_arrival_date, 'DD.MM.YYYY').format('YYYY-MM-DD')
          : null,
      };
      const inProgressCondition =
        convertedData.vehicle_arrival_date ===
        moment().add(1, 'days').format('YYYY-MM-DD');

      const completedCondition = data.full_acceptance === true;
      const isSuccess = await updateExpandedBid(
        bid.id,
        convertedData,
        inProgressCondition,
        completedCondition
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
                      label='Номер автовоза'
                      id='vehicle_transporter_number'
                      variant='outlined'
                      disabled
                      value={
                        (bid?.vehicle_transporter as Transporter)?.number || ''
                      }
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              <Controller
                name='vehicle_arrival_date'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label='Примерная дата прибытия'
                    value={
                      field.value ? moment(field.value, 'DD.MM.YYYY') : null
                    }
                    onChange={(date) => {
                      field.onChange(date ? date.format('DD.MM.YYYY') : null);
                    }}
                    format='DD.MM.YYYY'
                    slotProps={{
                      textField: {
                        error: !!error,
                        helperText: error?.message || ' ',
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
              <Controller
                name='receive_vehicle'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Принял автомобиль'
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name='receive_documents'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Принял документы'
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name='full_acceptance'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Полное принятие'
                    onChange={field.onChange}
                  />
                )}
              />
              <FormControl fullWidth>
                <InputLabel id='receiver_keys_number'>Принял ключей</InputLabel>
                <Select
                  labelId=''
                  id='receiver_keys_number'
                  label='Принял ключей'
                  {...register('receiver_keys_number')}
                  defaultValue={bid?.logistician_keys_number || 0}
                >
                  <MenuItem value={0}>0</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                </Select>
                {errors.receiver_keys_number && (
                  <Typography color='error' variant='caption'>
                    {errors.receiver_keys_number.message}
                  </Typography>
                )}
              </FormControl>
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

export default RecieverBidModal;
