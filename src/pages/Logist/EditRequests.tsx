import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const EditRequests = () => {
  return (
    <>
      <Container
        sx={{
          py: 5,
        }}
      >
        <Typography component='h1' variant='h4' textAlign='center'>
          Заявки на редактирования
        </Typography>
      </Container>
    </>
  );
};

export default EditRequests;
