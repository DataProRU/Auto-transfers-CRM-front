import { createContext, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import type { AlertColor } from '@mui/material/Alert';
import Alert from '@mui/material/Alert';

/**
 * Тип контекста уведомлений
 */
type NotificationContextType = {
  showNotification: (message: string, severity?: AlertColor) => void;
};

/**
 * Контекст уведомлений
 */
const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Провайдер уведомлений
 * @param {React.ReactNode} children - дочерние элементы
 * @returns {JSX.Element} - компонент провайдера уведомлений
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  /**
   * Функция для отображения уведомления
   * @param {string} msg - сообщение уведомления
   * @param {AlertColor} sev - уровень важности уведомления
   */
  const showNotification = (msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  /**
   * Обработчик закрытия уведомления
   * @param {React.SyntheticEvent | Event} _event - событие
   * @param {string} reason - причина закрытия
   */
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

/**
 * Хук для использования контекста уведомлений
 * @returns {NotificationContextType} - контекст уведомлений
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
