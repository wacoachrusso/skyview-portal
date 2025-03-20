
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useQueryCounter(currentUserId: string | null, userProfile: any | null) {
  const { toast } = useToast();
  const [isChatDisabled, setIsChatDisabled] = useState(false);

  // Function to increment query count in Supabase
  const incrementQueryCount = useCallback(async (userId: string) => {
    try {
      console.log("Incrementing query count for user:", userId);

      // Step 1: Fetch the current query count
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("subscription_plan, query_count")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }

      // If the profile doesn't exist, throw an error
      if (!profile) {
        throw new Error(`Profile with id ${userId} not found`);
      }

      // Check if user is already at the limit
      if (profile.subscription_plan === "free" && profile.query_count >= 2) {
        setIsChatDisabled(true);
        return profile.query_count; // Return without incrementing
      }

      // Step 2: Calculate the new query count
      const newCount = (profile?.query_count || 0) + 1;
      console.log("New query count:", newCount);

      // Step 3: Update the query count in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ query_count: newCount })
        .eq("id", userId);

      if (updateError) {
        console.error("Update error details:", {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
        });
        throw updateError;
      }

      console.log("Query count updated successfully");
      
      // Step 4: Check if we've hit the limit after incrementing
      if (profile.subscription_plan === "free" && newCount >= 2) {
        setIsChatDisabled(true);
      }
      
      return newCount; // Return the updated query count
    } catch (error) {
      console.error("Error in incrementQueryCount:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }, []);

  return {
    isChatDisabled,
    setIsChatDisabled,
    incrementQueryCount
  };
}
