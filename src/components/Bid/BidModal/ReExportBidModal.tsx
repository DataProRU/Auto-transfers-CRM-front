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
import type { ReExportBidFormData } from '../../../@types/bid';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReExportBidFormSchema } from '../../../schemas/bid';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import BidCheckbox from '../BidCheckBox';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ruRU } from '@mui/x-date-pickers/locales';
import moment from 'moment';

interface ReExportModalProps {
  open: boolean;
  onClose: () => void;
}

const ReExportBidModal = ({ open, onClose }: ReExportModalProps) => {
  const { bid, updateReExportBid, bidError, setBidError } = bidStore;
  const { showNotification } = useNotification();

  const { handleSubmit, control, reset } = useForm<ReExportBidFormData>({
    resolver: zodResolver(ReExportBidFormSchema),
    defaultValues: {
      export: bid?.export || false,
      prepared_documents: bid?.prepared_documents || false,
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
        export: bid?.export || false,
        prepared_documents: bid?.prepared_documents || false,
      });
    }
  }, [bid, reset]);

  const onSubmit = async (data: ReExportBidFormData) => {
    if (bid) {
      const isSuccess = await updateReExportBid(bid.id, data);
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
                      label='Получатель'
                      id='recipient'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={bid?.recipient}
                    />
                    <TextField
                      label='Цена автомобиля'
                      id='price'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={bid?.price}
                    />
                    <TextField
                      label='Дата забора тайтла'
                      id='title_collection_date'
                      variant='outlined'
                      fullWidth
                      disabled
                      value={moment(bid?.title_collection_date).format(
                        'DD.MM.YYYY'
                      )}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              <Controller
                name='export'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Эспорт'
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name='prepared_documents'
                control={control}
                render={({ field }) => (
                  <BidCheckbox
                    checked={field.value || false}
                    label='Подготовил документы'
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

export default ReExportBidModal;
