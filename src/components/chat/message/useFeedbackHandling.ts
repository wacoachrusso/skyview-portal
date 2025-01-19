import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFeedbackHandling(messageId: string, isCurrentUser: boolean) {
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeedback = async () => {
      if (isCurrentUser) return;
      
      const { data, error } = await supabase
        .from('message_feedback')
        .select('*')
        .eq('message_id', messageId)
        .single();

      if (!error && data) {
        setFeedback(data);
      }
    };

    fetchFeedback();
  }, [messageId, isCurrentUser]);

  const handleFeedback = async (rating: number, isIncorrect: boolean = false, feedbackText?: string) => {
    if (isCurrentUser) return;
    
    setIsSubmittingFeedback(true);
    try {
      const { data, error } = await supabase
        .from('message_feedback')
        .upsert({
          message_id: messageId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          rating,
          is_incorrect: isIncorrect,
          feedback_text: feedbackText
        });

      if (error) throw error;

      setFeedback({ rating, is_incorrect: isIncorrect, feedback_text: feedbackText });
      
      toast({
        title: isIncorrect ? "Message Flagged" : "Feedback submitted",
        description: isIncorrect 
          ? "Thank you for your feedback. Our team will review this message."
          : "Thank you for your feedback!",
        variant: isIncorrect ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return {
    isSubmittingFeedback,
    feedback,
    handleFeedback
  };
}