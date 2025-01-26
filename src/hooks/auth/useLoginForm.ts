import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLoginFormState } from "../useLoginFormState";
import { useLoginValidation } from "./useLoginValidation";
import { useSessionCreation } from "./useSessionCreation";

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateLoginAttempt } = useLoginValidation();
  const { createNewSession } = useSessionCreation();
  const { 
    loading, 
    setLoading, 
    showPassword, 
    setShowPassword, 
    formData, 
    setFormData 
  } = useLoginFormState();

  // Check if we're in the test environment
  const isTestEnvironment = window.location.pathname.startsWith('/test-app');
  console.log('Current environment:', isTestEnvironment ? 'test' : 'production');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    console.log('Starting login process...');

    try {
      // Clear any existing session data
      localStorage.removeItem('session_token');
      await supabase.auth.signOut();
      
      const { success, data, error } = await validateLoginAttempt(formData, isTestEnvironment);
      
      if (!success || !data?.session) {
        console.log('Login validation failed:', error);
        return;
      }

      console.log('Login successful, creating session');
      const sessionToken = await createNewSession(data.session.user.id);
      
      if (!sessionToken) {
        console.error('Failed to create session');
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });

      // Use the correct path based on environment
      const basePath = isTestEnvironment ? '/test-app' : '';
      console.log('Navigating to:', `${basePath}/dashboard`);
      navigate(`${basePath}/dashboard`);

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