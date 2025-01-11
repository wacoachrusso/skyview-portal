import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlphaTester } from "../types";

export const useTesterActions = (testers: AlphaTester[] | undefined, refetch: () => void) => {
  const { toast } = useToast();

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

  return {
    togglePromoterStatus,
    updateStatus,
  };
};