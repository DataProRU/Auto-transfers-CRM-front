import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth/Auth';
import Home from './pages/Home/Home';
import { useAction, useAtom } from '@reatom/npm-react';
import { isAuthAtom, isAuthCheckingAtom } from './store/auth/atoms';
import { useEffect } from 'react';
import { checkAuth } from './store/auth/actions';
import { CircularProgress } from '@mui/material';

function App() {
  const [isAuth] = useAtom(isAuthAtom);
  const [isAuthChecking] = useAtom(isAuthCheckingAtom);
  const checkAuthAction = useAction(checkAuth);

  useEffect(() => {
    checkAuthAction();
  }, [checkAuthAction]);

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
}

export default App;
