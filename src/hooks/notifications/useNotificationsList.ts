import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationsList = () => {
  return useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      console.log("Fetching notifications with profile data...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      console.log("Fetched notifications:", data);
      return data;
    },
  });
};