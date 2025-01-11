import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const checkDisclaimerConsent = async (userId: string) => {
    console.log("Checking disclaimer consent for user:", userId);
    const { data: consent, error } = await supabase
      .from('disclaimer_consents')
      .select('status')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error checking disclaimer consent:", error);
      return false;
    }

    return consent?.status === 'accepted';
  };

  const handleDisclaimerAccept = async (userId: string) => {
    console.log("Handling disclaimer acceptance for user:", userId);
    const { error } = await supabase
      .from('disclaimer_consents')
      .insert([
        { user_id: userId, status: 'accepted' }
      ]);

    if (error) {
      console.error("Error saving disclaimer consent:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your consent. Please try again."
      });
      return;
    }

    setShowDisclaimer(false);
    toast({
      title: "Welcome to SkyGuide",
      description: "Thank you for accepting the disclaimer."
    });
  };

  const handleDisclaimerReject = async () => {
    console.log("User rejected disclaimer");
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Disclaimer Required",
      description: "You must accept the disclaimer to use SkyGuide."
    });
    navigate('/login');
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        localStorage.clear();
        navigate('/login');
      } else if (session?.user) {
        console.log("Valid session detected");
        setUserEmail(session.user.email);
        
        // Check disclaimer consent
        const hasAccepted = await checkDisclaimerConsent(session.user.id);
        if (!hasAccepted) {
          setShowDisclaimer(true);
        }
        
        // Sign out other sessions when a new sign in occurs
        if (event === 'SIGNED_IN') {
          console.log('New sign-in detected, invalidating other sessions...');
          const currentToken = localStorage.getItem('session_token');
          
          const { error: signOutError } = await supabase
            .rpc('invalidate_other_sessions', {
              p_user_id: session.user.id,
              p_current_session_token: currentToken || ''
            });
          
          if (signOutError) {
            console.error("Error signing out other sessions:", signOutError);
            toast({
              variant: "destructive",
              title: "Session Warning",
              description: "Unable to sign out other sessions. You may be signed in on other devices."
            });
          }
        }
      }
    });

    return () => {
      console.log("Auth state cleanup");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { 
    userEmail,
    showDisclaimer,
    handleDisclaimerAccept: () => session?.user && handleDisclaimerAccept(session.user.id),
    handleDisclaimerReject 
  };
};