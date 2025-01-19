import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, useCallback, useRef } from "react";

interface MicButtonProps {
  onRecognized: (text: string) => void;
  disabled?: boolean;
}

export function MicButton({ onRecognized, disabled }: MicButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>("");

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const startSilenceDetection = () => {
    resetSilenceTimeout();
    silenceTimeoutRef.current = setTimeout(() => {
      console.log('Silence detected, stopping recognition');
      if (recognition && isListening) {
        recognition.stop();
        setIsListening(false);
      }
    }, 1500); // Stop after 1.5 seconds of silence
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false; // Changed to false to prevent duplicates
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join(' ');
          
          console.log('Speech recognition result:', transcript);
          
          // Only update if the transcript has changed
          if (transcript !== transcriptRef.current) {
            transcriptRef.current = transcript;
            onRecognized(transcript);
          }
          
          startSilenceDetection();
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          resetSilenceTimeout();
        };

        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          resetSilenceTimeout();
          transcriptRef.current = ""; // Reset transcript reference
        };

        setRecognition(recognitionInstance);
      }
    }

    return () => {
      resetSilenceTimeout();
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  }, [onRecognized]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      console.log('Speech recognition not available');
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      recognition.stop();
      setIsListening(false);
      resetSilenceTimeout();
    } else {
      console.log('Starting speech recognition');
      try {
        transcriptRef.current = ""; // Reset transcript reference
        recognition.start();
        setIsListening(true);
        startSilenceDetection();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [recognition, isListening]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type="button"
            size="icon"
            variant="ghost"
            className={`text-white hover:bg-white/10 transition-colors ${isListening ? 'bg-red-500/20' : ''}`}
            disabled={disabled}
            onClick={toggleListening}
            aria-label={isListening ? "Stop dictation" : "Start dictation"}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? "Stop dictation" : "Start dictation"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}