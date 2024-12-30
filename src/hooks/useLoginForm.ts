import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting login process...');
      
      // First check if the account is locked
      const { data: profile } = await supabase
        .from('profiles')
        .select('login_attempts, account_status')
        .eq('email', formData.email.trim())
        .single();

      if (profile?.account_status === 'locked') {
        toast({
          variant: "destructive",
          title: "Account locked",
          description: "Your account has been locked due to too many failed login attempts. Please reset your password."
        });
        return;
      }

      // First clear any existing session
      await supabase.auth.signOut({ scope: 'local' });
      console.log('Cleared existing session');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Increment login attempts
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            login_attempts: (profile?.login_attempts || 0) + 1,
            account_status: (profile?.login_attempts || 0) + 1 >= MAX_LOGIN_ATTEMPTS ? 'locked' : 'active'
          })
          .eq('email', formData.email.trim());

        if ((profile?.login_attempts || 0) + 1 >= MAX_LOGIN_ATTEMPTS) {
          toast({
            variant: "destructive",
            title: "Account locked",
            description: "Your account has been locked due to too many failed login attempts. Please reset your password."
          });
          return;
        }

        if (error.message === 'Invalid login credentials') {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: `Incorrect email or password. ${MAX_LOGIN_ATTEMPTS - (profile?.login_attempts || 0) - 1} attempts remaining.`
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
        
        await handleEmailVerification(formData.email);

        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please check your inbox and verify your email address before signing in."
        });
        return;
      }

      console.log('Sign in successful:', data.user?.id);

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
        await supabase.auth.updateUser({
          data: { 
            persistent: true,
            session_expires_in: 60 * 60 * 24 * 14 // 14 days
          }
        });
      }

      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, airline, subscription_plan')
        .eq('id', data.user.id)
        .single();

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });

      if (profile?.user_type && profile?.airline) {
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
        description: "An error occurred. Please try again."
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