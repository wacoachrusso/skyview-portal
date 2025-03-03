import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDisclaimerCheck = (userId) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDisclaimerStatus = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has already seen the disclaimer
        const { data, error } = await supabase
          .from('disclaimer_consents')
          .select('status, has_seen_chat_disclaimer')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGSQL_ERROR_NO_DATA_FOUND') {
          console.error('Error checking disclaimer status:', error);
          setLoading(false);
          return;
        }

        if (!data) {
          // If no record exists, user hasn't seen disclaimer
          setShowDisclaimer(true);
        } else {
          // If record exists, check status
          setShowDisclaimer(data.status !== 'accepted');
        }
      } catch (error) {
        console.error('Unexpected error checking disclaimer status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkDisclaimerStatus();
  }, [userId]);

  const acceptDisclaimer = async () => {
    if (!userId) return;

    try {
      // Update or insert disclaimer record
      const { error } = await supabase
        .from('disclaimer_consents')
        .upsert({
          user_id: userId,
          status: 'accepted',
          has_seen_chat_disclaimer: true,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving disclaimer acceptance:', error);
        return;
      }

      setShowDisclaimer(false);
    } catch (error) {
      console.error('Unexpected error saving disclaimer acceptance:', error);
    }
  };

  const rejectDisclaimer = () => {
    // Handle rejection - typically this would redirect to logout
    // For simplicity, we're just setting showDisclaimer to false
    setShowDisclaimer(false);
  };

  return {
    showDisclaimer,
    loading,
    acceptDisclaimer,
    rejectDisclaimer
  };
};