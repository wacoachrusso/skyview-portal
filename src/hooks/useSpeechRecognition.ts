import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        console.log('Speech recognition is supported');
        setHasRecognitionSupport(true);
        recognitionRef.current = new SpeechRecognitionAPI();
        
        if (recognitionRef.current) {
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;

          recognitionRef.current.onresult = (event) => {
            console.log('Speech recognition result received');
            resetSilenceTimeout();

            const newTranscript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');
            
            console.log('Speech recognition result:', newTranscript);
            setTranscript(newTranscript);

            startSilenceDetection();
          };

          recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
            toast({
              title: "Error",
              description: "There was an error with speech recognition. Please try again.",
              variant: "destructive",
            });
          };

          recognitionRef.current.onend = () => {
            console.log('Speech recognition ended');
            stopListening();
          };
        }
      } else {
        console.log('Speech recognition is not supported');
        setHasRecognitionSupport(false);
      }
    }

    return () => {
      cleanup();
    };
  }, []);

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
      stopListening();
    }, 1500); // Stop after 1.5 seconds of silence
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
    }
    setIsListening(false);
    resetSilenceTimeout();
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      console.log('Speech recognition is not available');
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting speech recognition');
      resetSilenceTimeout();
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
  };

  const cleanup = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    resetSilenceTimeout();
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript,
    hasRecognitionSupport
  };
}