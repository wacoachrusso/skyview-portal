import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const checkExistingProfile = async (email: string) => {
  console.log('Checking for existing profile with email:', email);
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  console.log('Profile check result:', { profile, error });
  return { profile, error };
};

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in process');
      setLoading(true);

      // Step 1: Start OAuth flow
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) {
        console.error('Google sign-in error:', signInError);
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: signInError.message || "Failed to sign in with Google.",
        });
        navigate('/login');
        return;
      }

      // Redirect will happen automatically
      console.log('OAuth flow initiated, redirecting to callback');
      
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setLoading(false);
      navigate('/login');
    }
  };

  return { handleGoogleSignIn, loading };
};