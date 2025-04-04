
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { useAuthManagement } from "@/hooks/useAuthManagement";

export default function Referrals() {
  const navigate = useNavigate();
  const { handleSignOut } = useAuthManagement();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        setUserEmail(session.user.email || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Referrals</h1>
          <p className="text-gray-300 mt-2">
            Share SkyGuide with your colleagues and earn rewards.
          </p>
        </div>
        
        <ReferralSection />
      </main>
    </div>
  );
}
