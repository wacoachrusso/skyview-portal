import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { PasswordResetHandler } from "@/components/auth/handlers/PasswordResetHandler";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [isValidResetAttempt, setIsValidResetAttempt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const validateResetAttempt = async () => {
      try {
        // Get access_token and refresh_token from URL
        const params = new URLSearchParams(location.hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        console.log('Validating reset attempt with tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

        const { processPasswordReset } = PasswordResetHandler({ 
          accessToken, 
          refreshToken 
        });

        const isValid = await processPasswordReset();
        console.log('Reset attempt validation result:', isValid);
        
        setIsValidResetAttempt(isValid);
        
        if (!isValid) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error validating reset attempt:', error);
        setIsValidResetAttempt(false);
        navigate('/login');
      }
    };

    validateResetAttempt();
  }, [navigate, location]);

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
        title: "Password updated",
        description: "Your password has been successfully reset. Please log in with your new password."
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

  if (!isValidResetAttempt) {
    return null; // Don't render anything while validating or if invalid
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
          <p className="text-gray-300 mt-2">Please enter your new password below</p>
        </div>

        <PasswordResetForm 
          onSubmit={handlePasswordReset}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ResetPassword;