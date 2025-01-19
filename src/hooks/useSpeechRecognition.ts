import { useState, useEffect, useRef } from "react";

interface UseSpeechRecognitionProps {
  onRecognized: (text: string) => void;
}

export function useSpeechRecognition({ onRecognized }: UseSpeechRecognitionProps) {
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
    }, 1500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join(' ');
          
          console.log('Speech recognition result:', transcript);
          
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
          transcriptRef.current = "";
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

  const toggleListening = () => {
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
        transcriptRef.current = "";
        recognition.start();
        setIsListening(true);
        startSilenceDetection();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  return {
    isListening,
    toggleListening
  };
}