import { supabase } from "@/integrations/supabase/client";

export const deleteUserFromAuthSystem = async (userId: string) => {
  console.log("Deleting user from auth system:", userId);
  
  try {
    const { data, error } = await supabase.functions.invoke("delete-user-auth", {
      body: { userId },
    });

    if (error) {
      console.error("Error response from delete-user-auth:", error);
      throw new Error(error.message || "Error deleting user from auth system");
    }

    if (!data) {
      throw new Error("No response from delete-user-auth function");
    }

    return data;
  } catch (error) {
    console.error("Error in deleteUserFromAuthSystem:", error);
    throw error;
  }
};