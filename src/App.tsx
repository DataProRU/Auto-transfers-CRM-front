import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth/Auth';
import Home from './pages/Home/Home';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from './store/AuthStore';
import CircularProgress from '@mui/material/CircularProgress';

const App = observer(() => {
  const { checkAuth, isAuthChecking, isAuth } = authStore;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isAuthChecking) {
    return <CircularProgress />;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={isAuth ? <Home /> : <Auth />} />
        </Routes>
      </Router>
    </>
  );
});

export default App;
