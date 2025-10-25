import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'doctor' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      const authenticated = isAuthenticated();
      
      if (authenticated && user) {
        if (requiredRole && user.role !== requiredRole) {
          // User doesn't have the required role
          setIsAuth(false);
        } else {
          setIsAuth(true);
        }
      } else {
        setIsAuth(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuth) {
    // Redirect to login with the required role
    const role = requiredRole || 'user';
    return <Navigate to={`/login/${role}`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
