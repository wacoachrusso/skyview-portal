import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlphaTester } from "../types";
import { useState } from "react";

export const useTesterActions = (testers: AlphaTester[] | undefined, refetch: () => void) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const togglePromoterStatus = async (testerId: string, currentStatus: boolean) => {
    try {
      console.log("Toggling promoter status:", { testerId, currentStatus });
      const { error } = await supabase
        .from("alpha_testers")
        .update({ is_promoter: !currentStatus })
        .eq("id", testerId);

      if (error) throw error;

      const tester = testers?.find(t => t.id === testerId);
      if (tester) {
        console.log("Sending promoter status change email");
        const { error: emailError } = await supabase.functions.invoke("send-alpha-status-email", {
          body: { 
            email: tester.email,
            fullName: tester.full_name,
            status: tester.status,
            isPromoterChange: true,
            becamePromoter: !currentStatus
          },
        });

        if (emailError) {
          console.error("Error sending promoter status change email:", emailError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Status updated but failed to send notification email",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: `Tester ${currentStatus ? "removed from" : "marked as"} promoter`,
      });

      refetch();
    } catch (error) {
      console.error("Error toggling promoter status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update promoter status",
      });
    }
  };

  const updateStatus = async (testerId: string, newStatus: "active" | "inactive" | "removed") => {
    try {
      console.log("Updating tester status:", { testerId, newStatus });
      
      const tester = testers?.find(t => t.id === testerId);
      if (!tester) throw new Error("Tester not found");

      // Only attempt to update profile if profile_id exists
      if (newStatus === "removed" && tester.profile_id) {
        console.log("Updating profile subscription plan for removed tester");
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ subscription_plan: null })
          .eq("id", tester.profile_id);

        if (profileError) {
          console.error("Error updating profile subscription:", profileError);
          throw profileError;
        }
      }

      const { error } = await supabase
        .from("alpha_testers")
        .update({ status: newStatus })
        .eq("id", testerId);

      if (error) throw error;

      console.log("Sending status update email");
      const { error: emailError } = await supabase.functions.invoke("send-alpha-status-email", {
        body: { 
          email: tester.email,
          fullName: tester.full_name,
          status: newStatus,
          isPromoterChange: tester.is_promoter,
          requiresPlan: newStatus === "removed"
        },
      });

      if (emailError) {
        console.error("Error sending status update email:", emailError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Status updated but failed to send notification email",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Tester status updated successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error updating tester status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update tester status",
      });
    }
  };

  const deleteTester = async (testerId: string) => {
    try {
      setIsDeleting(true);
      console.log("Starting complete tester deletion process for:", testerId);

      const tester = testers?.find(t => t.id === testerId);
      if (!tester) throw new Error("Tester not found");

      // Step 1: Delete messages and conversations
      console.log("Deleting messages and conversations...");
      if (tester.profile_id) {
        const { error: messagesError } = await supabase
          .from("messages")
          .delete()
          .eq("user_id", tester.profile_id);

        if (messagesError) {
          console.error("Error deleting messages:", messagesError);
          throw messagesError;
        }

        const { error: conversationsError } = await supabase
          .from("conversations")
          .delete()
          .eq("user_id", tester.profile_id);

        if (conversationsError) {
          console.error("Error deleting conversations:", conversationsError);
          throw conversationsError;
        }
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
        const { error: notificationsError } = await supabase
          .from("notifications")
          .delete()
          .or(`user_id.eq.${tester.profile_id},profile_id.eq.${tester.profile_id}`);

        if (notificationsError) {
          console.error("Error deleting notifications:", notificationsError);
          throw notificationsError;
        }
      }

      // Step 4: Delete contract uploads from storage
      console.log("Deleting contract uploads...");
      if (tester.profile_id) {
        const { data: uploads, error: uploadsError } = await supabase
          .from("contract_uploads")
          .select("file_path")
          .eq("user_id", tester.profile_id);

        if (uploadsError) {
          console.error("Error fetching uploads:", uploadsError);
          throw uploadsError;
        }

        if (uploads && uploads.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("contracts")
            .remove(uploads.map(upload => upload.file_path));

          if (storageError) {
            console.error("Error deleting files from storage:", storageError);
            throw storageError;
          }

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
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", tester.profile_id);

        if (profileError) {
          console.error("Error deleting profile:", profileError);
          throw profileError;
        }
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
        const { error: authError } = await supabase.functions.invoke("delete-user-auth", {
          body: { userId: tester.profile_id },
        });

        if (authError) {
          console.error("Error deleting auth user:", authError);
          // Don't throw here as the main deletion is complete
        }
      }

      toast({
        title: "Success",
        description: "Tester and all associated data deleted successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error in complete tester deletion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete tester and associated data",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    togglePromoterStatus,
    updateStatus,
    deleteTester,
    isDeleting,
  };
};