import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

export function TrialEndedState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertDescription>
          Your free trial has ended. Please select a subscription plan to continue using SkyGuide.
        </AlertDescription>
      </Alert>
      <button
        onClick={() => navigate('/?scrollTo=pricing-section')}
        className="mt-4 bg-brand-gold hover:bg-brand-gold/90 text-black px-4 py-2 rounded-md"
      >
        View Plans
      </button>
    </div>
  );
}