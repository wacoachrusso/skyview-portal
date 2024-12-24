import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (plan: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If user is not logged in, redirect to signup with selected plan
        navigate('/signup', { state: { selectedPlan: plan } });
        return;
      }

      // If user is logged in, update their subscription plan
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Plan Selected",
        description: `You've selected the ${plan} plan.`,
      });

      // Redirect to dashboard or appropriate page
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
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="nav-link">Login</Link>
            <Button asChild variant="secondary" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-up">
            Your Personal Contract Guide
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto animate-fade-up">
            Instant, accurate contract interpretation for airline professionals. Get the answers you need, when you need them.
          </p>
          <Button 
            asChild 
            className="animate-fade-up bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
            onClick={() => navigate('/signup')}
          >
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <Card className="card-hover bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Free Trial</CardTitle>
                <div className="text-3xl font-bold text-white">Free</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature text="2 Contract Queries" />
                  <PricingFeature text="Basic Features" />
                  <PricingFeature text="No Credit Card Required" />
                </ul>
                <Button 
                  className="w-full mt-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => handlePlanSelection('free')}
                  disabled={isLoading}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Plan */}
            <Card className="card-hover bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Monthly Plan</CardTitle>
                <div className="text-3xl font-bold text-white">$4.99<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature text="Unlimited Queries" />
                  <PricingFeature text="All Features" />
                  <PricingFeature text="Priority Support" />
                </ul>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
                  onClick={() => handlePlanSelection('monthly')}
                  disabled={isLoading}
                >
                  Choose Monthly
                </Button>
              </CardContent>
            </Card>

            {/* Annual Plan */}
            <Card className="card-hover relative overflow-hidden bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm border-white/10">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-navy px-3 py-1 rounded-bl-lg text-sm font-semibold">
                Best Value
              </div>
              <CardHeader>
                <CardTitle className="text-white">Annual Plan</CardTitle>
                <div className="text-3xl font-bold text-white">$49.99<span className="text-lg font-normal">/year</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature text="Unlimited Queries" />
                  <PricingFeature text="All Features" />
                  <PricingFeature text="Priority Support" />
                  <PricingFeature text="Save $10" />
                </ul>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
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

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm py-12 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-white">SkyGuide</h3>
              <p className="text-sm text-gray-400">
                Your trusted companion for contract interpretation.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-sm text-gray-400">
            © 2024 SkyGuide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const PricingFeature = ({ text }: { text: string }) => (
  <li className="flex items-center gap-2 text-gray-300">
    <Check className="h-4 w-4 text-brand-gold" />
    <span className="text-sm">{text}</span>
  </li>
);

export default Index;