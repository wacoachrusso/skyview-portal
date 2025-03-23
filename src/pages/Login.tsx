import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { handleAuthSession, handlePasswordReset } from "@/utils/auth/sessionHandler";
import { createNewSession, validateSessionToken } from "@/services/session";
import { LoginForm } from "@/components/auth/LoginForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { handleSignIn } from "@/utils/signInUtils";
import { navigateWithoutRedirectCheck } from "@/utils/navigation";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const isAdminLogin = searchParams.get("admin") === "true";
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.getItem('login_in_progress') === 'true') {
        setInitialCheckDone(true);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("User already authenticated, redirecting to chat");
        localStorage.setItem('skip_initial_redirect', 'true');
        navigate('/chat', { replace: true });
      }
      setInitialCheckDone(true);
    };
    
    checkAuth();
  }, [navigate]);

  const errorParam = searchParams.get("error");
  useEffect(() => {
    if (errorParam && initialCheckDone) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorParam || "Failed to complete authentication. Please try again."
      });
    }
  }, [errorParam, toast, initialCheckDone]);

  const handleLogin = async (email: string, password?: string, rememberMe?: boolean) => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please provide both email and password.",
      });
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem('login_in_progress', 'true');
      
      const success = await handleSignIn(email, password, rememberMe);
      
      if (success) {
        console.log("Login successful");
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
        });

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await handleAuthSession(user.id, createNewSession, navigate);
          
          if (isAdminLogin) {
            console.log("Admin login detected, checking if user is an admin");
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', user.id)
              .single();
              
            if (profile?.is_admin) {
              console.log("User is an admin, redirecting to admin dashboard");
              localStorage.setItem('user_is_admin', 'true');
              navigateWithoutRedirectCheck('/admin');
              return;
            } else {
              console.log("User is NOT an admin, regular login flow");
            }
          }
          
          navigateWithoutRedirectCheck('/chat');
        }
      } else {
        localStorage.removeItem('login_in_progress');
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      localStorage.removeItem('login_in_progress');
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordResetting(true);

    if (!passwordResetEmail) {
      toast({
        variant: "destructive",
        title: "Reset Error",
        description: "Please enter your email address.",
      });
      setIsPasswordResetting(false);
      return;
    }

    const { success, error } = await handlePasswordReset(passwordResetEmail);

    if (success) {
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox to reset your password.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Reset Error",
        description: error || "Failed to send password reset email.",
      });
    }

    setIsPasswordResetting(false);
  };

  if (!initialCheckDone) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <img
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
            alt="SkyGuide Logo"
            className="h-12 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {isAdminLogin ? "Admin Sign In" : "Sign in to SkyGuide"}
          </h1>
          <p className="text-sm text-gray-400">
            {isAdminLogin 
              ? "Enter your credentials to access admin dashboard" 
              : "Enter your credentials to access your account"}
          </p>
        </div>

        <div className="rounded-xl bg-card-gradient border border-white/10 p-6 shadow-xl backdrop-blur-sm">
          <LoginForm onSubmit={handleLogin} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Login;
