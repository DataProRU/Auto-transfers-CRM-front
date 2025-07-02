import { Start } from '@mui/icons-material';
import { ListItemText } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FireTruckIcon from '@mui/icons-material/FireTruck';
import RequestPageIcon from '@mui/icons-material/RequestPage';

const LogistHeader = () => {
  return (
    <>
      <MenuItem>
        <ListItemIcon>
          <Start fontSize='small' />
        </ListItemIcon>
        <ListItemText primary='Начальный этап' />
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <CalendarMonthIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText primary='Погрузка' />
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <FireTruckIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText primary='Автовоз' />
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <RequestPageIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText primary='Заявки на редактирования' />
      </MenuItem>
    </>
  );
};

export default LogistHeader;
