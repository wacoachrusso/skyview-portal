// src/components/layout/ProtectedLayout.tsx
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useProfile } from "@/components/utils/ProfileProvider";
import { isAuthenticated } from "@/utils/auth/authGuard";
import Navbar from "../navbar/Navbar";

interface ProtectedLayoutProps {
  children: ReactNode;
  redirectUnauthenticatedTo?: string;
}

export const ProtectedLayout = ({
  children,
  redirectUnauthenticatedTo = "/login",
}: ProtectedLayoutProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const {
    isLoading: profileLoading,
    loadError,
    userEmail,
    profile,
    authUser,
    refreshProfile,
    logout,
  } = useProfile();

  useEffect(() => {
    // Set a timeout to prevent indefinite loading
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 2000);

    // If profile is loaded, we can stop our loading state
    if (!profileLoading) {
      setIsLoading(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [profileLoading, isLoading]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Immediate redirect if not authenticated
  if (!isAuthenticated() && !isLoading && !profileLoading) {
    return <Navigate to={redirectUnauthenticatedTo} replace />;
  }

  // Show loading state
  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" className="border-brand-gold" />
      </div>
    );
  }

  // If there's an error loading the profile
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Failed to load profile
          </h2>
          <p className="text-muted-foreground mb-4">{loadError}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => navigate("/login")}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 mt-10">
        {children}
      </main>
    </div>
  );
};
