
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { ThankYouModal } from "./ThankYouModal";

export function EmailInviteForm() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setSendingInvite(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to send invites");
        setSendingInvite(false);
        return;
      }
      
      // Get user's name for the email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .maybeSingle();
      
      // Track the referral in the database
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({ 
          referrer_id: session.user.id, 
          referee_email: inviteEmail,
          status: 'pending' 
        });
      
      if (referralError) {
        console.error("Error creating referral:", referralError);
        throw new Error("Failed to create referral record");
      }
      
      // Construct the invite URL - direct to signup page
      const inviteUrl = `${window.location.origin}/signup`;
      
      // Call the invite function
      const { error: inviteError } = await supabase.functions.invoke('send-invite', {
        body: { 
          email: inviteEmail, 
          inviteUrl: inviteUrl,
          inviterName: profile?.full_name || undefined
        }
      });
      
      if (inviteError) {
        console.error("Error invoking send-invite function:", inviteError);
        throw new Error("Failed to send invitation email");
      }
      
      setShowThankYou(true);
      setInviteEmail("");
      toast.success("Invitation sent successfully!");
      
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-white/5 p-6">
      <h3 className="text-2xl font-bold text-white mb-2">Invite by Email</h3>
      <p className="text-gray-300 mb-4">Send a direct invitation to a colleague</p>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <input 
          type="email" 
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="colleague@airline.com" 
          className="flex-grow px-4 py-3 rounded-lg bg-slate-700/60 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
        />
        <Button 
          onClick={handleSendInvite} 
          className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy flex items-center space-x-2"
          disabled={sendingInvite || !inviteEmail}
        >
          {sendingInvite ? (
            <span>Sending...</span>
          ) : (
            <>
              <Send size={16} />
              <span>Send Invite</span>
            </>
          )}
        </Button>
      </div>
      
      <ThankYouModal 
        isOpen={showThankYou} 
        onClose={handleCloseThankYou} 
        email={inviteEmail}
      />
    </div>
  );
}
