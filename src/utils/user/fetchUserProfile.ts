import { supabase } from "@/integrations/supabase/client";

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    // Remove localStorage usage - return profile data directly
    console.log("Profile fetched successfully:", profile.id);
    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};