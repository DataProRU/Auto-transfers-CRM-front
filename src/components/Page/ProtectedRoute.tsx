import { authStore } from '../../store/AuthStore';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles: string;
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuth, role } = authStore;

  if (!isAuth) {
    return <Navigate to='/auth' replace />;
  }

  if (requiredRoles && role !== requiredRoles) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
