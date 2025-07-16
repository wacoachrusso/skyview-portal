import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLoadingSpinner } from "@/components/ui/app-loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { DisclaimerDialog } from "../consent/DisclaimerDialog";
import { useAuthStore } from "@/stores/authStores";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireDisclaimer?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireDisclaimer = true,
}) => {
  const location = useLocation();
  const { toast } = useToast();
  const { authUser, profile, isLoading: profileLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerCheckComplete, setDisclaimerCheckComplete] = useState(false);

  // Check authentication and disclaimer status
  useEffect(() => {
    const checkAuthAndDisclaimer = async () => {
      try {
        setIsLoading(true);
        
        // Wait for profile provider to finish loading
        if (profileLoading) {
          return;
        }

        // Check if user is authenticated via profile provider
        if (authUser) {
          setIsAuthenticated(true);
          
          // Check disclaimer status if required
          if (requireDisclaimer) {
            const { data, error } = await supabase
              .from("disclaimer_consents")
              .select("status")
              .eq("user_id", authUser.id)
              .single();

            if (error) {
              console.error("Error checking disclaimer:", error);
              setShowDisclaimer(true);
            } else {
              setShowDisclaimer(!data || data.status !== "accepted");
            }
          } else {
            setShowDisclaimer(false);
          }
        } else {
          setIsAuthenticated(false);
          setShowDisclaimer(false);
        }
        
        setDisclaimerCheckComplete(true);
      } catch (error) {
        console.error("Error in protected route check:", error);
        setIsAuthenticated(false);
        setShowDisclaimer(false);
        setDisclaimerCheckComplete(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndDisclaimer();
  }, [authUser, profileLoading, requireDisclaimer]);

  const handleAcceptDisclaimer = async () => {
    try {
      if (!authUser) {
        setIsAuthenticated(false);
        setShowDisclaimer(false);
        return;
      }

      const { error } = await supabase.from("disclaimer_consents").upsert(
        {
          user_id: authUser.id,
          status: "accepted",
          has_seen_chat_disclaimer: true,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) {
        console.error("Error saving disclaimer:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save disclaimer acceptance",
        });
        return;
      }

      setShowDisclaimer(false);
      toast({
        title: "Success",
        description: "Disclaimer accepted successfully",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  const handleRejectDisclaimer = async () => {
    try {
      // Use the logout method from ProfileProvider
      const { logout } = useAuthStore();
      await logout();

      setIsAuthenticated(false);
      setShowDisclaimer(false);

      toast({
        variant: "destructive",
        title: "Disclaimer Declined",
        description: "You must accept the disclaimer to use the service.",
      });
      // const navigate = useNavigate();
      // navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Show loading while checking authentication or profile is loading
  if (isLoading || profileLoading || !disclaimerCheckComplete) {
    return <AppLoadingSpinner />;
  }

  // Check authentication first
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show disclaimer if needed
  if (isAuthenticated && showDisclaimer) {
    return (
      <DisclaimerDialog
        open={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
        onReject={handleRejectDisclaimer}
      />
    );
  }

  // Check if profile is complete
  if (isAuthenticated && profile && !profile.full_name) {
    return (
      <Navigate to="/auth/callback" state={{ needsProfile: true }} replace />
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};