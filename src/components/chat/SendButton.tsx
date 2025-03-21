
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
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
      aria-label="Send message"
    >
      {isLoading ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </Button>
  );
}
