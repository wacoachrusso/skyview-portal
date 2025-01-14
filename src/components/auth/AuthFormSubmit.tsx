import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { handleSignIn } from "@/utils/signInUtils";
import { handleSignUp, SignUpData } from "@/utils/signUpUtils";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormSubmitProps {
  formData: SignUpData;
  selectedPlan?: string;
  isSignUp?: boolean;
}

export const AuthFormSubmit = ({
  formData,
  selectedPlan,
  isSignUp,
}: AuthFormSubmitProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate and store CSRF token for auth flow
      if (isSignUp) {
        const csrfToken = crypto.randomUUID();
        localStorage.setItem('auth_state', csrfToken);
        
        // Store selected plan if present
        const planFromUrl = new URLSearchParams(window.location.search).get('plan');
        const finalPlan = planFromUrl || selectedPlan;
        if (finalPlan) {
          localStorage.setItem('selected_plan', finalPlan);
        }
      }

      // Check for existing sessions and clear them
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }

      // Clear any sensitive data from localStorage
      localStorage.removeItem('supabase.auth.token');
      
      if (isSignUp) {
        console.log('Starting signup process with plan:', selectedPlan);
        const success = await handleSignUp(formData, selectedPlan);
        if (success) {
          navigate("/login");
        }
      } else {
        const success = await handleSignIn(formData.email, formData.password);
        if (success) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="submit"
      className="w-full"
      onClick={handleSubmit}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSignUp ? (
        "Sign Up"
      ) : (
        "Sign In"
      )}
    </Button>
  );
};