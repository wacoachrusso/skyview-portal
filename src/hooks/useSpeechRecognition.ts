import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognitionAPI) {
          console.log('Speech recognition is supported');
          recognitionRef.current = new SpeechRecognitionAPI();
          
          if (recognitionRef.current) {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
              console.log('Speech recognition result received');
              resetSilenceTimeout();

              let finalTranscript = '';
              let interimTranscript = '';

              for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                  finalTranscript += transcript;
                } else {
                  interimTranscript += transcript;
                }
              }

              const newTranscript = finalTranscript || interimTranscript;
              console.log('Speech recognition result:', newTranscript);
              setTranscript(newTranscript);

              startSilenceDetection();
            };

            recognitionRef.current.onerror = (event) => {
              console.error('Speech recognition error:', event.error);
              handleSpeechError(event.error);
              stopListening();
            };

            recognitionRef.current.onend = () => {
              console.log('Speech recognition ended');
              setIsListening(false);
            };
          }
        } else {
          console.log('Speech recognition is not supported');
          toast({
            title: "Not Supported",
            description: "Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        toast({
          title: "Error",
          description: "Failed to initialize speech recognition. Please try a different browser.",
          variant: "destructive",
        });
      }
    }

    return () => {
      cleanup();
    };
  }, []);

  const handleSpeechError = (error: string) => {
    let message = "There was an error with speech recognition. Please try again.";
    
    switch (error) {
      case 'not-allowed':
        message = "Please allow microphone access to use speech recognition.";
        break;
      case 'no-speech':
        message = "No speech was detected. Please try again.";
        break;
      case 'network':
        message = "Network error occurred. Please check your connection.";
        break;
      case 'aborted':
        message = "Speech recognition was aborted.";
        break;
    }

    toast({
      title: "Speech Recognition Error",
      description: message,
      variant: "destructive",
    });
  };

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
    }, 2000); // Stop after 2 seconds of silence
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('Stopping speech recognition');
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
    resetSilenceTimeout();
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      console.log('Speech recognition is not available');
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.",
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
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error cleaning up speech recognition:', error);
      }
    }
    resetSilenceTimeout();
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  return {
    isListening,
    transcript,
    toggleListening,
    stopListening,
    setTranscript
  };
}