
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Login page mounted");
    checkSession();
  }, []);

  const checkSession = async () => {
    console.log("Checking user session...");
    try {
      setCheckingSession(true);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session:", error);
        setCheckingSession(false);
        return;
      }
      
      if (data.session) {
        console.log("Session found, redirecting to chat");
        
        // Get user profile to determine where to redirect
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type, airline")
          .eq("id", data.session.user.id)
          .maybeSingle();
          
        console.log("Profile check result:", { profile, error: profileError });
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setCheckingSession(false);
          return;
        }
        
        if (profile && profile.user_type && profile.airline) {
          // Profile is complete, redirect to chat
          navigate("/chat", { replace: true });
        } else if (profile) {
          // Profile exists but incomplete
          navigate("/complete-profile", { replace: true });
        } else {
          // No profile found
          navigate("/complete-profile", { replace: true });
        }
      } else {
        console.log("Session check result: No session");
        setCheckingSession(false);
      }
    } catch (error) {
      console.error("Unexpected error checking session:", error);
      setCheckingSession(false);
    }
  };

  const handleLogin = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "",
      });

      if (error) throw error;

      if (data.user) {
        // Check user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }

        // Redirect based on profile status
        if (profile?.account_status === "locked") {
          toast({
            variant: "destructive",
            title: "Account Locked",
            description: "Your account is locked. Please reset your password."
          });
          await supabase.auth.signOut();
          navigate('/forgot-password');
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in."
          });
          
          // Create a new session token for this user
          try {
            const { createNewSession } = await import('@/services/sessionService');
            await createNewSession(data.user.id);
            console.log("Created new session after login");
          } catch (sessionError) {
            console.error("Error creating session after login:", sessionError);
          }
          
          // Redirect to chat
          navigate("/chat", { replace: true });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials."
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-gradient flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-auto">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png')] opacity-5 bg-repeat mix-blend-overlay pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/50 to-brand-slate/50 pointer-events-none" aria-hidden="true" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="glass-morphism rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/20 to-brand-gold/20 rounded-full blur-xl opacity-75 animate-pulse-subtle" aria-hidden="true" />
          
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-3 bg-gradient-to-r from-brand-purple/20 to-brand-gold/20 rounded-full blur-xl opacity-75 animate-pulse-subtle" aria-hidden="true" />
              <img 
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                alt="SkyGuide Logo" 
                className="h-14 w-auto relative"
              />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-gray-300 text-center">
              Sign in to your SkyGuide account
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} loading={loading} />

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-gold hover:text-brand-gold/80 transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
