import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormFields } from "./AuthFormFields";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  selectedPlan?: string;
}

export const AuthForm = ({ selectedPlan }: AuthFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateSelectedPlan = location.state?.selectedPlan;
  const finalSelectedPlan = selectedPlan || stateSelectedPlan || 'free';
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    airline: "",
  });

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_IN') {
        console.log("User signed in after email confirmation");
        toast({
          title: "Welcome to SkyGuide!",
          description: finalSelectedPlan === 'free' 
            ? "Your email has been confirmed. You have 2 queries available."
            : "Your email has been confirmed. Your account is now active.",
        });
        navigate('/chat');
      } else if (event === 'USER_UPDATED') {
        console.log("User updated - likely email confirmed");
        toast({
          title: "Email Confirmed!",
          description: "Your email has been confirmed. You can now use SkyGuide.",
        });
        navigate('/chat');
      }
    });

    // Check if we're on a confirmation URL
    const hash = window.location.hash;
    if (hash && hash.includes('type=signup')) {
      console.log("Found confirmation hash:", hash);
      toast({
        title: "Confirming your email...",
        description: "Please wait while we confirm your email address.",
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, finalSelectedPlan, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Starting signup process with plan:", finalSelectedPlan);

    try {
      // Get user's IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: formData.jobTitle,
            airline: formData.airline,
            subscription_plan: finalSelectedPlan,
            last_ip_address: ip,
            query_count: 0,
            last_query_timestamp: new Date().toISOString()
          },
          emailRedirectTo: `${window.location.origin}/login#confirmation`
        }
      });

      if (error) {
        console.error("Signup error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Signup successful:", data);

      // Show appropriate success message based on whether email confirmation is required
      if (!data.session) {
        // Email confirmation is required
        toast({
          title: "Welcome to SkyGuide!",
          description: "We've sent you a confirmation email. Please check your inbox and click the confirmation link to activate your account. Once confirmed, you'll be automatically redirected to the chat interface.",
        });
        navigate('/login');
      } else {
        // Email confirmation was not required, user is automatically signed in
        toast({
          title: "Welcome to SkyGuide!",
          description: finalSelectedPlan === 'free' 
            ? "Your free trial account has been created. You have 2 queries available."
            : "Your account has been created successfully.",
        });
        navigate('/chat');
      }
      
    } catch (error) {
      console.error("Error in signup process:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthFormHeader />

        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthFormFields 
              formData={formData}
              showPassword={showPassword}
              setFormData={setFormData}
              setShowPassword={setShowPassword}
            />

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-gold hover:text-brand-gold/80">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};