import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLoadingSpinner } from "@/components/ui/app-loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { DisclaimerDialog } from "../consent/DisclaimerDialog";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const checkAuthAndDisclaimer = async () => {
      try {
        // Check if there's an active session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error checking auth:", sessionError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // User is authenticated
        setIsAuthenticated(true);

        // Check if profile is complete
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsProfileComplete(false);
          setIsLoading(false);
          return;
        }

        // Check if profile has necessary fields
        const isComplete = Boolean(
          profileData &&
            profileData.account_status !== "deleted" &&
            profileData.full_name
        );

        setIsProfileComplete(isComplete);

        // Store profile data in session storage for faster access
        if (isComplete) {
          try {
            sessionStorage.setItem(
              "cached_user_profile",
              JSON.stringify(profileData)
            );
            sessionStorage.setItem(
              "cached_auth_user",
              JSON.stringify(session.user)
            );
          } catch (error) {
            console.error("Failed to cache profile data:", error);
          }
        }

        // If disclaimer is required, check its status
        if (requireDisclaimer) {
          const { data, error } = await supabase
            .from("disclaimer_consents")
            .select("status")
            .eq("user_id", session.user.id)
            .single();

          if (error) {
            // Show disclaimer if no record exists (PGRST116) or any other error occurred
            console.error("Error checking disclaimer:", error);
            setShowDisclaimer(true);
          } else {
            // Check if disclaimer has been accepted - show if not accepted or null
            setShowDisclaimer(!data || data.status !== "accepted");
          }
        }
      } catch (err) {
        console.error("Failed to check authentication:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndDisclaimer();
  }, [requireAuth, requireDisclaimer]);

  const handleAcceptDisclaimer = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("disclaimer_consents").upsert(
        {
          user_id: session.user.id,
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
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleRejectDisclaimer = async () => {
    try {
      // Sign out the user
      await supabase.auth.signOut();

      // Clear any authentication-related local storage
      localStorage.removeItem("auth_status");
      localStorage.removeItem("user_profile");

      // Show toast notification
      toast({
        variant: "destructive",
        title: "Disclaimer Declined",
        description: "You must accept the disclaimer to use the service.",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return <AppLoadingSpinner />;
  }

  // Disclaimer Dialog
  if (showDisclaimer) {
    return (
      <DisclaimerDialog
        open={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
        onReject={handleRejectDisclaimer}
      />
    );
  }

  // Check authentication if required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check profile completion
  if (!isProfileComplete) {
    return (
      <Navigate to="/auth/callback" state={{ needsProfile: true }} replace />
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};