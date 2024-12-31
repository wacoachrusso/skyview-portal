import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export function PricingSection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (plan: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/signup', { state: { selectedPlan: plan } });
        return;
      }

      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const updates = {
        subscription_plan: plan,
        last_ip_address: ip,
        query_count: 0,
        last_query_timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Plan Selected",
        description: `You've selected the ${plan} plan.`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Error",
        description: "Failed to select plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="pricing-section" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent dark:from-emerald-500/5 -z-10" />
      
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include access to our core features.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Trial Card */}
          <Card className="relative overflow-hidden backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border border-emerald-100/20 dark:border-emerald-500/20 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-500/30">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              Start Free
            </div>
            <CardHeader className="space-y-2 pt-8">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Free Trial
              </CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <PricingFeature text="2 Contract Queries" />
                <PricingFeature text="Basic Features" />
                <PricingFeature text="No Credit Card Required" />
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                onClick={() => handlePlanSelection('free')}
                disabled={isLoading}
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Plan Card */}
          <Card className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-600/20 dark:to-teal-600/20 border border-emerald-200/30 dark:border-emerald-400/30 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-current" /> Most Popular
            </div>
            <CardHeader className="space-y-2 pt-8">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Monthly Plan
              </CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$4.99</span>
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <PricingFeature text="Unlimited Queries" />
                <PricingFeature text="All Features" />
                <PricingFeature text="Priority Support" />
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                onClick={() => handlePlanSelection('monthly')}
                disabled={isLoading}
              >
                Choose Monthly
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan Card */}
          <Card className="relative overflow-hidden backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border border-emerald-100/20 dark:border-emerald-500/20 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-500/30">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              Best Value
            </div>
            <CardHeader className="space-y-2 pt-8">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Annual Plan
              </CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$49.99</span>
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/year</span>
              </div>
              <div className="text-sm text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full inline-block">
                Save $10 annually
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <PricingFeature text="Unlimited Queries" />
                <PricingFeature text="All Features" />
                <PricingFeature text="Priority Support" />
                <PricingFeature text="Annual Savings" />
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                onClick={() => handlePlanSelection('annual')}
                disabled={isLoading}
              >
                Choose Annual
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const PricingFeature = ({ text }: { text: string }) => (
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-emerald-500" />
    <span className="text-sm text-gray-600 dark:text-gray-300">{text}</span>
  </li>
);