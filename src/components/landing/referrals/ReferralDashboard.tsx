
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThankYouModal } from "./ThankYouModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Send } from "lucide-react";

export function ReferralDashboard() {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    async function fetchReferralData() {
      try {
        setLoading(true);
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        const userId = session.user.id;
        
        // Fetch user's referrals
        const { data: referralData } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', userId);
        
        if (referralData && referralData.length > 0) {
          setReferrals(referralData);
          
          // Use the latest referral code if we have one
          setReferralCode(referralData[0].referral_code);
        } else {
          // Generate a new code if none exists
          const { data: generatedCode } = await supabase
            .rpc('generate_referral_code');
            
          if (generatedCode) {
            setReferralCode(generatedCode);
          }
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReferralData();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard");
  };

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
        return;
      }
      
      // Check if we need to generate a new code
      let currentReferralCode = referralCode;
      if (!currentReferralCode) {
        const { data: generatedCode } = await supabase
          .rpc('generate_referral_code');
          
        if (generatedCode) {
          currentReferralCode = generatedCode;
          setReferralCode(generatedCode);
        } else {
          throw new Error("Failed to generate referral code");
        }
      }
      
      // Get user's name for the email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      
      // Insert the referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({ 
          referrer_id: session.user.id, 
          referral_code: currentReferralCode,
          referee_email: inviteEmail,
          status: 'pending' 
        });
      
      if (referralError) {
        throw referralError;
      }
      
      // Construct the invite URL
      const inviteUrl = `${window.location.origin}/signup?ref=${currentReferralCode}`;
      
      // Call the invite function
      const { error: inviteError } = await supabase.functions.invoke('send-invite', {
        body: { 
          email: inviteEmail, 
          inviteUrl: inviteUrl,
          inviterName: profile?.full_name || undefined
        }
      });
      
      if (inviteError) {
        throw inviteError;
      }
      
      // Fetch updated referrals list
      const { data: updatedReferrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', session.user.id);
        
      if (updatedReferrals) {
        setReferrals(updatedReferrals);
      }
      
      setShowThankYou(true);
      setInviteEmail("");
      
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-white/5 p-6">
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Your Referral Code</h3>
          <p className="text-gray-300 mb-4">Share this code with friends to earn rewards</p>
          
          <div className="flex items-center space-x-3">
            <div className="bg-slate-700/60 px-4 py-3 rounded-lg border border-white/10 text-xl font-mono text-brand-gold flex-grow">
              {referralCode || "Loading..."}
            </div>
            <Button 
              onClick={handleCopyCode} 
              variant="outline" 
              className="flex items-center space-x-2 bg-slate-700/40 border-white/10 hover:bg-slate-600/50"
            >
              <Copy size={16} />
              <span>Copy</span>
            </Button>
          </div>
        </div>
        
        <div>
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
              disabled={sendingInvite}
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
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Your Referrals</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-300">Loading referrals...</p>
            ) : referrals.length > 0 ? (
              <div className="bg-slate-700/40 rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-600/50">
                    <tr>
                      <th className="px-4 py-3 text-gray-200">Email</th>
                      <th className="px-4 py-3 text-gray-200">Status</th>
                      <th className="px-4 py-3 text-gray-200">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral) => (
                      <tr key={referral.id} className="border-t border-white/5">
                        <td className="px-4 py-3 text-gray-200">{referral.referee_email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            referral.status === 'completed' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {referral.status === 'completed' ? 'Joined' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-300">You haven't made any referrals yet.</p>
            )}
          </div>
        </div>
      </div>
      
      <ThankYouModal 
        isOpen={showThankYou} 
        onClose={handleCloseThankYou} 
        email={inviteEmail}
      />
    </div>
  );
}
