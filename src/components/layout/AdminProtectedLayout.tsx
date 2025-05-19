import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppLoadingSpinner } from "@/components/ui/app-loading-spinner";

interface UserProfile {
  id: string;
  full_name: string;
  user_type: string;
  airline: string;
  subscription_plan: string;
  created_at: string;
  query_count: number;
  last_ip_address: string | null;
  last_query_timestamp: string | null;
  is_admin: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  email: string;
  push_subscription: string | null;
  account_status: string;
  two_factor_enabled: boolean;
  two_factor_backup_codes: string | null;
  login_attempts: number;
  assistant_id: string | null;
  address: string | null;
  phone_number: string | null;
  employee_id: string | null;
  stripe_customer_id: string | null;
  subscription_status: string;
}

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

export const AdminProtectedLayout: React.FC<AdminProtectedLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is an admin
    const checkAdminStatus = () => {
      try {
        const userProfileString = localStorage.getItem("user_profile");
        
        if (!userProfileString) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        const userProfile: UserProfile = JSON.parse(userProfileString);
        
        if (userProfile && userProfile.is_admin === true) {
          setIsAdmin(true);
        } else {
          // User is logged in but not an admin
          setIsAdmin(false);
          // Show a toast notification
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have permission to access this section.",
          });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [toast]);

  // Loading state
  if (isLoading) {
    return <AppLoadingSpinner />;
  }

  // If not admin, redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Render children if admin
  return <>{children}</>;
}