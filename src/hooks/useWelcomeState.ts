
import { useState, useEffect } from 'react';

export function useWelcomeState(conversationId: string | null) {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  
  useEffect(() => {
    if (conversationId) {
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, [conversationId]);
  
  return { showWelcome, setShowWelcome };
}
