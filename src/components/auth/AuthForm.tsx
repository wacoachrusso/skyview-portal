import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormFields } from "./AuthFormFields";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthFormSubmit } from "./AuthFormSubmit";
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
        if (!session?.user?.email_confirmed_at) {
          console.log("Email not confirmed - signing out");
          await supabase.auth.signOut();
          toast({
            title: "Email verification required",
            description: "Please check your email and confirm your address before signing in.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        console.log("User signed in after email confirmation");
        toast({
          title: "Welcome to SkyGuide!",
          description: finalSelectedPlan === 'free' 
            ? "Your email has been confirmed. You have 2 queries available."
            : "Your email has been confirmed. Your account is now active.",
        });
        navigate('/chat');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, finalSelectedPlan, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const authFormData = {
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      user_type: formData.jobTitle,
      airline: formData.airline,
    };
    
    return <AuthFormSubmit 
      formData={authFormData}
      selectedPlan={finalSelectedPlan}
      isSignUp={true}
    />;
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