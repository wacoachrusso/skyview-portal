import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { checkExistingUser, getUserIpAddress } from "@/utils/authOperations";

interface AuthFormSubmitProps {
  formData: {
    email: string;
    password: string;
    full_name?: string;
    user_type?: string;
    airline?: string;
  };
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
  const { toast } = useToast();

  const handleSignIn = async () => {
    console.log("Starting sign in process");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (!data.user?.email_confirmed_at) {
        console.log("Email not confirmed");
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please check your email and verify your account before signing in.",
        });
        return;
      }

      console.log("Sign in successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid email or password",
      });
    }
  };

  const handleSignUp = async () => {
    const finalSelectedPlan = selectedPlan || "monthly";
    console.log("Starting signup process with plan:", finalSelectedPlan);

    try {
      const userExists = await checkExistingUser(formData.email, formData.password);
      if (userExists) {
        setLoading(false);
        return;
      }

      const ip = await getUserIpAddress();

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: formData.user_type,
            airline: formData.airline,
            subscription_plan: finalSelectedPlan,
            last_ip_address: ip,
          },
        },
      });

      if (error) throw error;

      console.log("Sign up successful:", data);
      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
      });

      navigate("/login");
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create account. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
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