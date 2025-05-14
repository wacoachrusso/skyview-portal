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

    if (profile.is_admin) {
      localStorage.setItem("user_is_admin", "true");
      console.log("Admin status set in localStorage: true");
    } else {
      localStorage.removeItem("user_is_admin");
      console.log("Admin status removed from localStorage");
    }

    localStorage.setItem("user_profile", JSON.stringify(profile));
    localStorage.setItem("auth_user_name", profile.full_name);

    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
