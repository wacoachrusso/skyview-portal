import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        const tokenHash = token.split('#')[1] || token;
        console.log('Verifying token hash:', tokenHash);

        // First ensure we're starting fresh
        await supabase.auth.signOut();

        // Verify the recovery token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
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

        console.log('Token verified successfully:', data);
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
      
      // Show success message and redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-slate to-brand-navy flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <LoadingSpinner size="lg" />
          <p className="text-white/80">Validating your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-slate to-brand-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 rounded-full flex items-center justify-center border border-brand-gold/30 shadow-lg shadow-brand-gold/5">
            <LockKeyhole className="w-10 h-10 text-brand-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-300 max-w-sm mx-auto">
              Create a new secure password for your account. Make sure it's unique and hard to guess.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-xl">
          <PasswordResetForm 
            onSubmit={handlePasswordReset}
            loading={loading}
          />
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white hover:bg-white/5 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;