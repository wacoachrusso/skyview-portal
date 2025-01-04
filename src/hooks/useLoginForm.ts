import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { handleEmailVerification } from "@/utils/authUtils";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const MAX_LOGIN_ATTEMPTS = 3;

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      console.log('Starting login process...');
      
      // First check if the account exists and get its status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('login_attempts, account_status')
        .eq('email', formData.email.trim())
        .single();

      if (profileData?.account_status === 'locked') {
        toast({
          variant: "destructive",
          title: "Account locked",
          description: "Your account has been locked due to too many failed login attempts. Please reset your password."
        });
        setLoading(false);
        return;
      }

      // Check for existing active sessions
      const { data: existingSessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', profileData?.id)
        .eq('status', 'active');

      if (existingSessions && existingSessions.length > 0) {
        toast({
          variant: "destructive",
          title: "Active Session Detected",
          description: "There is already an active session. Please log out from other devices first."
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message === 'Invalid login credentials') {
          // Increment login attempts
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              login_attempts: (profileData?.login_attempts || 0) + 1,
              account_status: (profileData?.login_attempts || 0) + 1 >= MAX_LOGIN_ATTEMPTS ? 'locked' : 'active'
            })
            .eq('email', formData.email.trim());

          if ((profileData?.login_attempts || 0) + 1 >= MAX_LOGIN_ATTEMPTS) {
            toast({
              variant: "destructive",
              title: "Account locked",
              description: "Your account has been locked due to too many failed login attempts. Please reset your password."
            });
            return;
          }

          toast({
            variant: "destructive",
            title: "Login failed",
            description: `Incorrect email or password. ${MAX_LOGIN_ATTEMPTS - (profileData?.login_attempts || 0) - 1} attempts remaining.`
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

      // Check if email is verified
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

      // Create a new session
      await createNewSession(data.session.user.id);

      // Reset login attempts on successful login
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ 
          login_attempts: 0,
          account_status: 'active'
        })
        .eq('email', formData.email.trim());

      if (formData.rememberMe) {
        console.log('Setting persistent session...');
        document.cookie = `refresh_token_expires_at=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; secure; samesite=strict`;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });

      // Check if profile is complete
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('user_type, airline')
        .eq('id', data.user.id)
        .single();

      if (userProfile?.user_type && userProfile?.airline) {
        console.log('Profile complete, redirecting to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Profile incomplete, redirecting to complete-profile');
        navigate('/complete-profile');
      }

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