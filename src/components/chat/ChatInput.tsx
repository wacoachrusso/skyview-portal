import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if the browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        console.log('Speech recognition is supported');
        recognitionRef.current = new SpeechRecognitionAPI();
        
        if (recognitionRef.current) {
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;

          recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');
            
            console.log('Speech recognition result:', transcript);
            setMessage(transcript);
          };

          recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            toast({
              title: "Error",
              description: "There was an error with speech recognition. Please try again.",
              variant: "destructive",
            });
          };

          recognitionRef.current.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
          };
        }
      } else {
        console.log('Speech recognition is not supported');
      }
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      console.log('Speech recognition is not available');
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        console.log('Starting speech recognition');
        await recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Could not start speech recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ChatInput - Submitting message:', message);
    
    if (!message.trim()) {
      console.log('ChatInput - Empty message, not submitting');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    console.log('ChatInput - Calling onSendMessage with:', message);
    await onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('ChatInput - Enter key pressed, message:', message);
      if (message.trim() && !isLoading) {
        console.log('ChatInput - Submitting via Enter key');
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-4 bg-gradient-to-b from-[#1E1E2E] to-[#1A1F2C] border-t border-white/10">
      <div className="flex gap-2 items-end max-w-5xl mx-auto">
        <Textarea
          value={message}
          onChange={(e) => {
            console.log('ChatInput - Message changed:', e.target.value);
            setMessage(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message SkyGuide..."
          className="min-h-[40px] sm:min-h-[50px] text-sm sm:text-base resize-none bg-[#2A2F3C] border-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
          disabled={isLoading}
        />
        {!isMobile && (
          <Button 
            type="button"
            size="icon"
            variant="ghost"
            className={`text-white hover:bg-white/10 ${isListening ? 'bg-red-500/20' : ''}`}
            disabled={isLoading}
            onClick={toggleListening}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}
        <Button 
          type="submit" 
          size={isMobile ? "sm" : "icon"}
          disabled={isLoading || !message.trim()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </form>
  );
}