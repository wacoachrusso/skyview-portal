import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppLoadingSpinner } from "@/components/ui/app-loading-spinner";
import { useProfile } from "../utils/ProfileProvider";

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

export const AdminProtectedLayout: React.FC<AdminProtectedLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const { authUser, profile, isLoading: profileLoading, isAdmin } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);

        // Wait for profile provider to finish loading
        if (profileLoading) {
          return;
        }

        // Check if user is authenticated and has admin rights
        if (!authUser || !profile) {
          setIsLoading(false);
          return;
        }

        // Admin status is already available from profile provider
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [authUser, profile, profileLoading, isAdmin]);

  // Show loading spinner while checking admin status
  if (isLoading || profileLoading) {
    return <AppLoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not admin, show error and redirect
  if (!isAdmin) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have permission to access this section.",
    });
    
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Render children if admin
  return <>{children}</>;
};
