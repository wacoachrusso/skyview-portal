import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useUserProfile() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log("Fetching session data...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Session found, fetching profile...");
          setCurrentUserId(session.user.id);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile:', error);
            toast({
              title: "Error",
              description: "Failed to load user profile",
              variant: "destructive",
            });
            return;
          }

          if (!profile) {
            console.log("No profile found, redirecting to complete profile");
            navigate('/complete-profile');
            return;
          }

          console.log("Profile loaded successfully:", profile);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error in loadUserProfile:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    loadUserProfile();
  }, [navigate, toast]);

  return {
    currentUserId,
    userProfile
  };
}