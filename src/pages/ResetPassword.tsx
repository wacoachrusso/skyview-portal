import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { usePasswordResetHandler } from "@/components/auth/handlers/PasswordResetHandler";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isValidResetAttempt, setIsValidResetAttempt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get tokens from URL
  const params = new URLSearchParams(location.hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  
  const { processPasswordReset } = usePasswordResetHandler(accessToken, refreshToken);

  useEffect(() => {
    const validateResetAttempt = async () => {
      try {
        console.log('Validating reset attempt with tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
        const isValid = await processPasswordReset();
        console.log('Reset attempt validation result:', isValid);
        setIsValidResetAttempt(isValid);
      } catch (error) {
        console.error('Error validating reset attempt:', error);
        setIsValidResetAttempt(false);
        toast({
          variant: "destructive",
          title: "Invalid Reset Link",
          description: "The password reset link is invalid or has expired. Please request a new one."
        });
        navigate('/login');
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateResetAttempt();
  }, [processPasswordReset, navigate, toast, accessToken, refreshToken]);

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
      console.log('Attempting to update password');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }

      console.log('Password updated successfully');
      
      // Sign out the user
      await supabase.auth.signOut();
      console.log('User signed out after password reset');

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

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidResetAttempt) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy">
            Reset Your Password
          </h1>
          <p className="text-muted-foreground">
            Please enter your new password below
          </p>
        </div>

        <div className="bg-white/95 shadow-xl rounded-lg p-6">
          <PasswordResetForm 
            onSubmit={handlePasswordReset}
            loading={loading}
          />
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-muted-foreground hover:text-brand-navy transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;