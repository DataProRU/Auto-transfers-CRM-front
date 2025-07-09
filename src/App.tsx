import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from './store/AuthStore';
import CircularProgress from '@mui/material/CircularProgress';
import Loading from './pages/Logist/Loading';
import Start from './pages/Logist/Start';
import CarTransporter from './pages/Logist/CarTrasporter';
import EditRequests from './pages/Logist/EditRequests';
import ProtectedRoute from './components/Page/ProtectedRoute';
import Header from './components/Header/Header';
import Auth from './pages/Auth';

const App = observer(() => {
  const { checkAuth, isAuthChecking } = authStore;
  const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsInitialCheckComplete(true);
    };
    initializeAuth();
  }, [checkAuth]);

  if (!isInitialCheckComplete || isAuthChecking) {
    return <CircularProgress />;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path='/auth' element={<Auth />} />
          <Route
            path='/'
            element={
              <ProtectedRoute requiredRoles='logistician'>
                <Header />
                <Start />
              </ProtectedRoute>
            }
          />

          <Route
            path='/loading'
            element={
              <ProtectedRoute requiredRoles='logistician'>
                <Header />
                <Loading />
              </ProtectedRoute>
            }
          />
          <Route
            path='/transporters'
            element={
              <ProtectedRoute requiredRoles='logistician'>
                <Header />
                <CarTransporter />
              </ProtectedRoute>
            }
          />
          <Route
            path='/edit'
            element={
              <ProtectedRoute requiredRoles='logistician'>
                <Header />
                <EditRequests />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
});

export default App;
