import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { ThankYouModal } from "./ThankYouModal";
import { useTheme } from "@/components/theme-provider";

export function EmailInviteForm() {
  const { theme } = useTheme();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form default submission
    
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
      
      console.log("Session found, getting user profile");
      
      // Get user's name for the email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .maybeSingle();
      
      console.log("Profile data:", profile);
      
      // Generate a referral code using the database function
      const { data: referralCodeData, error: codeError } = await supabase
        .rpc('generate_referral_code');
        
      if (codeError) {
        console.error("Error generating referral code:", codeError);
        throw new Error("Failed to generate referral code");
      }
      
      console.log("Referral code generated:", referralCodeData);
      
      const referralCode = referralCodeData || `SKY${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // Track the referral in the database
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({ 
          referrer_id: session.user.id, 
          referee_email: inviteEmail,
          referral_code: referralCode,
          status: 'pending' 
        });
      
      if (referralError) {
        console.error("Error creating referral:", referralError);
        throw new Error("Failed to create referral record");
      }
      
      console.log("Referral record created, sending email");
      
      // Construct the invite URL - direct to signup page
      const inviteUrl = `${window.location.origin}/signup?ref=${referralCode}`;
      
      console.log("Invite URL:", inviteUrl);
      
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
      
      console.log("Invitation email sent successfully");
      
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
    <div 
      className={`${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-white/5" 
          : "bg-gradient-to-br from-slate-100 to-white border-slate-200"
      } rounded-xl shadow-xl border p-6`} 
      role="region" 
      aria-labelledby="invite-form-heading"
    >
      <h3 
        id="invite-form-heading" 
        className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"} mb-2`}
      >
        Invite by Email
      </h3>
      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}>
        Send a direct invitation to a colleague
      </p>
      
      <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <label htmlFor="colleague-email" className="sr-only">Colleague Email</label>
        <input 
          type="email" 
          id="colleague-email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="colleague@airline.com" 
          className={`flex-grow px-4 py-3 rounded-lg ${
            theme === "dark" 
              ? "bg-slate-700/60 border-white/10 text-white placeholder:text-gray-400" 
              : "bg-slate-100 border-slate-200 text-slate-800 placeholder:text-gray-500"
          } border focus:outline-none focus:ring-2 focus:ring-brand-gold/50`}
          required
          aria-required="true"
          aria-describedby="email-hint"
        />
        <span id="email-hint" className="sr-only">Enter your colleague's email address to send them an invitation</span>
        <Button 
          type="submit"
          className="cta-button primary-cta bg-brand-gold hover:bg-brand-gold/90 text-brand-navy flex items-center space-x-2 high-contrast-focus"
          disabled={sendingInvite || !inviteEmail}
          aria-busy={sendingInvite}
        >
          {sendingInvite ? (
            <span>Sending...</span>
          ) : (
            <>
              <Send size={16} aria-hidden="true" />
              <span>Share with Colleague</span>
            </>
          )}
        </Button>
      </form>
      
      <ThankYouModal 
        isOpen={showThankYou} 
        onClose={handleCloseThankYou} 
        email={inviteEmail}
      />
    </div>
  );
}
