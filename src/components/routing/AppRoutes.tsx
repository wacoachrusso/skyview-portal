
import { Route, Routes, useNavigate } from "react-router-dom";
import AuthCallback from "@/components/auth/AuthCallback";
import * as LazyRoutes from "./LazyRoutes";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import WebViewDemo from '@/pages/WebViewDemo';
import { supabase } from "@/integrations/supabase/client";
import { isPublicRoute } from "@/utils/navigation";

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

const WaitlistCheck = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [waitlistEnabled, setWaitlistEnabled] = useState(false); // Default to false to prevent loading delays

  useEffect(() => {
    const checkWaitlistStatus = async () => {
      try {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const isAdminLogin = window.location.pathname === '/login' && 
                            window.location.search.includes('admin=true');
        
        if (isAdminRoute || isAdminLogin) {
          console.log("Admin route detected, bypassing waitlist check");
          setWaitlistEnabled(false);
          setIsChecking(false);
          return;
        }
        
        // Reduce number of attempts and timeout duration
        let attempts = 0;
        const maxAttempts = 2;
        let waitlistData = null;
        
        while (attempts < maxAttempts && waitlistData === null) {
          try {
            console.log(`WaitlistCheck - attempt ${attempts + 1}`);
            const { data, error } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'show_waitlist')
              .maybeSingle(); // Use maybeSingle instead of single
              
            if (data && !error) {
              waitlistData = data;
              break;
            } else if (error) {
              console.error(`Attempt ${attempts + 1} error:`, error);
            }
          } catch (fetchError) {
            console.error(`Fetch attempt ${attempts + 1} failed:`, fetchError);
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Reduced timeout from 1000ms to 500ms
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log("WaitlistCheck - final waitlist status:", waitlistData?.value);
        
        if (!waitlistData) {
          console.warn("Could not fetch waitlist settings - defaulting to NOT show waitlist");
          setWaitlistEnabled(false);
        } else {
          const isEnabled = !!waitlistData.value;
          console.log("Setting waitlist enabled to:", isEnabled);
          setWaitlistEnabled(isEnabled);
        }
        
        if (waitlistEnabled && window.location.pathname !== '/') {
          console.log("Waitlist is enabled, redirecting to home");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error checking waitlist status:", error);
        setWaitlistEnabled(false); // Default to false on error
      } finally {
        setIsChecking(false);
      }
    };
    
    // Set a timeout in case the check takes too long
    const timeoutId = setTimeout(() => {
      if (isChecking) {
        console.log("Waitlist check timed out, proceeding with app");
        setIsChecking(false);
        setWaitlistEnabled(false);
      }
    }, 3000); // Timeout after 3 seconds
    
    checkWaitlistStatus();
    
    return () => clearTimeout(timeoutId);
  }, [navigate]);
  
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return waitlistEnabled ? null : <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const checkStarted = sessionStorage.getItem('auth_check_started') === 'true';
        if (checkStarted && !isAuthenticated) {
          console.log("Auth check already in progress, preventing loop");
          setIsLoading(false);
          return;
        }
        
        sessionStorage.setItem('auth_check_started', 'true');
        
        if (localStorage.getItem('login_in_progress') === 'true' ||
            localStorage.getItem('skip_initial_redirect') === 'true') {
          console.log("Skipping auth check due to special flags");
          if (mounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
          }
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found in ProtectedRoute, redirecting to login");
          if (mounted) {
            localStorage.setItem('skip_initial_redirect', 'true');
            navigate("/login", { replace: true });
          }
          return;
        }
        
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in ProtectedRoute:", error);
        if (mounted) {
          setIsLoading(false);
          navigate("/login", { replace: true });
        }
      } finally {
        sessionStorage.removeItem('auth_check_started');
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <WaitlistCheck>{children}</WaitlistCheck> : null;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const cachedAdminStatus = localStorage.getItem('user_is_admin') === 'true';
        
        if (cachedAdminStatus) {
          console.log("User is admin according to localStorage");
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log("No active session, redirecting to login");
          navigate("/login");
          return;
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError || !profile) {
          console.error("Error fetching admin status:", profileError);
          navigate("/chat");
          return;
        }
        
        if (!profile.is_admin) {
          console.log("User is not an admin, redirecting to chat");
          navigate("/chat");
          return;
        }
        
        localStorage.setItem('user_is_admin', 'true');
        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/chat");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAdmin ? <>{children}</> : null;
};

export function AppRoutes() {
  const [isWaitlistChecking, setIsWaitlistChecking] = useState(true);
  const [shouldShowWaitlist, setShouldShowWaitlist] = useState(false); // Default to false
  const navigate = useNavigate();
  
  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const isAdminLogin = window.location.pathname === '/login' && 
                        window.location.search.includes('admin=true');
    
    if (isAdminRoute || isAdminLogin) {
      console.log("Admin route detected, bypassing waitlist check in AppRoutes");
      setIsWaitlistChecking(false);
      setShouldShowWaitlist(false);
      return;
    }
    
    const checkWaitlistGlobal = async () => {
      try {
        // Reduce attempts and timeout for faster loading
        let attempts = 0;
        const maxAttempts = 2;
        let waitlistData = null;
        
        while (attempts < maxAttempts && waitlistData === null) {
          try {
            console.log(`AppRoutes - Global waitlist check attempt ${attempts + 1}`);
            const { data, error } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'show_waitlist')
              .maybeSingle(); // Use maybeSingle instead of single
              
            if (data && !error) {
              waitlistData = data;
              break;
            } else if (error) {
              console.error(`Attempt ${attempts + 1} error:`, error);
            }
          } catch (fetchError) {
            console.error(`Fetch attempt ${attempts + 1} failed:`, fetchError);
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Reduce timeout from 1000ms to 500ms
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log("AppRoutes - Global waitlist check final status:", waitlistData?.value);
        
        if (!waitlistData) {
          console.warn("Could not fetch waitlist settings - defaulting to NOT show waitlist");
          setShouldShowWaitlist(false);
        } else {
          const waitlistEnabled = !!waitlistData.value;
          console.log("Setting global waitlist enabled to:", waitlistEnabled);
          setShouldShowWaitlist(waitlistEnabled);
        }
        
        if (shouldShowWaitlist && window.location.pathname !== '/' && 
            !isAdminRoute && !isAdminLogin) {
          console.log("Waitlist is enabled, redirecting to home from AppRoutes");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error in global waitlist check:", error);
        setShouldShowWaitlist(false);
      } finally {
        setIsWaitlistChecking(false);
      }
    };
    
    // Set a timeout in case the check takes too long
    const timeoutId = setTimeout(() => {
      if (isWaitlistChecking) {
        console.log("Global waitlist check timed out, proceeding with default (no waitlist)");
        setIsWaitlistChecking(false);
        setShouldShowWaitlist(false);
      }
    }, 3000); // Timeout after 3 seconds
    
    checkWaitlistGlobal();
    
    return () => clearTimeout(timeoutId);
  }, [navigate]);
  
  // Reduce loading time by showing content after a maximum of 2 seconds
  useEffect(() => {
    const forceLoadTimeout = setTimeout(() => {
      if (isWaitlistChecking) {
        console.log("Force loading app content after timeout");
        setIsWaitlistChecking(false);
      }
    }, 2000);
    
    return () => clearTimeout(forceLoadTimeout);
  }, []);
  
  if (isWaitlistChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
        
        <Route path="/chat" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Chat /></ProtectedRoute>} />
        <Route path="/account" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Account /></ProtectedRoute>} />
        <Route path="/settings" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Settings /></ProtectedRoute>} />
        <Route path="/dashboard" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Dashboard /></ProtectedRoute>} />
        <Route path="/release-notes" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.ReleaseNotes /></ProtectedRoute>} />
        <Route path="/refunds" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <ProtectedRoute><LazyRoutes.Refunds /></ProtectedRoute>} />
        
        <Route path="/complete-profile" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.Login />} />
        
        <Route path="/admin" element={<AdminRoute><LazyRoutes.AdminDashboard /></AdminRoute>} />
        
        <Route path="*" element={shouldShowWaitlist ? <LazyRoutes.Index /> : <LazyRoutes.Dashboard />} />
      </Routes>
    </ErrorBoundary>
  );
}
