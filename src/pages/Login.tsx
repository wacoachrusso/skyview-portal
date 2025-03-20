
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { handleAuthSession, handlePasswordReset } from "@/utils/auth/sessionHandler";
import { createNewSession, validateSessionToken } from "@/services/session";
import { LoginForm } from "@/components/auth/LoginForm";
import { useIsMobile } from "@/hooks/use-mobile";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const isMobile = useIsMobile();

  // Check for error param in URL (from Google auth callback)
  const errorParam = searchParams.get("error");
  if (errorParam) {
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: errorParam || "Failed to complete authentication. Please try again."
    });
  }

  const handleLogin = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
        });
      } else {
        console.log("Login successful:", data);
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
        });

        if (data.user) {
          await handleAuthSession(data.user.id, createNewSession, navigate);
          navigate(next);
        }
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
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
            Sign in to SkyGuide
          </h1>
          <p className="text-sm text-gray-400">
            Enter your credentials to access your account
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
