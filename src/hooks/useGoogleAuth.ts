
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createNewSession } from "@/services/sessionService";

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Initiating Google sign in");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error("Google sign in error:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      }
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, loading };
};
