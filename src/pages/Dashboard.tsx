import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { FAQ } from "@/components/dashboard/FAQ";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfile } from "@/components/utils/ProfileProvider";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const mounted = useRef(true);
  
  // Use the ProfileProvider hook
  const { 
    isLoading: profileLoading, 
    loadError,
    profile, 
    authUser, 
    userName, 
    userEmail,
    queryCount, 
    isAdmin,
    logout
  } = useProfile();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent indefinite loading
    const timer = setTimeout(() => {
      if (isLoading && mounted.current) {
        setIsLoading(false);
      }
    }, 1500);

    // If profile is not loading, we can stop our loading state
    if (!profileLoading && mounted.current) {
      setIsLoading(false);
    }
    
    // Redirect if there's no authUser after profile is loaded
    if (!profileLoading && !authUser && mounted.current) {
      navigate('/login');
    }

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, [profileLoading, authUser, navigate]);

  // Handle sign out using the logout function from ProfileProvider
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy via-background to-brand-slate">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Failed to load profile</h2>
          <p className="text-muted-foreground mb-4">{loadError}</p>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => navigate('/login')}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="w-full">
          <WelcomeCard userName={userName} />
        </div>
        
        <div className="w-full">
          <QuickActions />
        </div>
        
        <div className="w-full">
          <FAQ />
        </div>
      </div>
    </AppLayout>
  );
}