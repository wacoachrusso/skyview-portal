import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChangePasswordForm } from "@/components/auth/password-reset/ChangePasswordForm";
import { useToast } from "@/hooks/use-toast";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [airline, setAirline] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Check if user is an alpha tester
      const { data: alphaTester } = await supabase
        .from('alpha_testers')
        .select('temporary_password, profile_id')
        .eq('profile_id', session.user.id)
        .single();

      if (!alphaTester?.temporary_password) {
        navigate('/dashboard');
        return;
      }

      setProfileId(session.user.id);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    if (!userType || !airline) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      // Update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: userType,
          airline: airline,
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // Update the alpha_testers table
      const { error: testerError } = await supabase
        .from('alpha_testers')
        .update({
          temporary_password: null, // Clear temporary password after profile completion
        })
        .eq('profile_id', profileId);

      if (testerError) throw testerError;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <Card className="bg-white/95 shadow-xl">
          <CardHeader>
            <CardTitle className="text-brand-navy">Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your job title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pilot">Pilot</SelectItem>
                    <SelectItem value="flight_attendant">Flight Attendant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="airline">Airline</Label>
                <Select value={airline} onValueChange={setAirline}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your airline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="united_airlines">United Airlines</SelectItem>
                    <SelectItem value="american_airlines">American Airlines</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 shadow-xl">
          <CardHeader>
            <CardTitle className="text-brand-navy">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm onSuccess={handleProfileUpdate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;