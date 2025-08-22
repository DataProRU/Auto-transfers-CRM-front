import { useEffect } from 'react';
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
import { zodResolver } from '@hookform/resolvers/zod';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ruRU } from '@mui/x-date-pickers/locales';
import moment from 'moment';
import { useNotification } from '../../../../providers/Notification';
import type { LogistBidLoadingFormData } from '../../../../@types/bid';
import { logistbidLoadingFormSchema } from '../../../../schemas/bid';
import bidStore from '../../../../store/BidStore';
import BidCheckbox from '../../BidCheckBox';
import { getTransitMethod } from '../../../../utils/getTransitMethod';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import Combobox from '../../../UI/Combobox';
import transporterStore from '../../../../store/TranporterStore';
import { observer } from 'mobx-react-lite';
import type { Tranporter } from '../../../../models/TranporterResponse';

interface LogistLoadingModalProps {
  open: boolean;
  onClose: () => void;
}

const LogistLoadingBidModal = observer(
  ({ open, onClose }: LogistLoadingModalProps) => {
    const { bid, updateBid, bidError, setBidError } = bidStore;
    const { tranporters, fetchTransporters, isLoading } = transporterStore;
    const { showNotification } = useNotification();

    const {
      handleSubmit,
      reset,
      register,
      control,
      formState: { errors },
    } = useForm<LogistBidLoadingFormData>({
      resolver: zodResolver(logistbidLoadingFormSchema),
      defaultValues: {
        vehicle_transporter: (bid?.vehicle_transporter as Tranporter)?.id,
        logistician_keys_number: bid?.logistician_keys_number || 0,
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
          vehicle_transporter: (bid?.vehicle_transporter as Tranporter)?.id,
          logistician_keys_number: bid?.logistician_keys_number || 0,
        });
      }
    }, [bid, reset]);

    const onSubmit = async (data: LogistBidLoadingFormData) => {
      if (bid) {
        const isSuccess = await updateBid(
          bid.id,
          data,
          data.vehicle_transporter && data.logistician_keys_number !== 0,
          'loading'
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
                    <Typography component='span'>
                      Информация о заявке
                    </Typography>
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
                        label='Клиент'
                        id='client'
                        variant='outlined'
                        fullWidth
                        disabled
                        value={bid?.client.full_name}
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
                        label='Номер контейнера'
                        id='container_number'
                        variant='outlined'
                        disabled
                        value={bid?.container_number}
                      />
                      <TextField
                        label='Предпологаемая дата прибытия контейнера'
                        id='arrivalDate'
                        variant='outlined'
                        disabled
                        value={moment(bid?.arrival_date).format('DD.MM.YYYY')}
                      />
                      <TextField
                        label='Предпологаемая дата открытия контейнера'
                        id='openning_date'
                        variant='outlined'
                        disabled
                        value={moment(bid?.openning_date).format('DD.MM.YYYY')}
                      />
                      <TextField
                        label='Получатель'
                        id='recipient'
                        variant='outlined'
                        fullWidth
                        disabled
                        value={bid?.recipient}
                      />
                      <TextField
                        label='Перевозчик'
                        id='transporter'
                        variant='outlined'
                        disabled
                        value={bid?.transporter}
                      />
                      <TextField
                        label='Метод транзита'
                        id='transporter'
                        variant='outlined'
                        disabled
                        value={getTransitMethod(bid?.transit_method || '')}
                      />
                      <TextField
                        label='Местонахождение'
                        id='location'
                        variant='outlined'
                        fullWidth
                        disabled
                        value={bid?.location}
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
                        label='Экспорт'
                        disabled
                      />
                      <BidCheckbox
                        checked={bid?.requested_title || false}
                        label='Запросил тайтл'
                        disabled
                      />
                      <BidCheckbox
                        checked={bid?.notified_parking || false}
                        label='Уведомил стоянку (без открытия)'
                        disabled
                      />
                      <BidCheckbox
                        checked={bid?.notified_inspector || false}
                        label='Уведомил осмотр (Без открытия)'
                        disabled
                      />
                      <TextField
                        label='Тип ТС'
                        id='v_type'
                        variant='outlined'
                        fullWidth
                        disabled
                        value={bid?.v_type.v_type}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Controller
                  name='vehicle_transporter'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Combobox
                      onChange={(selectedId) => {
                        field.onChange(selectedId);
                      }}
                      fetchOptions={fetchTransporters}
                      options={tranporters}
                      isLoading={isLoading}
                      label='Автовоз'
                      width='100%'
                      value={field.value}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      getOptionLabel={(item: Tranporter) =>
                        `${item.number || ''}`
                      }
                      initialData={bid?.vehicle_transporter as Tranporter}
                    />
                  )}
                />
                <FormControl fullWidth>
                  <InputLabel id='logistician_keys_number'>
                    Отправлено ключей
                  </InputLabel>
                  <Select
                    labelId=''
                    id='logistician_keys_number'
                    label='Отправлено logistician_keys_number'
                    {...register('logistician_keys_number')}
                    defaultValue={bid?.logistician_keys_number || 0}
                  >
                    <MenuItem value={0}>0</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                  </Select>
                  {errors.logistician_keys_number && (
                    <Typography color='error' variant='caption'>
                      {errors.logistician_keys_number.message}
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
  }
);

export default LogistLoadingBidModal;
