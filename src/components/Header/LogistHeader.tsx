import { Start } from '@mui/icons-material';
import { ListItemText, useTheme } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FireTruckIcon from '@mui/icons-material/FireTruck';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import { useLocation, useNavigate } from 'react-router-dom';

const LogistHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const activeStyle = {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  };

  return (
    <>
      <MenuItem
        onClick={() => navigate('/')}
        sx={isActive('/') ? activeStyle : {}}
      >
        <ListItemIcon>
          <Start
            fontSize='small'
            color={isActive('/') ? 'primary' : 'inherit'}
          />
        </ListItemIcon>
        <ListItemText
          primary='Начальный этап'
          slotProps={{
            primary: {
              style: {
                fontWeight: isActive('/') ? 'bold' : 'normal',
                color: isActive('/') ? theme.palette.primary.main : 'inherit',
              },
            },
          }}
        />
      </MenuItem>
      <MenuItem
        onClick={() => navigate('/loading')}
        sx={isActive('/loading') ? activeStyle : {}}
      >
        <ListItemIcon>
          <CalendarMonthIcon
            fontSize='small'
            color={isActive('/loading') ? 'primary' : 'inherit'}
          />
        </ListItemIcon>
        <ListItemText
          primary='Погрузка'
          slotProps={{
            primary: {
              style: {
                fontWeight: isActive('/loading') ? 'bold' : 'normal',
                color: isActive('/loading')
                  ? theme.palette.primary.main
                  : 'inherit',
              },
            },
          }}
        />
      </MenuItem>
      <MenuItem
        onClick={() => navigate('/transporters')}
        sx={isActive('/transporters') ? activeStyle : {}}
      >
        <ListItemIcon>
          <FireTruckIcon
            fontSize='small'
            color={isActive('/transporters') ? 'primary' : 'inherit'}
          />
        </ListItemIcon>
        <ListItemText
          primary='Автовоз'
          slotProps={{
            primary: {
              style: {
                fontWeight: isActive('/transporters') ? 'bold' : 'normal',
                color: isActive('/transporters')
                  ? theme.palette.primary.main
                  : 'inherit',
              },
            },
          }}
        />
      </MenuItem>
      <MenuItem
        onClick={() => navigate('/edit')}
        sx={isActive('/edit') ? activeStyle : {}}
      >
        <ListItemIcon>
          <RequestPageIcon
            fontSize='small'
            color={isActive('/edit') ? 'primary' : 'inherit'}
          />
        </ListItemIcon>
        <ListItemText
          primary='Заявки на редактирования'
          slotProps={{
            primary: {
              style: {
                fontWeight: isActive('/edit') ? 'bold' : 'normal',
                color: isActive('/edit')
                  ? theme.palette.primary.main
                  : 'inherit',
              },
            },
          }}
        />
      </MenuItem>
    </>
  );
};
//
export default LogistHeader;
