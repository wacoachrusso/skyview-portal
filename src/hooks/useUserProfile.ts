
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const loadUserProfile = async (userId: string) => {
    try {
      // Fetch the most up-to-date profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      console.log("Loaded user profile:", profile);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          setCurrentUserId(session.user.id);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      }
    };
    
    initializeUser();
    
    // Set up subscription for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session?.user && mounted) {
          setCurrentUserId(session.user.id);
          await loadUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setCurrentUserId(null);
          setUserProfile(null);
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentUserId,
    userProfile,
    refreshProfile: async () => {
      if (currentUserId) {
        await loadUserProfile(currentUserId);
      }
    }
  };
}
