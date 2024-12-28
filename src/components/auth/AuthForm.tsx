import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormFields } from "./AuthFormFields";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthFormFooter } from "./AuthFormFooter";

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
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    airline: "",
  });

  useEffect(() => {
    console.log('Selected plan:', finalSelectedPlan);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in");
        toast({
          title: "Welcome to SkyGuide!",
          description: finalSelectedPlan === 'free' 
            ? "Your account has been created. You have 2 queries available."
            : "Your account has been created. Your account is now active.",
        });
        navigate('/chat');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, finalSelectedPlan, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    setLoading(true);
    setPasswordError(null);

    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: formData.jobTitle,
            airline: formData.airline,
            subscription_plan: finalSelectedPlan,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
        return;
      }

      console.log("Signup successful:", data);

      // Send confirmation email using our Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-signup-confirmation', {
          body: { 
            email: formData.email,
            name: formData.fullName,
            confirmationUrl: `${window.location.origin}/auth/callback`
          }
        });

        if (emailError) {
          console.error("Error sending confirmation email:", emailError);
          throw emailError;
        }

        toast({
          title: "Success",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send confirmation email. Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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

            {passwordError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <AuthFormFooter />
        </div>
      </div>
    </div>
  );
};