import { Typography } from '@mui/material';
import Header from '../../components/Header/Header';

/**
 * Главная страница
 * @returns {JSX.Element} - главная страница
 */
const Home = () => {
  return (
    <>
      <Header />
      <Typography component='h1' variant='h4' textAlign='center'>
        Главная страница
      </Typography>
    </>
  );
};

export default Home;
