
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDisclaimerDialog(currentUserId: string | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [firstLogin, setFirstLogin] = useState(false);

  const checkDisclaimerStatus = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if user has seen the disclaimer
      const { data: disclaimerRecord, error: disclaimerError } = await supabase
        .from('disclaimer_consents')
        .select('has_seen_chat_disclaimer')
        .eq('user_id', session.user.id)
        .single();
        
      if (disclaimerError && disclaimerError.code !== 'PGSQL_NO_ROWS_RETURNED') {
        console.error('Error checking disclaimer status:', disclaimerError);
      }
        
      // If no record or hasn't seen disclaimer, show disclaimer
      if (!disclaimerRecord || !disclaimerRecord.has_seen_chat_disclaimer) {
        setFirstLogin(true);
        setShowDisclaimer(true);
      }
    } catch (error) {
      console.error('Error checking disclaimer status:', error);
    }
  }, [currentUserId]);

  const handleAcceptDisclaimer = async () => {
    try {
      if (!currentUserId) return;
      
      // Record that user has seen the disclaimer
      const { error } = await supabase
        .from('disclaimer_consents')
        .upsert({ 
          user_id: currentUserId, 
          has_seen_chat_disclaimer: true,
          status: 'accepted',
          created_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });
        
      if (error) {
        console.error('Error saving disclaimer acceptance:', error);
        return;
      }
      
      // Close the disclaimer dialog
      setShowDisclaimer(false);
    } catch (error) {
      console.error('Error accepting disclaimer:', error);
    }
  };
  
  const handleRejectDisclaimer = async () => {
    // Sign out if they reject the disclaimer
    await supabase.auth.signOut();
    navigate('/');
    toast({
      title: "Disclaimer Declined",
      description: "You must accept the disclaimer to use the service.",
      duration: 5000,
    });
  };

  return {
    showDisclaimer,
    setShowDisclaimer,
    firstLogin,
    checkDisclaimerStatus,
    handleAcceptDisclaimer,
    handleRejectDisclaimer
  };
}
