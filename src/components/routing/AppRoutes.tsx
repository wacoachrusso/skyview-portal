
import { Route, Routes } from "react-router-dom";
import AuthCallback from "@/components/auth/AuthCallback";
import * as LazyRoutes from "./LazyRoutes";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useEffect } from "react";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">We're having trouble loading this page</p>
        <div className="flex gap-4">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
          <Button 
            onClick={resetErrorBoundary}
            variant="default"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simplified protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Simplified admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export function AppRoutes() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Routes>
        <Route path="/" element={<LazyRoutes.Index />} />
        <Route path="/login" element={<LazyRoutes.Login />} />
        <Route path="/signup" element={<LazyRoutes.SignUp />} />
        <Route path="/privacy-policy" element={<LazyRoutes.PrivacyPolicy />} />
        <Route path="/about" element={<LazyRoutes.About />} />
        <Route path="/forgot-password" element={<LazyRoutes.ForgotPassword />} />
        <Route path="/reset-password" element={<LazyRoutes.ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/help-center" element={<LazyRoutes.HelpCenter />} />
        
        <Route path="/chat" element={<ProtectedRoute><LazyRoutes.Chat /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><LazyRoutes.Account /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><LazyRoutes.Settings /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><LazyRoutes.Dashboard /></ProtectedRoute>} />
        <Route path="/release-notes" element={<ProtectedRoute><LazyRoutes.ReleaseNotes /></ProtectedRoute>} />
        <Route path="/refunds" element={<ProtectedRoute><LazyRoutes.Refunds /></ProtectedRoute>} />
        
        <Route path="/complete-profile" element={<LazyRoutes.Login />} />
        
        <Route path="/admin" element={<AdminRoute><LazyRoutes.AdminDashboard /></AdminRoute>} />
        
        <Route path="*" element={<LazyRoutes.Dashboard />} />
      </Routes>
    </ErrorBoundary>
  );
}
