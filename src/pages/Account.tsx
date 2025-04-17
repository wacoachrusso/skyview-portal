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
import { RefreshCw } from "lucide-react";

const Account = () => {
  const navigate = useNavigate();
  const { handleSignOut } = useAuthManagement();
  const { 
    isLoading, 
    loadError, 
    userEmail, 
    profile, 
    handleCancelSubscription,
    retryLoading 
  } = useAccountManagement();
  
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Modified to handle both first load and subsequent loads
  useEffect(() => {
    console.log("Account component mounted or profile updated:", profile?.id);
  }, [profile]);

  // Set a timeout for loading to improve user experience
  useEffect(() => {
    let timeoutId: number;
    
    if (isLoading && !loadingTimeout) {
      timeoutId = window.setTimeout(() => {
        if (mounted) {
          console.log("Setting loading timeout flag");
          setLoadingTimeout(true);
        }
      }, 12000); // Increased timeout to 12 seconds
    }
    
    // Reset timeout flag if loading state changes
    if (!isLoading) {
      setLoadingTimeout(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, loadingTimeout]);

  useEffect(() => {
    setMounted(true);
    
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
  }, [profile?.id, isLoading]);

  // Handle custom sign out to clear cached data
  const handleCustomSignOut = async () => {
    try {
      // Clear cached data on sign out
      sessionStorage.removeItem("cached_user_profile");
      sessionStorage.removeItem("cached_auth_user");
      await handleSignOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handlePlanChange = () => {
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

  const handleRefresh = () => {
    console.log("Manually refreshing profile data");
    retryLoading();
    setLoadingTimeout(false);
  };

  // Show loading state
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <DashboardHeader userEmail={userEmail} onSignOut={handleCustomSignOut} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4 border-brand-gold" />
            <h2 className="text-xl font-semibold mb-2 text-white">Loading your account...</h2>
            <p className="text-sm text-muted-foreground mb-4">This may take a moment</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If profile couldn't be loaded after all attempts
  if (!profile) {
    console.log("No profile found for account page");
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <DashboardHeader userEmail={userEmail} onSignOut={handleCustomSignOut} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center max-w-md px-4">
            <h2 className="text-xl font-semibold mb-4 text-white">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">Unable to load your profile information. Please try again later or contact support.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="default"
                className="bg-gradient-to-r from-brand-purple to-brand-magenta text-white hover:opacity-90"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render account page when data is available
  console.log("Account page rendering with profile:", profile.id);
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <DashboardHeader userEmail={userEmail} onSignOut={handleCustomSignOut} />
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