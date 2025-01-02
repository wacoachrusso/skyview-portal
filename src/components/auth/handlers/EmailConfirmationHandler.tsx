import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";
import { useToast } from "@/hooks/use-toast";

export const EmailConfirmationHandler = () => {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndPayment = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      setUserId(session.user.id);

      // Check if this is a post-payment confirmation
      const isPostPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
      if (isPostPayment) {
        setShowDisclaimer(true);
        localStorage.removeItem('postPaymentConfirmation');
      } else {
        navigate('/dashboard');
      }
    };

    checkAuthAndPayment();
  }, [navigate]);

  const handleAcceptDisclaimer = async () => {
    if (!userId) return;

    try {
      const { error: upsertError } = await supabase
        .from('disclaimer_consents')
        .upsert({
          user_id: userId,
          status: 'accepted'
        });

      if (upsertError) throw upsertError;

      toast({
        title: "Welcome to SkyGuide",
        description: "Your account is now ready to use.",
      });
      navigate('/chat');
    } catch (error) {
      console.error('Error updating disclaimer consent:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your consent. Please try again.",
      });
    }
  };

  const handleRejectDisclaimer = () => {
    navigate('/dashboard');
  };

  return (
    <DisclaimerDialog
      open={showDisclaimer}
      onAccept={handleAcceptDisclaimer}
      onReject={handleRejectDisclaimer}
    />
  );
};