import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { AuthCallback } from "@/components/auth/AuthCallback";
import * as LazyRoutes from "./LazyRoutes";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Route changed to:', location.pathname);
    
    // Force a clean navigation when leaving the chat page
    const fromChat = location.state?.fromChat;
    if (fromChat) {
      const newPath = location.pathname;
      // Remove the state and re-navigate
      navigate(newPath, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
    </Suspense>
  );
}