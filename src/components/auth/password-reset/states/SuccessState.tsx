
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SuccessState = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-xl font-semibold text-white mb-2">Password Reset Complete</h1>
      <p className="text-gray-400 mb-6">
        Your password has been successfully reset. You'll be redirected to the login page shortly.
      </p>
      <Button
        onClick={() => navigate("/login")}
        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold py-2 px-4 rounded"
      >
        Go to Login
      </Button>
    </>
  );
};
