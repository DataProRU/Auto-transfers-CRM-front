import { observer } from 'mobx-react-lite';
import { useNotification } from '../../providers/Notification';
import bidStore from '../../store/BidStore';
import { useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import BidListItem from '../../components/Bid/BidListItem/BidListItem';
import ListItem from '@mui/material/ListItem';

const TitleRequests = observer(() => {
  const { showNotification } = useNotification();
  const {
    fetchBids,
    bidError,
    isBidLoading,
    untouchedBids,
    inProgressBids,
    сompletedBids,
  } = bidStore;

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  useEffect(() => {
    if (bidError) {
      showNotification(bidError, 'error');
    }
  }, [bidError, showNotification]);
  return (
    <Container sx={{ py: 5 }}>
      <Typography component='h1' variant='h4' textAlign='center' mb={4}>
        Заявки
      </Typography>
      {isBidLoading ? (
        <Typography textAlign='center'>Загрузка данных...</Typography>
      ) : (
        <Grid container spacing={4}>
          <Grid size={4}>
            <Paper elevation={3}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'primary.light',
                  color: 'white',
                }}
              >
                <Typography variant='h6'>
                  Необработанные
                  <Chip
                    label={untouchedBids.length}
                    color='primary'
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              <List>
                {untouchedBids.length > 0 ? (
                  untouchedBids.map((bid) => (
                    <BidListItem key={bid.id} bid={bid} />
                  ))
                ) : (
                  <ListItem>
                    <Typography variant='body2' color='text.secondary'>
                      Нет необработанных заявок
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper elevation={3}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'secondary.light',
                  color: 'white',
                }}
              >
                <Typography variant='h6'>
                  В работе
                  <Chip
                    label={inProgressBids.length}
                    color='primary'
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              <List>
                {inProgressBids.length > 0 ? (
                  inProgressBids.map((bid) => (
                    <BidListItem key={bid.id} bid={bid} />
                  ))
                ) : (
                  <ListItem>
                    <Typography variant='body2' color='text.secondary'>
                      Нет заявок в работе
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper elevation={3}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'green',
                  color: 'white',
                }}
              >
                <Typography variant='h6'>
                  Завершено
                  <Chip
                    label={сompletedBids.length}
                    color='primary'
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              <List>
                {сompletedBids.length > 0 ? (
                  сompletedBids.map((bid) => (
                    <BidListItem key={bid.id} bid={bid} />
                  ))
                ) : (
                  <ListItem>
                    <Typography variant='body2' color='text.secondary'>
                      Нет заявок в работе
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
});

export default TitleRequests;
