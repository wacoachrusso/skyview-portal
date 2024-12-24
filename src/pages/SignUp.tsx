import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const SignUp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.selectedPlan;

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          // If user selected a plan, update their profile
          if (selectedPlan && session?.user?.id) {
            await supabase
              .from('profiles')
              .update({ subscription_plan: selectedPlan })
              .eq('id', session.user.id);
          }
          navigate('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, selectedPlan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm border-white/10">
        <div className="mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-12 w-auto"
          />
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#D4AF37',
                  brandAccent: '#B4941F',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90',
              input: 'bg-white/10 border-white/20 text-white',
              label: 'text-white',
            }
          }}
          providers={[]}
        />
      </Card>
    </div>
  );
};

export default SignUp;