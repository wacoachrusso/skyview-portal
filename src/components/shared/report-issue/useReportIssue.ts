import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportIssueFormData } from "./types";

export function useReportIssue(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ReportIssueFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting issue report:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          profile_id: user.id,
          title: `Issue Report: ${data.title}`,
          message: data.description,
          type: "system",  // Changed from "support" to "system" to match allowed values
          notification_type: "system"
        });

      if (error) {
        console.error("Error submitting issue report:", error);
        throw error;
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. We'll look into this issue.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error submitting issue report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
}