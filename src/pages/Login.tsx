import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { handlePasswordReset } from "@/utils/auth/sessionHandler";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";
import { AuthLoginForm } from "@/components/auth/AuthLoginForm";

const Login = () => {
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      // Skip this check if we're already in login flow
      if (localStorage.getItem("login_in_progress") === "true") {
        setInitialCheckDone(true);
        return;
      }

      // Check if user is already logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("User already authenticated, redirecting to chat");
        // Use the utility to break potential redirect loops
        localStorage.setItem("skip_initial_redirect", "true");
        navigate("/chat", { replace: true });
      }
      setInitialCheckDone(true);
    };

    checkAuth();
  }, [navigate]);

  // Check for error param in URL (from Google auth callback)
  const errorParam = searchParams.get("error");
  useEffect(() => {
    if (errorParam && initialCheckDone) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description:
          errorParam || "Failed to complete authentication. Please try again.",
      });
    }
  }, [errorParam, toast, initialCheckDone]);

  // Hide the login form until initial check is complete to prevent flashing
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
        {/* Back to home link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
          aria-label="Back to home page"
        >
          <ArrowLeft size={isMobile ? 16 : 18} />
          <span>Back to Home</span>
        </Link>

        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <img
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
            alt="SkyGuide Logo"
            className="h-12 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Sign in to SkyGuide
          </h1>
          <p className="text-sm text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>

        <AuthLoginForm />
      </div>
    </div>
  );
};

export default Login;