import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ allowedRoles }) => {
    const { userInfo } = useAuth();
    const location = useLocation();

    if (!userInfo) {
        // Not logged in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(userInfo.role)) {
        // Logged in but wrong role
        // Redirect admins trying to access student pages to their dashboard, and vice-versa
        const redirectPath = userInfo.role === 'admin' ? '/admin' : '/';
        return <Navigate to={redirectPath} replace />;
    }

    // Logged in and has the correct role
    return <Outlet />;
};

export default PrivateRoute;