
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Share2, Check, Copy, Mail, MessageSquare } from "lucide-react";
import { SocialLinks } from "@/components/ui/social-links";
import { Facebook, Twitter, Linkedin } from "lucide-react";

interface ReferralData {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  creditsEarned: number;
  referralLink: string;
}

export function ReferralDashboard() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch referral code
      const { data: referralData } = await supabase
        .from('referrals')
        .select('referral_code, status')
        .eq('referrer_id', user.id);

      if (!referralData || referralData.length === 0) {
        // Generate a new referral code if one doesn't exist
        const { data: newCode } = await supabase.rpc('generate_referral_code');
        
        if (newCode) {
          await supabase.from('referrals')
            .insert({
              referrer_id: user.id,
              referral_code: newCode,
              status: 'pending'
            });
            
          setReferralData({
            totalReferrals: 0,
            pendingReferrals: 0,
            completedReferrals: 0,
            creditsEarned: 0,
            referralLink: `${window.location.origin}/signup?ref=${newCode}`
          });
        }
      } else {
        // Count referrals
        const pending = referralData.filter(r => r.status === 'pending').length;
        const completed = referralData.filter(r => r.status === 'completed').length;
        const referralCode = referralData[0]?.referral_code;

        setReferralData({
          totalReferrals: referralData.length,
          pendingReferrals: pending,
          completedReferrals: completed,
          creditsEarned: completed * 5, // $5 per completed referral
          referralLink: `${window.location.origin}/signup?ref=${referralCode}`
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching referral data:", error);
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralData?.referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Referral link copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the link manually",
      });
    }
  };

  const shareViaEmail = () => {
    if (!referralData?.referralLink) return;
    
    const subject = "Join me on SkyGuide - Your AI Contract Assistant";
    const body = `Hi there,\n\nI've been using SkyGuide to help me navigate my airline contract, and I thought you might find it useful too.\n\nYou'll get 50% off your first month or an extra free month with an annual plan when you sign up with my link:\n\n${referralData.referralLink}\n\nBest,`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaWhatsApp = () => {
    if (!referralData?.referralLink) return;
    
    const text = `Join me on SkyGuide and get 50% off your first month! It's an amazing AI assistant for navigating our contract: ${referralData.referralLink}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
        <p className="mt-2 text-gray-300">Loading your referral data...</p>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-300">Please log in to view your referral dashboard.</p>
      </div>
    );
  }

  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.referralLink)}`,
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Join me on SkyGuide and get 50% off your first month! It's an amazing AI assistant for navigating our contract:")}&url=${encodeURIComponent(referralData.referralLink)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData.referralLink)}`,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-brand-gold mb-2">Your Referral Dashboard</h3>
          <p className="text-gray-300 text-sm">Track your referrals and earned rewards</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">Total Referrals</p>
            <p className="text-3xl font-bold text-white">{referralData.totalReferrals}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">Pending</p>
            <p className="text-3xl font-bold text-white">{referralData.pendingReferrals}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">Completed</p>
            <p className="text-3xl font-bold text-white">{referralData.completedReferrals}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm">Credits Earned</p>
            <p className="text-3xl font-bold text-brand-gold">${referralData.creditsEarned}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Your Referral Link</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow bg-white/20 rounded-md px-3 py-2 text-sm break-all">
              {referralData.referralLink}
            </div>
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              className="border-brand-gold text-brand-gold hover:bg-brand-gold/20"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        
        <Separator className="bg-white/20 my-6" />
        
        <div>
          <h4 className="text-lg font-semibold mb-3">Share Your Link</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={shareViaEmail} 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button 
              onClick={shareViaWhatsApp} 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            
            <div className="flex items-center justify-center">
              <SocialLinks socials={socialLinks} className="text-white" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
