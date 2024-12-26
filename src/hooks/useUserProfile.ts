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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
    };
    loadUserProfile();
  }, []);

  return {
    currentUserId,
    userProfile
  };
}