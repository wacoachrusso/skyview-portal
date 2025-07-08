import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountInfo } from "@/components/account/AccountInfo";
import { SubscriptionInfo } from "@/components/account/SubscriptionInfo";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CancelSubscriptionDialog } from "@/components/account/CancelSubscriptionDialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useProfile } from "@/components/utils/ProfileProvider";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Subscription } from "@/types/subscription";
import { Profile } from "@/types/profile";

const Account = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<Profile>(null);
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);
  const {
    isLoading,
    userEmail,
    profile,
    authUser,
    refreshProfile
  } = useProfile();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const handlePlanChange = () => {
    navigate("/?scrollTo=pricing-section");
  };

  const handleInitialCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
  };

  const handleReadRefundPolicy = () => {
    setShowCancelDialog(false);
    navigate("/refunds", { state: { fromCancellation: true } });
  };

  const handleRefresh = () => {
    console.log("Manually refreshing profile data");
    refreshProfile();
    setLoadingTimeout(false);
  };
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!authUser?.id) return;

    try {
      // Step 1: Cancel the subscription
      const { error } = await supabase.functions.invoke(
        "stripe-cancel-subscription",
        {
          body: { user_id: authUser.id },
        }
      );

      if (error) throw error;

      // Step 2: Send cancellation email
      await supabase.functions.invoke("send-plan-change-email", {
        body: {
          email: profile.email,
          oldPlan: subscriptionData[0]?.plan,
          newPlan: "cancelled", // or null if appropriate
          fullName: profile.full_name || "User",
          status: "cancelled", // 👈 Make sure this reflects actual cancellation
        },
      });

      // Step 3: Show success toast
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Step 4: Refresh profile data
      await refreshProfile();
      await getSubscriptionData();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to cancel subscription. Please try again.",
      });
    }
  };
  const getProfileData = async () => {

    if (!authUser) {
      console.error("No user found in session storage.");
      return;
    }


    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", authUser.email)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      setProfileData(profile);
    }
  };

  const getSubscriptionData = async () => {
    // Fetch subscription data by user_id
    if (profile?.id) {
      console.log("Fetching subscription by user_id:", profile.id);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscription by user_id:", error);
      } else {
        console.log("Subscription data by user_id:", data);
        setSubscriptionData(data || []);
      }
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  useEffect(() => {
    // Call getSubscriptionData when profile is available
    if (profile?.id) {
      getSubscriptionData();
    }
  }, [profile]);
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
          .from("alpha_testers")
          .select("*")
          .eq("profile_id", profile.id)
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

  // Theme-aware background styling for loading and error states
  const loadingBgClass =
    theme === "dark"
      ? "bg-gradient-to-br from-brand-navy via-background to-brand-slate"
      : "bg-gradient-to-br from-blue-50 via-white to-gray-100";

  const buttonClass =
    theme === "dark"
      ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
      : "bg-black/10 border-black/20 hover:bg-black/20 text-gray-800";

  // Show loading state
  if (isLoading && !loadingTimeout) {
    return (
      <div className={loadingBgClass}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner
              size="lg"
              className="mx-auto mb-4 border-brand-gold"
            />
            <h2
              className={`text-xl font-semibold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Loading your account...
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              This may take a moment
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className={buttonClass}
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
      <div className={loadingBgClass}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-4">
            <h2
              className={`text-xl font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Profile Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              Unable to load your profile information. Please try again later or
              contact support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className={buttonClass}
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
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

  const cardBgClass =
    theme === "dark"
      ? "border-white/10 bg-white/5 backdrop-blur-md"
      : "border-blue-200/70 bg-white shadow-md backdrop-blur-md";

  // Render account page when data is available
  console.log("Account page rendering with profile:", profile.id);
  return (
    <AppLayout maxWidth="max-w-4xl">
      <div className="flex items-center justify-between mb-6 ">
        <Button
          variant="ghost"
          className={`text-sm ${
            theme === "dark"
              ? "text-white hover:text-brand-gold"
              : "text-gray-800 hover:text-brand-gold"
          } transition`}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </Button>
      </div>

      <div className="space-y-6">
        <div className={`rounded-2xl shadow-md border ${cardBgClass} p-6`}>
          <AccountInfo
            userEmail={userEmail}
            profile={profile}
            showPasswordChange={showPasswordChange}
          />
        </div>

        <div className={`rounded-2xl shadow-md border ${cardBgClass} p-6`}>
          <SubscriptionInfo
            profileData={profileData}
            subscriptionData={subscriptionData}
            onPlanChange={handlePlanChange}
            onCancelSubscription={handleInitialCancelClick}
            refreshProfile={refreshProfile}
            setSubscriptionData={setSubscriptionData}
            setProfileData={setProfileData}
          />
        </div>
      </div>

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onClose={handleCancelDialogClose}
        onConfirm={handleCancelSubscription}
        onReadPolicy={handleReadRefundPolicy}
      />
    </AppLayout>
  );
};

export default Account;
