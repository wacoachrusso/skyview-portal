import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionCheck } from "@/hooks/useSessionCheck";

export function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useSessionCheck();
  
  console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated, but only for protected routes
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access to protected routes if authenticated
  return <Outlet />;
}