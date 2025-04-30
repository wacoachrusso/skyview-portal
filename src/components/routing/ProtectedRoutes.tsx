// src/components/routing/ProtectedRoutes.tsx
import { redirectIfUnauthenticated, redirectIfAuthenticated, isAuthenticated } from "@/utils/auth/authGuard";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectAuthenticatedTo?: string;
  redirectUnauthenticatedTo?: string;
}

/**
 * Protected route component that handles authentication redirects
 * 
 * @param children - The child components to render
 * @param requireAuth - Whether authentication is required (protected route)
 * @param redirectAuthenticatedTo - Where to redirect authenticated users (for public routes)
 * @param redirectUnauthenticatedTo - Where to redirect unauthenticated users (for protected routes)
 */
export const ProtectedRoute = ({
  children,
  requireAuth = false,
  redirectAuthenticatedTo = "/chat",
  redirectUnauthenticatedTo = "/login",
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if we're currently stabilizing auth state after payment/auth flow
    const authStabilizing = localStorage.getItem("auth_stabilizing") === "true";
    
    if (authStabilizing) {
      setIsStabilizing(true);
      // Don't perform redirects while stabilizing
      setShouldRender(true);
      return;
    }
    
    // Check for payment or auth success parameters in URL
    const isSuccessRedirect = 
      location.search.includes('payment_success') || 
      location.search.includes('auth_success') ||
      location.search.includes('checkout.session_completed');
      
    // If this is a success redirect URL, don't redirect yet
    if (isSuccessRedirect) {
      setIsStabilizing(true);
      setShouldRender(true);
      return;
    }

    // Normal redirect behavior
    if (requireAuth) {
      // For protected routes - redirect unauthenticated users to login
      const redirected = redirectIfUnauthenticated(navigate);
      setShouldRender(!redirected);
    } else if (redirectAuthenticatedTo) {
      // For public routes - redirect authenticated users to chat/dashboard
      const redirected = redirectIfAuthenticated(navigate);
      setShouldRender(!redirected);
    } else {
      setShouldRender(true);
    }
  }, [navigate, requireAuth, redirectAuthenticatedTo, redirectUnauthenticatedTo, location]);

  // Immediate redirect on first render to prevent flash of content
  if (!isStabilizing) {
    if (requireAuth && !isAuthenticated()) {
      return <Navigate to={redirectUnauthenticatedTo} replace />;
    }

    if (!requireAuth && isAuthenticated() && redirectAuthenticatedTo) {
      return <Navigate to={redirectAuthenticatedTo} replace />;
    }
  }

  // Don't render children until we've determined routing
  if (!shouldRender && !isStabilizing) {
    return null;
  }

  return <>{children}</>;
}