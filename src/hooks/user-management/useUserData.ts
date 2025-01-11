import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export const useUserData = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      console.log("Fetching users data...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      // Filter out any null entries and ensure all required fields are present
      const transformedData: ProfilesRow[] = (data || [])
        .filter(user => user && user.id)
        .map(user => ({
          ...user,
          assistant_id: user.assistant_id || null,
        }));

      console.log("Users data fetched:", transformedData);
      return transformedData;
    },
  });
};