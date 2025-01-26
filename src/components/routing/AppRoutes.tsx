import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon } from "@/components/coming-soon/ComingSoon";
import * as LazyRoutes from "./LazyRoutes";
import { useAuthState } from "@/hooks/useAuthState";

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuthState();
  console.log('AppRoutes - Auth state:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Check if we're in the test environment
  const isTestEnvironment = window.location.pathname.startsWith('/test-app');
  console.log('Current environment:', isTestEnvironment ? 'test' : 'production');

  return (
    <Routes>
      {/* Public landing page shows Coming Soon only if not in test environment */}
      <Route path="/" element={isTestEnvironment ? <Navigate to="/test-app" /> : <ComingSoon />} />
      
      {/* Test environment routes - all accessible */}
      <Route path="/test-app" element={<LazyRoutes.Index />} />
      <Route path="/test-app/login" element={<LazyRoutes.Login />} />
      <Route path="/test-app/signup" element={<LazyRoutes.SignUp />} />
      <Route path="/test-app/forgot-password" element={<LazyRoutes.ForgotPassword />} />
      <Route path="/test-app/reset-password" element={<LazyRoutes.ResetPassword />} />
      
      {/* Protected routes - only check auth if not in test environment */}
      <Route
        path="/test-app/chat"
        element={
          isTestEnvironment || isAuthenticated ? (
            <LazyRoutes.Chat />
          ) : (
            <Navigate to="/test-app/login" />
          )
        }
      />
      <Route
        path="/test-app/dashboard"
        element={
          isTestEnvironment || isAuthenticated ? (
            <LazyRoutes.Dashboard />
          ) : (
            <Navigate to="/test-app/login" />
          )
        }
      />
      <Route
        path="/test-app/account"
        element={
          isTestEnvironment || isAuthenticated ? (
            <LazyRoutes.Account />
          ) : (
            <Navigate to="/test-app/login" />
          )
        }
      />
      <Route
        path="/test-app/settings"
        element={
          isTestEnvironment || isAuthenticated ? (
            <LazyRoutes.Settings />
          ) : (
            <Navigate to="/test-app/login" />
          )
        }
      />
      
      {/* Admin routes */}
      <Route
        path="/test-app/admin/*"
        element={
          isTestEnvironment || isAuthenticated ? (
            <LazyRoutes.AdminDashboard />
          ) : (
            <Navigate to="/test-app/login" />
          )
        }
      />
      
      {/* Other public routes */}
      <Route path="/test-app/about" element={<LazyRoutes.About />} />
      <Route path="/test-app/release-notes" element={<LazyRoutes.ReleaseNotes />} />
      <Route path="/test-app/privacy-policy" element={<LazyRoutes.PrivacyPolicy />} />
      <Route path="/test-app/refunds" element={<LazyRoutes.Refunds />} />
      <Route path="/test-app/help-center" element={<LazyRoutes.HelpCenter />} />
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to={isTestEnvironment ? "/test-app" : "/"} replace />} />
    </Routes>
  );
}