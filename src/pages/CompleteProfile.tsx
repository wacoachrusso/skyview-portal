import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { plans } from "@/components/landing/pricing/pricingPlans";

const airlines = [
  "United Airlines",
  "American Airlines",
  "Delta Air Lines",
  "Southwest Airlines",
  "Other"
];

const jobTitles = [
  "Flight Attendant",
  "Pilot"
];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    airline: "",
    jobTitle: "",
    selectedPlan: "free"
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      if (!formData.airline || !formData.jobTitle || !formData.selectedPlan) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          airline: formData.airline,
          user_type: formData.jobTitle,
          subscription_plan: formData.selectedPlan,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been completed successfully.",
      });

      // If they selected a paid plan, redirect to pricing
      if (formData.selectedPlan !== 'free') {
        navigate('/pricing');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isOptionEnabled = (airline: string, jobTitle: string) => {
    if (airline) {
      return airline.toLowerCase() === "united airlines";
    }
    if (jobTitle) {
      return jobTitle.toLowerCase() === "flight attendant";
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Complete Your Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="airline" className="text-white">Select Airline <span className="text-red-500">*</span></Label>
              <Select
                value={formData.airline}
                onValueChange={(value) => setFormData({ ...formData, airline: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select Airline" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 text-white">
                  {airlines.map((airline) => (
                    <SelectItem 
                      key={airline} 
                      value={airline.toLowerCase()}
                      className={`hover:bg-white/10 ${!isOptionEnabled(airline.toLowerCase(), "") ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!isOptionEnabled(airline.toLowerCase(), "")}
                    >
                      {airline} {!isOptionEnabled(airline.toLowerCase(), "") && "(Coming Soon)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-white">Select Job Title <span className="text-red-500">*</span></Label>
              <Select
                value={formData.jobTitle}
                onValueChange={(value) => setFormData({ ...formData, jobTitle: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select Job Title" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 text-white">
                  {jobTitles.map((title) => (
                    <SelectItem 
                      key={title} 
                      value={title.toLowerCase()}
                      className={`hover:bg-white/10 ${!isOptionEnabled("", title.toLowerCase()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!isOptionEnabled("", title.toLowerCase())}
                    >
                      {title} {!isOptionEnabled("", title.toLowerCase()) && "(Coming Soon)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan" className="text-white">Select Plan <span className="text-red-500">*</span></Label>
              <Select
                value={formData.selectedPlan}
                onValueChange={(value) => setFormData({ ...formData, selectedPlan: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 text-white">
                  {plans.map((plan) => (
                    <SelectItem 
                      key={plan.name} 
                      value={plan.name.toLowerCase()}
                      className="hover:bg-white/10"
                    >
                      {plan.name} - {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold h-10 px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Updating..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}