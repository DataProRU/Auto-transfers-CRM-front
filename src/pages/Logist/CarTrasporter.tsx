import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const CarTransporter = () => {
  return (
    <>
      <Container
        sx={{
          py: 5,
        }}
      >
        <Typography component='h1' variant='h4' textAlign='center'>
          Автовоз
        </Typography>
      </Container>
    </>
  );
};

export default CarTransporter;
