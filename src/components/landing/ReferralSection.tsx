import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ReferralSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting referral for email:", email);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to refer someone.",
          variant: "destructive",
        });
        return;
      }

      // First, generate the referral code
      const { data: referralCode, error: codeError } = await supabase
        .rpc('generate_referral_code');

      if (codeError) throw codeError;

      // Then, create the referral with the generated code
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referee_email: email,
          referral_code: referralCode,
        });

      if (insertError) throw insertError;

      toast({
        title: "Referral sent!",
        description: "Your friend will receive an invitation email shortly.",
      });
      setEmail("");
    } catch (error) {
      console.error("Error creating referral:", error);
      toast({
        title: "Error",
        description: "Failed to send referral. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-brand-navy to-brand-slate py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Share SkyGuide & Get Rewarded
            </h2>
            <p className="text-gray-200 mb-8">
              Invite your colleagues and both get a free month of premium access when they sign up!
            </p>
            <form onSubmit={handleReferral} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your friend's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold"
              >
                {isSubmitting ? "Sending..." : "Send Invite"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}