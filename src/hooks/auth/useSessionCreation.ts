import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSessionCreation = () => {
  const { toast } = useToast();

  const createNewSession = async (userId: string) => {
    console.log('Creating new session for user:', userId);
    
    try {
      const sessionToken = crypto.randomUUID();
      const { error } = await supabase
        .from('sessions')
        .insert([{
          user_id: userId,
          session_token: sessionToken,
          status: 'active'
        }]);

      if (error) throw error;

      localStorage.setItem('session_token', sessionToken);
      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Failed to create session. Please try again.",
      });
      return null;
    }
  };

  return { createNewSession };
};