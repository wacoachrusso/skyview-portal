
import { Route, Routes } from "react-router-dom";
import AuthCallback from "@/components/auth/AuthCallback";
import * as LazyRoutes from "./LazyRoutes";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { LoadingSpinner } from "./LoadingSpinner";
import { useWaitlistStatus } from "./useWaitlistStatus";
import WebViewDemo from '@/pages/WebViewDemo';

export function AppRoutes() {
  const { isWaitlistChecking, shouldShowWaitlist } = useWaitlistStatus();
  
  if (isWaitlistChecking) {
    return <LoadingSpinner />;
  }
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Routes>
        <Route path="/" element={<LazyRoutes.Index />} />
        
        <Route 
          path="/login" 
          element={
            window.location.search.includes('admin=true') 
              ? <LazyRoutes.Login />
              : (shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.Login />)
          } 
        />
        
        <Route path="/signup" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.SignUp />} />
        <Route path="/privacy-policy" element={<LazyRoutes.PrivacyPolicy />} />
        <Route path="/about" element={<LazyRoutes.About />} />
        <Route path="/forgot-password" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.ForgotPassword />} />
        <Route path="/reset-password" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/help-center" element={<LazyRoutes.HelpCenter />} />
        <Route path="/WebViewDemo" element={<WebViewDemo />} />
        
        {/* Protected routes */}
        <Route path="/chat" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Chat /></ProtectedRoute>} />
        <Route path="/account" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Account /></ProtectedRoute>} />
        <Route path="/settings" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Settings /></ProtectedRoute>} />
        <Route path="/dashboard" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Dashboard /></ProtectedRoute>} />
        <Route path="/release-notes" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.ReleaseNotes /></ProtectedRoute>} />
        <Route path="/refunds" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Refunds /></ProtectedRoute>} />
        
        <Route path="/complete-profile" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.Login />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><LazyRoutes.AdminDashboard /></AdminRoute>} />
        
        {/* Fallback route */}
        <Route path="*" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.Dashboard />} />
      </Routes>
    </ErrorBoundary>
  );
}
