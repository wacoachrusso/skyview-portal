import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthCallback } from "@/components/auth/AuthCallback";
import * as LazyRoutes from "./LazyRoutes";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Route changed to:', location.pathname);
    
    const cleanupNavigation = () => {
      console.log('Cleaning up navigation state');
      if (location.state) {
        const newPath = location.pathname;
        navigate(newPath, { replace: true, state: {} });
      }
    };

    cleanupNavigation();

    const handleNavigationError = (event: ErrorEvent) => {
      console.error('Navigation error:', event.error);
      window.location.href = location.pathname;
    };

    window.addEventListener('error', handleNavigationError);

    return () => {
      window.removeEventListener('error', handleNavigationError);
    };
  }, [location, navigate]);

  return (
    <LazyRoutes.LazyLoadWrapper>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LazyRoutes.Index />} />
        <Route path="/login" element={<LazyRoutes.Login />} />
        <Route path="/signup" element={<LazyRoutes.SignUp />} />
        <Route path="/privacy-policy" element={<LazyRoutes.PrivacyPolicy />} />
        <Route path="/about" element={<LazyRoutes.About />} />
        <Route path="/forgot-password" element={<LazyRoutes.ForgotPassword />} />
        <Route path="/reset-password" element={<LazyRoutes.ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/help-center" element={<LazyRoutes.HelpCenter />} />
        
        {/* Protected routes */}
        <Route path="/chat" element={<LazyRoutes.Chat />} />
        <Route path="/account" element={<LazyRoutes.Account />} />
        <Route path="/settings" element={<LazyRoutes.Settings />} />
        <Route path="/dashboard" element={<LazyRoutes.Dashboard />} />
        <Route path="/admin" element={<LazyRoutes.AdminDashboard />} />
        <Route path="/release-notes" element={<LazyRoutes.ReleaseNotes />} />
        <Route path="/refunds" element={<LazyRoutes.Refunds />} />
        
        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<LazyRoutes.Dashboard />} />
      </Routes>
    </LazyRoutes.LazyLoadWrapper>
  );
}