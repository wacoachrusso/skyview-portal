import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon } from "@/components/coming-soon/ComingSoon";
import * as LazyRoutes from "./LazyRoutes";
import { useAuthState } from "@/hooks/useAuthState";

export function AppRoutes() {
  const { isAuthenticated } = useAuthState();

  return (
    <Routes>
      {/* Public landing page shows Coming Soon */}
      <Route path="/" element={<ComingSoon />} />
      
      {/* Test environment routes */}
      <Route path="/test-app" element={<LazyRoutes.Index />} />
      <Route path="/test-app/login" element={<LazyRoutes.Login />} />
      <Route path="/test-app/signup" element={<LazyRoutes.SignUp />} />
      <Route path="/test-app/forgot-password" element={<LazyRoutes.ForgotPassword />} />
      <Route path="/test-app/reset-password" element={<LazyRoutes.ResetPassword />} />
      
      {/* Protected routes */}
      <Route
        path="/test-app/chat"
        element={isAuthenticated ? <LazyRoutes.Chat /> : <Navigate to="/test-app/login" />}
      />
      <Route
        path="/test-app/dashboard"
        element={isAuthenticated ? <LazyRoutes.Dashboard /> : <Navigate to="/test-app/login" />}
      />
      <Route
        path="/test-app/account"
        element={isAuthenticated ? <LazyRoutes.Account /> : <Navigate to="/test-app/login" />}
      />
      <Route
        path="/test-app/settings"
        element={isAuthenticated ? <LazyRoutes.Settings /> : <Navigate to="/test-app/login" />}
      />
      
      {/* Admin routes */}
      <Route
        path="/test-app/admin/*"
        element={isAuthenticated ? <LazyRoutes.AdminDashboard /> : <Navigate to="/test-app/login" />}
      />
      
      {/* Other public routes */}
      <Route path="/test-app/about" element={<LazyRoutes.About />} />
      <Route path="/test-app/release-notes" element={<LazyRoutes.ReleaseNotes />} />
      <Route path="/test-app/privacy-policy" element={<LazyRoutes.PrivacyPolicy />} />
      <Route path="/test-app/refunds" element={<LazyRoutes.Refunds />} />
      <Route path="/test-app/help-center" element={<LazyRoutes.HelpCenter />} />
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
