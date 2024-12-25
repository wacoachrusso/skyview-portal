import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
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

      // Get user's IP address using a public API
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const updates = {
        subscription_plan: plan,
        last_ip_address: ip,
        query_count: 0, // Reset query count when changing plans
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
    <div id="pricing-section" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include access to our core features.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Trial */}
          <Card className="relative bg-white border-2 border-gray-100 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-navy text-white px-4 py-1 rounded-full text-sm">
              Try it Free
            </div>
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-brand-navy">Free Trial</CardTitle>
              <div className="text-4xl font-bold text-brand-navy">
                $0
                <span className="text-lg font-normal text-gray-500">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <PricingFeature text="2 Contract Queries" />
                <PricingFeature text="Basic Features" />
                <PricingFeature text="No Credit Card Required" />
              </ul>
              <Button 
                variant="outline"
                className="w-full bg-white hover:bg-gray-50 text-brand-navy border-brand-navy hover:border-brand-navy/80"
                onClick={() => handlePlanSelection('free')}
                disabled={isLoading}
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="relative bg-gradient-to-br from-brand-navy to-brand-slate transform hover:scale-105 transition-transform duration-300 hover:shadow-xl border-0">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-gold text-white px-4 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-white">Monthly Plan</CardTitle>
              <div className="text-4xl font-bold text-white">
                $4.99
                <span className="text-lg font-normal text-gray-200">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <PricingFeature text="Unlimited Queries" textColor="text-gray-200" />
                <PricingFeature text="All Features" textColor="text-gray-200" />
                <PricingFeature text="Priority Support" textColor="text-gray-200" />
              </ul>
              <Button 
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold"
                onClick={() => handlePlanSelection('monthly')}
                disabled={isLoading}
              >
                Choose Monthly
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative bg-white border-2 border-brand-gold transform hover:scale-105 transition-transform duration-300 hover:shadow-xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm">
              Best Value
            </div>
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-brand-navy">Annual Plan</CardTitle>
              <div className="text-4xl font-bold text-brand-navy">
                $49.99
                <span className="text-lg font-normal text-gray-500">/year</span>
              </div>
              <div className="text-sm text-green-600 font-medium">Save $10 annually</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <PricingFeature text="Unlimited Queries" />
                <PricingFeature text="All Features" />
                <PricingFeature text="Priority Support" />
                <PricingFeature text="Annual Savings" />
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold/90 hover:from-brand-gold/90 hover:to-brand-gold text-brand-navy font-semibold"
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

const PricingFeature = ({ text, textColor = "text-gray-600" }: { text: string; textColor?: string }) => (
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-brand-gold" />
    <span className={`text-sm ${textColor}`}>{text}</span>
  </li>
);