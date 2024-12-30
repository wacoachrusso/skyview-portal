import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hasConsented = localStorage.getItem("privacy-consent");
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("privacy-consent", "true");
    setShowBanner(false);
    toast({
      title: "Consent Saved",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleViewPolicy = () => {
    navigate("/privacy-policy");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground">
          We use cookies and similar technologies to improve your experience. By continuing to use our service,
          you agree to our{" "}
          <button
            onClick={handleViewPolicy}
            className="text-brand-gold hover:underline"
          >
            Privacy Policy
          </button>
          .
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleViewPolicy}
          >
            Learn More
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-brand-gold hover:bg-brand-gold/90 text-black"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};