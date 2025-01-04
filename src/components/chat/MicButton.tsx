import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function MicButton({ isListening, onStart, onStop, disabled }: MicButtonProps) {
  return (
    <Button 
      type="button"
      size="icon"
      variant="ghost"
      className={`text-white hover:bg-white/10 ${isListening ? 'bg-red-500/20' : ''}`}
      disabled={disabled}
      onClick={isListening ? onStop : onStart}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}