import {
  Toolbar,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  Divider,
  Box,
} from '@mui/material';
import { useAction, useAtom } from '@reatom/npm-react';
import { logout } from '../../store/auth/actions';
import LogistHeader from './LogistHeader/LogistHeader';
import { authRoleAtom } from '../../store/auth/atoms';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import Logout from '@mui/icons-material/Logout';

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
  const [role] = useAtom(authRoleAtom);
  const logoutAction = useAction(logout);

  const handleLogout = () => {
    logoutAction();
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
