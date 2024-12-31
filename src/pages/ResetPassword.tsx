import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get token from URL query parameter
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.error('No reset token provided');
        toast({
          variant: "destructive",
          title: "Invalid Reset Link",
          description: "The password reset link is invalid or has expired."
        });
        navigate('/login');
        return;
      }

      try {
        // Verify the recovery token
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: 'recovery'
        });

        if (error) {
          console.error('Error verifying reset token:', error);
          toast({
            variant: "destructive",
            title: "Invalid Reset Link",
            description: "The password reset link is invalid or has expired."
          });
          navigate('/login');
          return;
        }

        setValidatingToken(false);
      } catch (error) {
        console.error('Error in validateToken:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while validating your reset link."
        });
        navigate('/login');
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  const handlePasswordReset = async (newPassword: string) => {
    if (!token) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been reset successfully."
      });

      // Sign out to clear any existing session
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

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Validating reset link...</p>
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

        <PasswordResetForm 
          onSubmit={handlePasswordReset}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ResetPassword;