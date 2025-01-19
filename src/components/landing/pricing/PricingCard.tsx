import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId: string;
  mode?: 'subscription' | 'payment';
  popular?: boolean;
  onSelect?: () => Promise<void>;
}

export const PricingCard = ({ 
  name, 
  price, 
  description, 
  features, 
  priceId,
  mode = 'subscription',
  popular = false,
  onSelect 
}: PricingCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = async () => {
    if (onSelect) {
      await onSelect();
      return;
    }

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error');
      }
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', {
          name: name.toLowerCase(),
          priceId,
          mode
        });
        
        navigate('/signup', { 
          state: { 
            selectedPlan: name.toLowerCase(),
            priceId,
            mode
          }
        });
        return;
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        throw new Error('User email not found');
      }

      console.log('Making request to create-checkout-session with:', {
        priceId,
        mode,
        email: userEmail
      });

      // Get current session token
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        throw new Error('No session token found');
      }

      const response = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({
          priceId,
          mode,
          email: userEmail,
          sessionToken
        }),
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('Checkout session response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { data: { url } } = response;
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      });
    }
  };

  return (
    <Card className={`w-full max-w-sm mx-auto ${popular ? 'border-brand-gold shadow-xl' : 'border-gray-200'}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {name}
          {popular && (
            <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold text-black bg-brand-gold rounded-full">
              Popular
            </span>
          )}
        </CardTitle>
        <div className="text-center">
          <span className="text-4xl font-bold">{price}</span>
          {mode === 'subscription' && <span className="text-gray-500 ml-1">/month</span>}
        </div>
        <p className="text-center text-gray-500 mt-2">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-brand-gold mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePlanSelection}
          className={`w-full ${
            popular
              ? 'bg-brand-gold hover:bg-brand-gold/90 text-black'
              : 'bg-brand-navy hover:bg-brand-navy/90 text-white'
          }`}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
};