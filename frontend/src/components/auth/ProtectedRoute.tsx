import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../../services/authService';
import { validateToken } from '../../services/api';

const ProtectedRoute = () => {
    const user = authService.getCurrentUser();
    
    useEffect(() => {
        if (user) {
            validateToken().catch(() => {
                // Interceptor in api.ts will handle the storage cleanup and redirect
            });
        }
    }, [user]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
