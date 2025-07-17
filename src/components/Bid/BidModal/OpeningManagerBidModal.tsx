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
import moment from 'moment';
import { Controller, useForm } from 'react-hook-form';
import type { OpeningManagerBidFormData } from '../../../@types/bid';
import { zodResolver } from '@hookform/resolvers/zod';
import { OpeningManagerBidFormSchema } from '../../../schemas/bid';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { getTransitMethod } from '../../../utils/getTransitMethod';
import BidCheckbox from '../BidCheckBox';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ruRU } from '@mui/x-date-pickers/locales';

moment.locale('ru');

interface OpeningManagerModalProps {
  open: boolean;
  onClose: () => void;
}

const OpeningManagerBidModal = ({
  open,
  onClose,
}: OpeningManagerModalProps) => {
  const { bid, updateBid, bidError } = bidStore;
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<OpeningManagerBidFormData>({
    resolver: zodResolver(OpeningManagerBidFormSchema),
    defaultValues: {
      openning_date: moment(bid?.openning_date).format('DD.MM.YYYY') || '',
      manager_comment: bid?.manager_comment || '',
      opened: bid?.opened || false,
    },
  });

  useEffect(() => {
    if (bidError) {
      showNotification(bidError, 'error');
    }
  }, [bidError, showNotification]);

  useEffect(() => {
    if (bid) {
      reset({
        openning_date: moment(bid?.openning_date).format('DD.MM.YYYY') || '',
        manager_comment: bid?.manager_comment || '',
        opened: bid?.opened || false,
      });
    }
  }, [bid, reset]);

  const onSubmit = async (data: OpeningManagerBidFormData) => {
    console.log(data);
    if (bid) {
      const convertedData = {
        ...data,
        openning_date: moment(data.openning_date, 'DD.MM.YYYY').format(
          'YYYY-MM-DD'
        ),
      };
      const isSuccess = await updateBid(
        bid.id,
        convertedData,
        convertedData.openning_date
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
                      label='VIN'
                      id='vin'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={bid?.vin}
                    />

                    <TextField
                      label='Номер контейнера'
                      id='fatherName'
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
                      label='Получатель'
                      id='recipient'
                      variant='outlined'
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
                      label='Метод тразита'
                      id='transit_method'
                      variant='outlined'
                      disabled
                      value={getTransitMethod(bid?.transit_method || '')}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              <Controller
                name='openning_date'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label='Предполагаемая дата открытия контейнера'
                    value={
                      field.value ? moment(field.value, 'DD.MM.YYYY') : null
                    }
                    onChange={(date) => {
                      field.onChange(date?.format('DD.MM.YYYY') || '');
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
              <TextField
                id='comment'
                label='Комментарий'
                multiline
                maxRows={4}
                {...register('manager_comment')}
                error={!!errors.manager_comment}
                helperText={errors.manager_comment?.message}
              />
              <Controller
                name='opened'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Открыто'
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

export default OpeningManagerBidModal;
