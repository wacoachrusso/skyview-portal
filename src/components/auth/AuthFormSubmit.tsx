import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { handleSignIn } from "@/utils/signInUtils";
import { handleSignUp, SignUpData } from "@/utils/signUpUtils";

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
      if (isSignUp) {
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