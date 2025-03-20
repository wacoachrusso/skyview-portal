
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, useEffect } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createNewSession, validateSessionToken } from "@/services/sessionService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to handle initial session check and redirect
function InitialSessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        console.log("Checking initial session on app load");
        
        // First check if we're in a callback route - if so, let the GoogleAuthHandler manage it
        const currentPathname = window.location.pathname;
        if (currentPathname === '/auth/callback') {
          console.log("On auth callback route, letting GoogleAuthHandler manage this");
          return;
        }
        
        // Get session data from Supabase
        const { data } = await supabase.auth.getSession();
        
        // Check if we have an active session
        if (data.session) {
          console.log("Initial session found for user:", data.session.user.id);
          
          // First ensure we have a session token
          let sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) {
            console.log("No session token found, creating new session");
            try {
              await createNewSession(data.session.user.id);
              sessionToken = localStorage.getItem('session_token');
            } catch (error) {
              console.error("Failed to create session token:", error);
            }
          }
          
          // Validate the session token
          const isValid = await validateSessionToken(sessionToken);
          if (!isValid) {
            console.log("Session token invalid, recreating session");
            try {
              await createNewSession(data.session.user.id);
            } catch (error) {
              console.error("Failed to recreate session token:", error);
              // If we can't create a session, redirect to login
              navigate('/login', { replace: true });
              return;
            }
          }
          
          // Check if user has completed profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_type, airline')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Error fetching profile:", error);
            // Only redirect to login if not already there
            if (currentPathname !== '/login' && currentPathname !== '/signup') {
              navigate('/login', { replace: true });
            }
            return;
          }
            
          if (profile?.user_type && profile?.airline) {
            console.log("Profile is complete");
            
            // Only redirect to chat if we're on login, signup, or root
            if (currentPathname === '/login' || currentPathname === '/signup' || currentPathname === '/') {
              console.log("Redirecting to chat");
              navigate('/chat', { replace: true });
            }
          } else if (profile) {
            console.log("Profile exists but is incomplete");
            // Only redirect to signup if not already there
            if (currentPathname !== '/signup') {
              console.log("Redirecting to signup");
              navigate('/signup', { 
                state: { 
                  userId: data.session.user.id, 
                  email: data.session.user.email, 
                  fullName: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || "", 
                  isGoogleSignIn: true 
                },
                replace: true
              });
            }
          } else if (currentPathname !== '/login' && currentPathname !== '/signup' && currentPathname !== '/auth/callback') {
            console.log("No profile found, redirecting to login");
            navigate('/login', { replace: true });
          }
        } else if (currentPathname !== '/login' && currentPathname !== '/signup' && currentPathname !== '/' && currentPathname !== '/auth/callback') {
          // No session and user is trying to access a protected route
          console.log("No active session found, redirecting to login");
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
        // Only redirect to login if not already there
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          navigate('/login', { replace: true });
        }
      }
    };
    
    checkInitialSession();
  }, [navigate, toast]);
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LazyMotion features={domAnimation}>
          <BrowserRouter>
            <div className="min-h-screen bg-luxury-dark">
              <Suspense fallback={
                <div className="flex h-screen w-full items-center justify-center bg-luxury-dark">
                  <div className="relative">
                    {/* Loading indicator with glow */}
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
