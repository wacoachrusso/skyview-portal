import { supabase } from "@/integrations/supabase/client";
import { ToastFunction } from "@/hooks/use-toast";

export const deleteTester = async (
  testerId: string,
  toast: ToastFunction,
  tester: any
) => {
  try {
    console.log("Starting complete tester deletion process for:", testerId);

    // Step 1: Delete messages and conversations
    if (tester.profile_id) {
      console.log("Deleting messages and conversations...");
      await supabase
        .from("messages")
        .delete()
        .eq("user_id", tester.profile_id);

      await supabase
        .from("conversations")
        .delete()
        .eq("user_id", tester.profile_id);
    }

    // Step 2: Delete cookie and disclaimer consents
    console.log("Deleting consents...");
    if (tester.profile_id) {
      await supabase.from("cookie_consents").delete().eq("user_id", tester.profile_id);
      await supabase.from("disclaimer_consents").delete().eq("user_id", tester.profile_id);
    }

    // Step 3: Delete notifications
    console.log("Deleting notifications...");
    if (tester.profile_id) {
      await supabase
        .from("notifications")
        .delete()
        .or(`user_id.eq.${tester.profile_id},profile_id.eq.${tester.profile_id}`);
    }

    // Step 4: Delete contract uploads from storage
    console.log("Deleting contract uploads...");
    if (tester.profile_id) {
      const { data: uploads } = await supabase
        .from("contract_uploads")
        .select("file_path")
        .eq("user_id", tester.profile_id);

      if (uploads && uploads.length > 0) {
        await supabase.storage
          .from("contracts")
          .remove(uploads.map(upload => upload.file_path));

        await supabase
          .from("contract_uploads")
          .delete()
          .eq("user_id", tester.profile_id);
      }
    }

    // Step 5: Delete sessions
    console.log("Deleting sessions...");
    if (tester.profile_id) {
      await supabase.from("sessions").delete().eq("user_id", tester.profile_id);
    }

    // Step 6: Delete the profile if it exists
    if (tester.profile_id) {
      console.log("Deleting user profile...");
      await supabase
        .from("profiles")
        .delete()
        .eq("id", tester.profile_id);
    }

    // Step 7: Delete the alpha tester record
    console.log("Deleting alpha tester record...");
    const { error: testerError } = await supabase
      .from("alpha_testers")
      .delete()
      .eq("id", testerId);

    if (testerError) throw testerError;

    // Step 8: Delete the auth user if they exist
    if (tester.profile_id) {
      console.log("Deleting auth user...");
      await supabase.functions.invoke("delete-user-auth", {
        body: { userId: tester.profile_id },
      });
    }

    toast({
      title: "Success",
      description: "Tester and all associated data deleted successfully",
    });

  } catch (error) {
    console.error("Error in complete tester deletion:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to delete tester and associated data",
    });
  }
};