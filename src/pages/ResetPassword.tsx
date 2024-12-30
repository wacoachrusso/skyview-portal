import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";

export const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if we have a valid session and are in password reset mode
  useEffect(() => {
    const checkSession = async () => {
      const isPasswordResetMode = localStorage.getItem('password_reset_mode') === 'true';
      
      if (!isPasswordResetMode) {
        console.log('Not in password reset mode');
        navigate('/login', { replace: true });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No valid session for password reset');
        navigate('/login', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handlePasswordReset = async (newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords match."
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Clear the password reset mode flag
      localStorage.removeItem('password_reset_mode');
      
      // Ensure user is signed out
      await supabase.auth.signOut();

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-password-reset-confirmation', {
        body: { email: (await supabase.auth.getUser()).data.user?.email }
      });

      if (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset. Please check your email for confirmation."
      });

      // Use replace to prevent back navigation
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Reset Your Password</h2>
          <p className="text-muted-foreground mt-2">Please enter your new password below</p>
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