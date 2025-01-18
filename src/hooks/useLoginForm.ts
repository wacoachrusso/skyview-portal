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

  const handleAccountLocked = () => {
    toast({
      variant: "destructive",
      title: "Account locked",
      description: "Your account has been locked due to too many failed login attempts. Please reset your password."
    });
  };

  const handleActiveSessions = () => {
    toast({
      variant: "destructive",
      title: "Active Session Detected",
      description: "There is already an active session. Please log out from other devices first."
    });
  };

  const handleLoginSuccess = async (userId: string) => {
    await createNewSession(userId);
    
    if (formData.rememberMe) {
      console.log('Setting persistent session...');
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
      document.cookie = `sb-refresh-token=${localStorage.getItem('supabase.refresh-token')}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
    }

    toast({
      title: "Welcome back!",
      description: "You have successfully logged in."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      console.log('Starting login process...');
      
      const profileData = await checkExistingProfile(formData.email);

      if (profileData?.account_status === 'locked') {
        handleAccountLocked();
        return;
      }

      if (profileData?.id) {
        const existingSessions = await checkExistingSessions(profileData.id);
        if (existingSessions && existingSessions.length > 0) {
          handleActiveSessions();
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            persistSession: formData.rememberMe
          }
        }
      });

      if (error) {
        console.error('Login error:', error);
        
        if (error.message === 'Invalid login credentials' && profileData) {
          const newAttempts = (profileData.login_attempts || 0) + 1;
          const newStatus = newAttempts >= MAX_LOGIN_ATTEMPTS ? 'locked' : 'active';
          
          await updateLoginAttempts(formData.email, newAttempts, newStatus);

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            handleAccountLocked();
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

      if (!data.user.email_confirmed_at) {
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

      await handleLoginSuccess(data.session.user.id);
      await resetLoginAttempts(formData.email);
      
      // Redirect to chat page after successful login
      console.log('Login successful, redirecting to chat page');
      navigate('/chat');

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