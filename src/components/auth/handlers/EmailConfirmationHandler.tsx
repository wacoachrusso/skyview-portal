import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const EmailConfirmationHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndPayment = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Check if this is a post-payment confirmation
      const isPostPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
      if (isPostPayment) {
        localStorage.removeItem('postPaymentConfirmation');
        toast({
          title: "Welcome to SkyGuide",
          description: "Your account is now ready to use.",
        });
        navigate('/chat');
      } else {
        navigate('/dashboard');
      }
    };

    checkAuthAndPayment();
  }, [navigate, toast]);

  return null;
};