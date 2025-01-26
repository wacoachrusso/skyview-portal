import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { handleEmailVerification } from "@/utils/authUtils";
import { useLoginFormState, LoginFormData } from "./useLoginFormState";
import { 
  checkExistingProfile, 
  checkExistingSessions, 
  updateLoginAttempts,
  resetLoginAttempts
} from "@/services/loginService";

const MAX_LOGIN_ATTEMPTS = 3;

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const { 
    loading, 
    setLoading, 
    showPassword, 
    setShowPassword, 
    formData, 
    setFormData 
  } = useLoginFormState();

  const isTestEnvironment = window.location.pathname.startsWith('/test-app');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    console.log('Starting login process...');

    try {
      // Clear any existing session data
      localStorage.removeItem('session_token');
      await supabase.auth.signOut();
      
      const profileData = await checkExistingProfile(formData.email);

      if (profileData?.account_status === 'locked') {
        toast({
          variant: "destructive",
          title: "Account locked",
          description: "Your account has been locked. Please reset your password."
        });
        return;
      }

      if (profileData?.id) {
        const existingSessions = await checkExistingSessions(profileData.id);
        if (existingSessions && existingSessions.length > 0 && !isTestEnvironment) {
          toast({
            variant: "destructive",
            title: "Active Session Detected",
            description: "There is already an active session. Please log out from other devices first."
          });
          return;
        }
      }

      console.log('Attempting to sign in user:', formData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        if (error.message === 'Invalid login credentials' && profileData) {
          const newAttempts = (profileData.login_attempts || 0) + 1;
          const newStatus = newAttempts >= MAX_LOGIN_ATTEMPTS ? 'locked' : 'active';
          
          await updateLoginAttempts(formData.email, newAttempts, newStatus);

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            toast({
              variant: "destructive",
              title: "Account locked",
              description: "Your account has been locked. Please reset your password."
            });
            return;
          }

          toast({
            variant: "destructive",
            title: "Login failed",
            description: `Incorrect email or password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message
          });
        }
        return;
      }

      if (!data.session) {
        console.error('No session created after login');
        throw new Error('No session created');
      }

      if (!data.user.email_confirmed_at && !isTestEnvironment) {
        console.log('Email not verified');
        await supabase.auth.signOut();
        
        const verificationResult = await handleEmailVerification(formData.email);
        if (!verificationResult.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: verificationResult.error || "Failed to send verification email"
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please check your inbox and verify your email address before signing in."
        });
        return;
      }

      console.log('Login successful, handling post-login actions');
      await createNewSession(data.session.user.id);
      await resetLoginAttempts(formData.email);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });

      // Navigate based on environment
      navigate(isTestEnvironment ? '/test-app/dashboard' : '/dashboard');

    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    showPassword,
    formData,
    setShowPassword,
    setFormData,
    handleSubmit
  };
};