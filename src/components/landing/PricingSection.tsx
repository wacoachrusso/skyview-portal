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

      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
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
    <div id="pricing-section" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-brand-navy mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Trial */}
          <Card className="bg-white border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="text-brand-navy">Free Trial</CardTitle>
              <div className="text-3xl font-bold text-brand-navy">Free</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <PricingFeature text="2 Contract Queries" />
                <PricingFeature text="Basic Features" />
                <PricingFeature text="No Credit Card Required" />
              </ul>
              <Button 
                variant="outline"
                className="w-full bg-white hover:bg-gray-50 text-brand-navy border-brand-navy"
                onClick={() => handlePlanSelection('free')}
                disabled={isLoading}
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="bg-white border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="text-brand-navy">Monthly Plan</CardTitle>
              <div className="text-3xl font-bold text-brand-navy">
                $4.99<span className="text-lg font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <PricingFeature text="Unlimited Queries" />
                <PricingFeature text="All Features" />
                <PricingFeature text="Priority Support" />
              </ul>
              <Button 
                className="w-full bg-brand-navy hover:bg-brand-navy/90"
                onClick={() => handlePlanSelection('monthly')}
                disabled={isLoading}
              >
                Choose Monthly
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="bg-white border-2 border-brand-gold relative">
            <div className="absolute -top-3 right-4 bg-brand-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
              Best Value
            </div>
            <CardHeader>
              <CardTitle className="text-brand-navy">Annual Plan</CardTitle>
              <div className="text-3xl font-bold text-brand-navy">
                $49.99<span className="text-lg font-normal">/year</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <PricingFeature text="Unlimited Queries" />
                <PricingFeature text="All Features" />
                <PricingFeature text="Priority Support" />
                <PricingFeature text="Save $10" />
              </ul>
              <Button 
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white"
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
  <li className="flex items-center gap-2 text-gray-600">
    <Check className="h-4 w-4 text-brand-navy" />
    <span className="text-sm">{text}</span>
  </li>
);
