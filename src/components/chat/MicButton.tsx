import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  isListening: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function MicButton({ isListening, isLoading, onToggle }: MicButtonProps) {
  return (
    <Button 
      type="button"
      size="icon"
      variant="ghost"
      className={`text-white hover:bg-white/10 ${isListening ? 'bg-red-500/20' : ''}`}
      disabled={isLoading}
      onClick={onToggle}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}