import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { userEmail, isLoading, handleSignOut } = useAuthManagement();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.is_admin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Generate VAPID keys
  const handleGenerateVapidKeys = async () => {
    try {
      setIsGenerating(true);
      console.log('Invoking generate-vapid-keys function...');
      
      const { data, error } = await supabase.functions.invoke('generate-vapid-keys');
      
      if (error) {
        console.error('Error generating VAPID keys:', error);
        toast({
          title: "Error",
          description: "Failed to generate VAPID keys. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('VAPID keys generated successfully:', data);
      toast({
        title: "Success",
        description: "VAPID keys generated successfully!",
      });
    } catch (error) {
      console.error('Error in handleGenerateVapidKeys:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Check admin status on component mount
  useEffect(() => {
    checkAdminStatus();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 max-w-7xl relative">
        <div className="space-y-6">
          <WelcomeCard />
          {isAdmin && (
            <div className="p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-4">Admin Controls</h3>
              <Button
                onClick={handleGenerateVapidKeys}
                disabled={isGenerating}
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy"
              >
                {isGenerating ? "Generating..." : "Generate VAPID Keys"}
              </Button>
            </div>
          )}
          <QuickActions />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;