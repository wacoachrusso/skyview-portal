
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

const Account = () => {
  const navigate = useNavigate();
  const { handleSignOut } = useAuthManagement();
  const { isLoading, userEmail, profile, handleCancelSubscription } = useAccountManagement();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    const checkAlphaTester = async () => {
      if (!profile?.id) return;

      const { data: alphaTester } = await supabase
        .from('alpha_testers')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      // Show password change form for alpha testers with temporary passwords
      if (alphaTester?.temporary_password) {
        setShowPasswordChange(true);
      }
    };

    checkAlphaTester();
  }, [profile?.id]);

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
