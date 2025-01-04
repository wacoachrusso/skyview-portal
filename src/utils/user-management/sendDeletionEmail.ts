import { supabase } from "@/integrations/supabase/client";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export const sendDeletionEmail = async (user: ProfilesRow) => {
  console.log("Sending deletion notification email to:", user.email);
  
  try {
    const { error } = await supabase.functions.invoke(
      "send-account-status-email",
      {
        body: { 
          email: user.email, 
          status: "deleted",
          fullName: user.full_name || "User"
        },
      }
    );

    if (error) {
      console.error("Error sending deletion email:", error);
      // Don't throw here as email sending is not critical
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in sendDeletionEmail:", error);
    return false;
  }
};