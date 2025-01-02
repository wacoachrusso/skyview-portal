import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountInfo } from "@/components/account/AccountInfo";
import { SubscriptionInfo } from "@/components/account/SubscriptionInfo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { handleSignOut } = useAuthManagement();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setUserEmail(user.email);

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handlePlanChange = (newPlan: string) => {
    navigate('/?scrollTo=pricing-section');
  };

  const handleInitialCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
  };

  const handleReadRefundPolicy = () => {
    setShowCancelDialog(false);
    navigate('/refunds', { state: { fromCancellation: true } });
  };

  const handleCancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: 'free',
          query_count: 0,
          last_query_timestamp: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Refresh profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 max-w-4xl relative">
        <AccountHeader />
        <div className="space-y-6">
          <AccountInfo userEmail={userEmail} profile={profile} />
          <SubscriptionInfo 
            profile={profile}
            onPlanChange={handlePlanChange}
            onCancelSubscription={handleInitialCancelClick}
          />
        </div>
      </main>

      <AlertDialog open={showCancelDialog} onOpenChange={handleCancelDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Before You Cancel</AlertDialogTitle>
            <AlertDialogDescription>
              Please review our refund and cancellation policy before proceeding. This will help you understand the implications of cancelling your subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDialogClose}>
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReadRefundPolicy}
              className="bg-brand-gold hover:bg-brand-gold/90 text-black"
            >
              Read Refund Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Account;