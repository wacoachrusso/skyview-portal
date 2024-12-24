import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-up">
            Your Personal Contract Guide
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto animate-fade-up">
            Instant, accurate contract interpretation for airline professionals. Get the answers you need, when you need them.
          </p>
          <Button asChild className="animate-fade-up">
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <div className="text-3xl font-bold">Free</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature text="2 Contract Queries" />
                  <PricingFeature text="Basic Features" />
                  <PricingFeature text="No Credit Card Required" />
                </ul>
                <Button className="w-full mt-6">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Monthly Plan */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Monthly Plan</CardTitle>
                <div className="text-3xl font-bold">$4.99<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature text="Unlimited Queries" />
                  <PricingFeature text="All Features" />
                  <PricingFeature text="Priority Support" />
                </ul>
                <Button className="w-full mt-6" variant="secondary">Choose Monthly</Button>
              </CardContent>
            </Card>

            {/* Annual Plan */}
            <Card className="card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg text-sm">
                Best Value
              </div>
              <CardHeader>
                <CardTitle>Annual Plan</CardTitle>
                <div className="text-3xl font-bold">$49.99<span className="text-lg font-normal">/year</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature text="Unlimited Queries" />
                  <PricingFeature text="All Features" />
                  <PricingFeature text="Priority Support" />
                  <PricingFeature text="Save $10" />
                </ul>
                <Button className="w-full mt-6" variant="default">Choose Annual</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">SkyGuide</h3>
              <p className="text-sm text-gray-400">
                Your trusted companion for contract interpretation.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">FAQs</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Facebook</a></li>
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
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-primary" />
    <span className="text-sm">{text}</span>
  </li>
);

export default Index;