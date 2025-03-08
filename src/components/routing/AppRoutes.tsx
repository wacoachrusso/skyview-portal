
import { Route, Routes } from "react-router-dom";
import { AuthCallback } from "@/components/auth/AuthCallback";
import * as LazyRoutes from "./LazyRoutes";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { SessionCheck } from "@/components/chat/settings/SessionCheck";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

// Wrapper component for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SessionCheck />
      {children}
    </>
  );
};

// Special wrapper for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, isLoading } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        setVerifying(true);
        
        // Direct database check for most up-to-date admin status
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }
        
        // Fetch fresh user profile data directly from the database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, email')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Error fetching admin status:", error);
          navigate('/dashboard');
          return;
        }
        
        console.log("Admin verification result:", profile);
        
        if (!profile?.is_admin) {
          console.log("User is not an admin, redirecting to dashboard");
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You need administrator privileges to access this page."
          });
          navigate('/dashboard');
          return;
        }
        
        console.log("Admin access confirmed for:", profile.email);
        setIsAdmin(true);
      } catch (error) {
        console.error("Error verifying admin status:", error);
        navigate('/dashboard');
      } finally {
        setVerifying(false);
      }
    };
    
    verifyAdminStatus();
  }, [navigate, toast, userProfile]);

  if (verifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl">
        Access Denied. You need administrator privileges to access this page.
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export function AppRoutes() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
        <Route path="/chat" element={<ProtectedRoute><LazyRoutes.Chat /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><LazyRoutes.Account /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><LazyRoutes.Settings /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><LazyRoutes.Dashboard /></ProtectedRoute>} />
        <Route path="/release-notes" element={<ProtectedRoute><LazyRoutes.ReleaseNotes /></ProtectedRoute>} />
        <Route path="/refunds" element={<ProtectedRoute><LazyRoutes.Refunds /></ProtectedRoute>} />
        
        {/* Admin routes with special protection */}
        <Route path="/admin" element={<AdminRoute><LazyRoutes.AdminDashboard /></AdminRoute>} />
        
        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<ProtectedRoute><LazyRoutes.Dashboard /></ProtectedRoute>} />
      </Routes>
    </ErrorBoundary>
  );
}
