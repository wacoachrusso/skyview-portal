import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";

export const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke('send-login-link', {
        body: { 
          email: user.email,
          loginUrl: `${window.location.origin}/auth/callback`
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset. We've sent you a login link via email."
      });

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