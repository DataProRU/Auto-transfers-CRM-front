import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from './store/AuthStore';
import CircularProgress from '@mui/material/CircularProgress';
import ProtectedRoute from './components/Page/ProtectedRoute';
import Header from './components/Header/Header';

const Loading = lazy(() => import('./pages/Logist/Loading'));
const Start = lazy(() => import('./pages/Logist/Start'));
const CarTransporter = lazy(() => import('./pages/Logist/CarTrasporter'));
const EditRequests = lazy(() => import('./pages/Logist/EditRequests'));
const Auth = lazy(() => import('./pages/Auth'));
const Request = lazy(() => import('./pages/OpeningManager/Requests'));

const App = observer(() => {
  const { checkAuth, isAuthChecking, role } = authStore;
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
        <Suspense fallback={<CircularProgress />}>
          <Routes>
            <Route path='/auth' element={<Auth />} />
            <Route
              path='/'
              element={
                <ProtectedRoute
                  requiredRoles={['logistician', 'opening_manager']}
                >
                  <Header />
                  {role == 'logistician' ? <Start /> : <Request />}
                </ProtectedRoute>
              }
            />

            <Route
              path='/loading'
              element={
                <ProtectedRoute requiredRoles={['logistician']}>
                  <Header />
                  <Loading />
                </ProtectedRoute>
              }
            />
            <Route
              path='/transporters'
              element={
                <ProtectedRoute requiredRoles={['logistician']}>
                  <Header />
                  <CarTransporter />
                </ProtectedRoute>
              }
            />
            <Route
              path='/edit'
              element={
                <ProtectedRoute requiredRoles={['logistician']}>
                  <Header />
                  <EditRequests />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
});

export default App;
