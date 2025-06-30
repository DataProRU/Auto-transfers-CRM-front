import LogistHeader from './LogistHeader/LogistHeader';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import Logout from '@mui/icons-material/Logout';
import { authStore } from '../../store/AuthStore';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const drawerWidth = 300;

const getRole = (role: string) => {
  switch (role) {
    case 'logistician':
      return 'Логист';
    case 'opening_manager':
      return 'Менеджер по открытию';
    case 'title':
      return 'Тайтл';
    case 'inspector':
      return 'Осмотр';
    default:
      return 'Пользователь';
  }
};

const Header = () => {
  const { role, logout } = authStore;

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
        }}
        variant='permanent'
        anchor='left'
      >
        <Toolbar>
          <Typography variant='h6' noWrap component='div'>
            {role && getRole(role)}
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {role === 'logistician' ? (
            <LogistHeader />
          ) : (
            <>
              <MenuItem>
                <ListItemIcon>
                  <RequestPageIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText primary='Заявки' />
              </MenuItem>
            </>
          )}
        </List>
        <Divider />
        <List sx={{ mt: 'auto' }}>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='Выйти' />
          </MenuItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default Header;
