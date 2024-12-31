import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get tokens from URL hash
  const hashParams = new URLSearchParams(location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  useEffect(() => {
    const setupSession = async () => {
      if (!accessToken || !refreshToken) return;

      try {
        // Clear any existing session
        await supabase.auth.signOut();
        
        // Set the recovery session
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('Error setting session:', error);
          toast({
            variant: "destructive",
            title: "Invalid Reset Link",
            description: "The password reset link is invalid or has expired."
          });
          navigate('/login');
        }
      } catch (error) {
        console.error('Error in setupSession:', error);
        navigate('/login');
      }
    };

    setupSession();
  }, [accessToken, refreshToken, navigate, toast]);

  const handlePasswordReset = async (newPassword: string) => {
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid reset link. Please request a new one."
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been reset successfully."
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset password. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken || !refreshToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Invalid Reset Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
            Please request a new one from the login page.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-primary hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Reset Your Password
          </h1>
          <p className="text-muted-foreground">
            Please enter your new password below
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <PasswordResetForm 
            onSubmit={handlePasswordReset}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default ResetPassword;