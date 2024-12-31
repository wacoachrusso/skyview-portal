import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DisclaimerDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.user) return;

        console.log('Checking disclaimer consent for user:', session.user.id);
        const { data: consent, error } = await supabase
          .from('disclaimer_consents')
          .select('status')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking consent:', error);
          return;
        }

        if (!consent) {
          console.log('No consent found, showing disclaimer');
          setOpen(true);
        } else {
          console.log('Consent already recorded:', consent.status);
        }
      } catch (error) {
        console.error('Error in checkConsent:', error);
      }
    };

    checkConsent();
  }, []);

  const handleConsent = async (accepted: boolean) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to continue.",
        });
        navigate('/login');
        return;
      }

      console.log('Recording consent decision:', accepted);
      const { error } = await supabase
        .from('disclaimer_consents')
        .insert({
          user_id: session.user.id,
          status: accepted ? 'accepted' : 'rejected'
        });

      if (error) {
        console.error('Error recording consent:', error);
        throw error;
      }

      if (accepted) {
        toast({
          title: "Welcome to SkyGuide",
          description: "Thank you for accepting the disclaimer.",
        });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must accept the disclaimer to use SkyGuide.",
        });
        await supabase.auth.signOut();
        navigate('/');
      }
    } catch (error) {
      console.error('Error handling consent:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record your response. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Important Disclaimer</DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p>
              The information provided by SkyGuide is intended for general informational purposes only and is based on the interpretation of union contracts. While we strive to ensure accuracy, SkyGuide can sometimes make mistakes.
            </p>
            <p>
              We do not guarantee the completeness, reliability, or timeliness of the information. Users are encouraged to consult their union representatives or official union documents for definitive answers to contractual questions.
            </p>
            <p>
              By clicking "I Accept" below, you acknowledge that you understand and agree to these terms.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleConsent(false)}
            disabled={loading}
          >
            Decline
          </Button>
          <Button
            onClick={() => handleConsent(true)}
            className="bg-brand-gold hover:bg-brand-gold/90 text-black"
            disabled={loading}
          >
            {loading ? "Processing..." : "I Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};