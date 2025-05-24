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
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const checkAuthAndDisclaimer = async () => {
    try {
      setIsLoading(true);
      
      // Check if there's an active session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error checking auth:", sessionError);
        setIsAuthenticated(false);
        setShowDisclaimer(false);
        setIsLoading(false);
        return;
      }

      if (!session) {
        setIsAuthenticated(false);
        setShowDisclaimer(false);
        setIsLoading(false);
        return;
      }

      // Verify the session is still valid by making a simple authenticated request
      const { error: validationError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (validationError && validationError.code === 'PGRST301') {
        // Session is expired or invalid, sign out
        console.log("Session expired, signing out");
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setShowDisclaimer(false);
        setIsLoading(false);
        return;
      }

      // User is authenticated with valid session
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
      } else {
        setShowDisclaimer(false);
      }
    } catch (err) {
      console.error("Failed to check authentication:", err);
      setIsAuthenticated(false);
      setShowDisclaimer(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndDisclaimer();
  }, [requireAuth, requireDisclaimer]);

  const handleAcceptDisclaimer = async () => {
    try {
      // Re-check authentication before accepting
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session) {
        // User is no longer authenticated, redirect to login
        setIsAuthenticated(false);
        setShowDisclaimer(false);
        return;
      }

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
      // Sign out the user
      await supabase.auth.signOut();

      // Clear any authentication-related storage
      localStorage.removeItem("auth_status");
      localStorage.removeItem("user_profile");
      sessionStorage.removeItem("cached_user_profile");
      sessionStorage.removeItem("cached_auth_user");
      
      // Update state
      setIsAuthenticated(false);
      setShowDisclaimer(false);
      setIsProfileComplete(false);

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

  // Check authentication first - if not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but disclaimer needs to be shown
  if (isAuthenticated && showDisclaimer) {
    return (
      <DisclaimerDialog
        open={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
        onReject={handleRejectDisclaimer}
      />
    );
  }

  // Check profile completion only if authenticated and disclaimer is handled
  if (isAuthenticated && !isProfileComplete) {
    return (
      <Navigate to="/auth/callback" state={{ needsProfile: true }} replace />
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};