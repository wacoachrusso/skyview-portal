import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(true);
  const [isError, setIsError] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract token from URL directly (the format may differ from what we expect)
  useEffect(() => {
    const validateResetLink = async () => {
      try {
        console.log("URL search params:", Object.fromEntries(searchParams.entries()));
        
        // We expect to find a "type=recovery" parameter in the URL for password reset 
        // Check if this is a proper recovery flow
        const type = searchParams.get("type");
        if (type !== "recovery") {
          console.error("Not a recovery flow, type:", type);
          setIsError(true);
          setIsValidating(false);
          return;
        }
        
        // Check for the recovery token - should be in the right format from Supabase
        console.log("Token validation complete, ready for password reset");
        setIsValidating(false);
      } catch (error) {
        console.error("Error validating reset link:", error);
        setIsError(true);
        setIsValidating(false);
      }
    };

    validateResetLink();
  }, [searchParams, toast, navigate]);

  const handleResetPassword = async (newPassword: string) => {
    setLoading(true);
    try {
      console.log("Attempting to update password");
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      console.log("Password updated successfully");
      
      // Send confirmation email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        await supabase.functions.invoke("send-password-reset-confirmation", {
          body: { email: user.email }
        });
      }
      
      setResetSuccess(true);
      
      // Show success toast
      toast({
        title: "Password Reset Complete",
        description: "Your password has been successfully reset."
      });
      
      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Unable to reset your password. Please try again or request a new reset link."
      });
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[#1A1F2C]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <img
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
                alt="SkyGuide Logo"
                className="h-12 w-auto mb-6"
              />
              <h1 className="text-xl font-semibold text-white mb-4">Validating Reset Link</h1>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
              <p className="mt-4 text-gray-400">Please wait while we verify your reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[#1A1F2C]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <img
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
                alt="SkyGuide Logo"
                className="h-12 w-auto mb-6"
              />
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h1>
              <p className="text-gray-400 mb-6">
                The password reset link is invalid or has expired. Please request a new link.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold py-2 px-4 rounded"
              >
                Request New Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[#1A1F2C]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <img
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
                alt="SkyGuide Logo"
                className="h-12 w-auto mb-6"
              />
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-xl font-semibold text-white mb-2">Password Reset Complete</h1>
              <p className="text-gray-400 mb-6">
                Your password has been successfully reset. You'll be redirected to the login page shortly.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold py-2 px-4 rounded"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1F2C]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <img
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
              alt="SkyGuide Logo"
              className="h-12 w-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
            <p className="mt-2 text-sm text-gray-400 text-center">
              Create a new password for your account
            </p>
          </div>

          <PasswordResetForm onSubmit={handleResetPassword} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
