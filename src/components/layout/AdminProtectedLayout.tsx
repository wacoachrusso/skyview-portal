import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppLoadingSpinner } from "@/components/ui/app-loading-spinner";
import { supabase } from "@/integrations/supabase/client";

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

export const AdminProtectedLayout: React.FC<AdminProtectedLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);

        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Query the profiles table directly for admin status
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.is_admin || false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Optional: Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading spinner while checking admin status
  if (isLoading) {
    return <AppLoadingSpinner />;
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