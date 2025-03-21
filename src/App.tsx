import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, useEffect } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Enhanced InitialSessionCheck component with better payment flow handling
function InitialSessionCheck() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        console.log("Checking initial session on app load");
        
        // Check if user was in the middle of a payment flow
        const paymentInProgress = localStorage.getItem('payment_in_progress') === 'true';
        const postPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
        
        if ((paymentInProgress || postPayment) && window.location.pathname === '/login') {
          console.log("Payment flow interrupted, attempting to recover session");
          
          // Try to restore session from saved tokens
          const savedAccessToken = localStorage.getItem('auth_access_token');
          const savedRefreshToken = localStorage.getItem('auth_refresh_token');
          
          if (savedAccessToken && savedRefreshToken) {
            console.log("Found saved auth tokens, attempting to restore session");
            
            const { data: sessionData, error: restoreError } = await supabase.auth.setSession({
              access_token: savedAccessToken,
              refresh_token: savedRefreshToken
            });
            
            if (restoreError) {
              console.error("Error restoring session from saved tokens:", restoreError);
              // Clear payment flags to prevent login loops
              localStorage.removeItem('payment_in_progress');
              localStorage.removeItem('postPaymentConfirmation');
              localStorage.removeItem('auth_access_token');
              localStorage.removeItem('auth_refresh_token');
            } else if (sessionData.session) {
              console.log("Successfully restored session after payment");
              navigate('/chat', { replace: true });
              return;
            }
          } else {
            // We need to clear these flags if no session can be recovered
            console.log("No saved tokens found after payment, clearing flags");
            localStorage.removeItem('payment_in_progress');
            localStorage.removeItem('postPaymentConfirmation');
            localStorage.removeItem('selected_plan');
          }
        }
        
        // Skip specific routes that handle their own auth
        if (window.location.pathname === '/auth/callback' || 
            window.location.pathname.includes('/stripe-callback')) {
          console.log("Skipping session check for auth callback route");
          return;
        }
        
        // Basic session check
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Active session found for user:", data.session.user.email);
          
          // Check if user just completed payment
          if (postPayment) {
            console.log("Post-payment user with active session, redirecting to chat");
            navigate('/chat', { replace: true });
            return;
          }
          
          // Check user's subscription status
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_plan, subscription_status, query_count')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
          }
          
          console.log("User profile:", profile);
          
          // Free trial ended or not active subscription - redirect to pricing
          if ((profile?.subscription_plan === 'free' && profile?.query_count >= 1) || 
              profile?.subscription_status === 'inactive' ||
              profile?.subscription_plan === 'trial_ended') {
            console.log("Free trial ended or inactive subscription, redirecting to pricing");
            navigate('/?scrollTo=pricing-section', { replace: true });
            return;
          }
          
          // Active subscription or still has free trial - redirect to chat from login pages
          if (window.location.pathname === '/login' || window.location.pathname === '/signup' || window.location.pathname === '/') {
            navigate('/chat', { replace: true });
          }
        } else if (window.location.pathname !== '/login' && 
                 window.location.pathname !== '/signup' && 
                 window.location.pathname !== '/' && 
                 window.location.pathname !== '/auth/callback' &&
                 window.location.pathname !== '/privacy-policy' &&
                 window.location.pathname !== '/about') {
          // No session and trying to access protected route
          console.log("No active session found, redirecting to login");
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
      }
    };
    
    // Delay the session check to ensure components are rendered first
    const timer = setTimeout(() => {
      checkInitialSession();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return null;
}

function App() {
  // Add viewport meta tag for proper mobile display
  useEffect(() => {
    // Check if viewport meta tag exists
    const existingViewport = document.querySelector('meta[name="viewport"]');
    
    if (!existingViewport) {
      // Create and add viewport meta tag if it doesn't exist
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(viewportMeta);
    } else {
      // Update existing viewport meta to ensure it has the right settings
      existingViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LazyMotion features={domAnimation}>
          <BrowserRouter>
            <div className="min-h-[100dvh] bg-luxury-dark">
              <Suspense fallback={
                <div className="flex h-[100dvh] w-full items-center justify-center bg-luxury-dark">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand-purple/30 to-brand-gold/30 rounded-full blur-xl opacity-50 animate-pulse-subtle" />
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent relative" />
                  </div>
                </div>
              }>
                <InitialSessionCheck />
                <AppRoutes />
              </Suspense>
            </div>
            <Toaster />
          </BrowserRouter>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
