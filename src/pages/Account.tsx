import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { useAccountManagement } from "@/hooks/useAccountManagement";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountInfo } from "@/components/account/AccountInfo";
import { SubscriptionInfo } from "@/components/account/SubscriptionInfo";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CancelSubscriptionDialog } from "@/components/account/CancelSubscriptionDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Account = () => {
  const navigate = useNavigate();
  const { handleSignOut } = useAuthManagement();
  const { isLoading, userEmail, profile, handleCancelSubscription } = useAccountManagement();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (mounted && isLoading) {
        console.log("Account page loading timeout triggered");
        setTimeoutOccurred(true);
      }
    }, 5000); // 5-second safety timeout

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  useEffect(() => {
    setMounted(true);
    
    if (timeoutOccurred && userEmail && !profile) {
      console.log("Loading basic account data after timeout");
    }
    
    const checkAlphaTester = async () => {
      if (!profile?.id || !mounted) return;

      try {
        const { data: alphaTester } = await supabase
          .from('alpha_testers')
          .select('*')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (alphaTester?.temporary_password && mounted) {
          setShowPasswordChange(true);
        }
      } catch (error) {
        console.error("Error checking alpha tester status:", error);
      }
    };

    if (profile?.id) {
      checkAlphaTester();
    }
    
    return () => {
      setMounted(false);
    };
  }, [profile?.id, timeoutOccurred, userEmail]);

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

  if (isLoading && !timeoutOccurred) {
    console.log("Account page is loading...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (timeoutOccurred && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <h2 className="text-xl font-semibold mb-4 text-white">Loading your account...</h2>
          <p className="text-muted-foreground mb-6">This is taking longer than expected.</p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="default">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log("No profile found for account page");
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

  console.log("Account page rendering with profile:", profile.id);
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 max-w-4xl relative">
        <AccountHeader />
        <div className="space-y-6">
          <AccountInfo 
            userEmail={userEmail} 
            profile={profile} 
            showPasswordChange={showPasswordChange}
          />
          <SubscriptionInfo 
            profile={profile}
            onPlanChange={handlePlanChange}
            onCancelSubscription={handleInitialCancelClick}
          />
        </div>
      </main>

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onClose={handleCancelDialogClose}
        onConfirm={handleCancelSubscription}
        onReadPolicy={handleReadRefundPolicy}
      />
    </div>
  );
};

export default Account;
