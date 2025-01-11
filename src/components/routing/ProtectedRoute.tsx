import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionCheck } from "@/hooks/useSessionCheck";

export function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useSessionCheck();
  
  console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}