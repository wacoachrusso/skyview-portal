
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        
        // Fetch the most up-to-date profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }
        
        console.log("Loaded user profile:", profile);
        setUserProfile(profile);
      }
    };
    
    loadUserProfile();
    
    // Set up subscription for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          setCurrentUserId(session.user.id);
          
          // Fetch the most up-to-date profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          console.log("Updated user profile after auth change:", profile);
          setUserProfile(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        setUserProfile(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentUserId,
    userProfile
  };
}
