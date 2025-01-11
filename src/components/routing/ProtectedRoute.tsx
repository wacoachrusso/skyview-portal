import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionCheck } from "@/hooks/useSessionCheck";

export function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useSessionCheck();
  
  console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'location:', location.pathname);

  // Show nothing while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute - Loading state, showing nothing');
    return null;
  }

  // Redirect to login if not authenticated, but only for protected routes
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access to protected routes if authenticated
  console.log('ProtectedRoute - Authenticated, allowing access');
  return <Outlet />;
}