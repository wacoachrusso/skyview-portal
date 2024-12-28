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
      
      // First clear any existing session
      await supabase.auth.signOut({ scope: 'local' });
      console.log('Cleared existing session');

      // Attempt new sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Incorrect email or password. Please try again."
        });
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
      console.log('Session established:', data.session.access_token);

      if (formData.rememberMe) {
        console.log('Setting persistent session...');
        const { error: persistError } = await supabase.auth.updateUser({
          data: { 
            persistent: true,
            session_expires_in: 60 * 60 * 24 * 14 // 14 days
          }
        });

        if (persistError) {
          console.error('Error setting persistent session:', persistError);
        }
      }

      // Check if profile is complete
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, airline, subscription_plan')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

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