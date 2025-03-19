
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  errorMessage: string;
}

export const ErrorState = ({ errorMessage }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h1>
      <p className="text-gray-400 mb-6">
        {errorMessage}
      </p>
      <Button
        onClick={() => navigate("/forgot-password")}
        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold py-2 px-4 rounded"
      >
        Request New Link
      </Button>
    </>
  );
};
