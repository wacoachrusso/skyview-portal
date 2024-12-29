import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuthManagement } from "@/hooks/useAuthManagement";

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { handleSignOut } = useAuthManagement();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setUserEmail(user.email);

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handlePlanChange = (newPlan: string) => {
    navigate('/?scrollTo=pricing');
  };

  const handleCancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: 'free',
          query_count: 0,
          last_query_timestamp: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Refresh profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 max-w-4xl relative">
        <div className="space-y-6">
          <Card className="bg-white/95 shadow-xl">
            <CardHeader>
              <CardTitle className="text-brand-navy">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-medium text-brand-navy">Email:</span>
                  <span className="col-span-2 text-gray-700">{userEmail}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-medium text-brand-navy">Full Name:</span>
                  <span className="col-span-2 text-gray-700">{profile?.full_name || 'Not set'}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-medium text-brand-navy">User Type:</span>
                  <span className="col-span-2 text-gray-700">{profile?.user_type || 'Not set'}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-medium text-brand-navy">Airline:</span>
                  <span className="col-span-2 text-gray-700">{profile?.airline || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 shadow-xl">
            <CardHeader>
              <CardTitle className="text-brand-navy">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-medium text-brand-navy">Current Plan:</span>
                  <span className="col-span-2 text-gray-700 capitalize">{profile?.subscription_plan || 'Free'}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-medium text-brand-navy">Queries Used:</span>
                  <span className="col-span-2 text-gray-700">{profile?.query_count || 0}</span>
                </div>
                {profile?.last_query_timestamp && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-medium text-brand-navy">Last Query:</span>
                    <span className="col-span-2 text-gray-700">
                      {format(new Date(profile.last_query_timestamp), 'PPpp')}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-200" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-navy">Plan Management</h3>
                {profile?.subscription_plan === 'free' ? (
                  <Button
                    onClick={() => handlePlanChange('paid')}
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white"
                  >
                    Upgrade Plan
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handlePlanChange('change')}
                      className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white"
                    >
                      Change Plan
                    </Button>
                    <Button
                      onClick={handleCancelSubscription}
                      variant="destructive"
                      className="w-full"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Account;