import { useState } from "react";
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

  // Get access token from URL hash
  const params = new URLSearchParams(location.hash.substring(1));
  const accessToken = params.get('access_token');

  const handlePasswordReset = async (newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords match."
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Please log in with your new password."
      });

      // Redirect to login page
      navigate('/login', { replace: true });
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

  if (!accessToken) {
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