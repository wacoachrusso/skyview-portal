import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountInfo } from "@/components/account/AccountInfo";
import { SubscriptionInfo } from "@/components/account/SubscriptionInfo";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
        console.log("Loading profile data...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          throw userError;
        }

        if (!user) {
          console.log("No authenticated user found");
          navigate('/login');
          return;
        }

        setUserEmail(user.email);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        if (!profileData) {
          console.log("No profile found for user");
          toast({
            variant: "destructive",
            title: "Profile Not Found",
            description: "Unable to load your profile information.",
          });
          return;
        }

        console.log("Profile loaded successfully:", profileData);
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
  }, [navigate, toast]);

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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center text-white">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p>Unable to load your profile information.</p>
          </div>
        </div>
      </div>
    );
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