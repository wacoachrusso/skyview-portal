import { supabase } from "@/integrations/supabase/client";
import { Toast } from "@/hooks/use-toast";

export const togglePromoterStatus = async (
  testerId: string,
  currentStatus: boolean,
  toast: Toast,
  tester: any
) => {
  try {
    console.log("Toggling promoter status:", { testerId, currentStatus });
    const { error } = await supabase
      .from("alpha_testers")
      .update({ is_promoter: !currentStatus })
      .eq("id", testerId);

    if (error) throw error;

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

    toast({
      title: "Success",
      description: `Tester ${currentStatus ? "removed from" : "marked as"} promoter`,
    });

  } catch (error) {
    console.error("Error toggling promoter status:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update promoter status",
    });
  }
};