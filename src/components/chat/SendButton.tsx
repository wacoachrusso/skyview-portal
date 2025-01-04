import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <Button 
      type="button" 
      size="icon"
      disabled={disabled}
      onClick={onClick}
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
    >
      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
    </Button>
  );
}