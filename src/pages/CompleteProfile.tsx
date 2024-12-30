import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const jobTitles = ["Pilot", "Flight Attendant"];
const airlines = [
  "American Airlines",
  "Delta Air Lines",
  "United Airlines",
  "Southwest Airlines",
  "Other"
];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    airline: "",
  });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session check:", session);
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }

        // Check if profile is already complete
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type, airline')
          .eq('id', session.user.id)
          .single();

        console.log("Profile check:", profile, error);

        if (profile?.user_type && profile?.airline) {
          console.log("Profile already complete, redirecting to dashboard");
          navigate('/dashboard');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again.",
        });
        navigate('/login');
      }
    };

    checkProfile();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: formData.jobTitle,
          airline: formData.airline,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to SkyGuide.",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-300">Please provide a few more details to get started</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="jobTitle" className="text-gray-200">Select Job Title</Label>
              <Select
                value={formData.jobTitle}
                onValueChange={(value) => setFormData({ ...formData, jobTitle: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select Job Title" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {jobTitles.map((title) => (
                    <SelectItem
                      key={title}
                      value={title.toLowerCase()}
                      className="text-white hover:bg-white/10"
                    >
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="airline" className="text-gray-200">Select Airline</Label>
              <Select
                value={formData.airline}
                onValueChange={(value) => setFormData({ ...formData, airline: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select Airline" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {airlines.map((airline) => (
                    <SelectItem
                      key={airline}
                      value={airline.toLowerCase()}
                      className="text-white hover:bg-white/10"
                    >
                      {airline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold"
              disabled={submitting || !formData.jobTitle || !formData.airline}
            >
              {submitting ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;