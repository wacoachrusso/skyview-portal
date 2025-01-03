import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportIssueFormData } from "./types";

export const useReportIssue = (onClose: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ReportIssueFormData) => {
    setIsSubmitting(true);
    console.log("Submitting issue report:", data);

    try {
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
        throw error;
      }

      toast({
        title: "Success",
        description: "Your issue has been reported successfully.",
        duration: 3000,
      });

      onClose();
    } catch (error) {
      console.error("Error submitting issue:", error);
      toast({
        title: "Error",
        description: "Failed to submit issue. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};