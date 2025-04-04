
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface SendButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  isMobile?: boolean;
}

export function SendButton({ isLoading, disabled, isMobile = false }: SendButtonProps) {
  return (
    <Button 
      type="submit" 
      size={isMobile ? "sm" : "icon"}
      disabled={isLoading || disabled}
      className="bg-gradient-to-r from-brand-purple to-brand-magenta hover:from-brand-purple/90 hover:to-brand-magenta/90 text-white transition-all duration-300 shadow-sm"
    >
      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
    </Button>
  );
}
