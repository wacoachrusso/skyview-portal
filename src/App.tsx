
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

// Component to handle initial session check and redirect
function InitialSessionCheck() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        console.log("Checking initial session on app load");
        const { data } = await supabase.auth.getSession();
        
        if (data.session && window.location.pathname === '/') {
          console.log("Initial session found, redirecting to chat");
          navigate('/chat', { replace: true });
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
      }
    };
    
    checkInitialSession();
  }, [navigate]);
  
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
