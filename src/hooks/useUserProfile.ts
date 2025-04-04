
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useUserProfile() {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log("Loading user profile for ID:", userId);
      setIsLoading(true);
      
      // Fetch the most up-to-date profile data directly from the database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        toast({
          variant: "destructive",
          title: "Profile Error",
          description: "Failed to fetch user profile. Please try again."
        });
        return;
      }
      
      // Set admin status in localStorage for quick access
      if (profile.is_admin) {
        localStorage.setItem('user_is_admin', 'true');
        console.log("Admin status set in localStorage: true");
      } else {
        localStorage.removeItem('user_is_admin');
        console.log("Admin status removed from localStorage");
      }
      
      setUserProfile(profile);
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      try {
        setIsLoading(true);
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log("Session user found:", session.user.id);
          setCurrentUserId(session.user.id);
          await loadUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        setIsLoading(false);
      }
    };
    
    initializeUser();
    
    // Set up subscription for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (mounted) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log("User signed in/updated:", session.user.id);
            setCurrentUserId(session.user.id);
            await loadUserProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setCurrentUserId(null);
          setUserProfile(null);
          localStorage.removeItem('user_is_admin');
          setIsLoading(false);
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    currentUserId,
    userProfile,
    isLoading,
    refreshProfile: async () => {
      if (currentUserId) {
        console.log("Manually refreshing profile for:", currentUserId);
        await loadUserProfile(currentUserId);
      }
    }
  };
}
