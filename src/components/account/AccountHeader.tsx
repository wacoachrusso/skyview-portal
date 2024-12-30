import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AccountHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6">
      <Button
        variant="secondary"
        onClick={() => navigate('/dashboard')}
        className="text-white hover:bg-brand-gold hover:text-black transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
    </div>
  );
};