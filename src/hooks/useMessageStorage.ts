import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';

export function useMessageStorage(messages: Message[]) {
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Load stored messages on mount
    const loadStoredMessages = () => {
      try {
        const stored = localStorage.getItem('current-chat-messages');
        if (stored) {
          const parsedMessages = JSON.parse(stored);
          console.log('Loaded stored messages for offline use:', parsedMessages.length);
          setStoredMessages(parsedMessages);
        }
      } catch (error) {
        console.error('Error loading stored messages:', error);
      }
    };

    loadStoredMessages();
  }, []);

  const updateStoredMessages = (newMessages: Message[]) => {
    try {
      localStorage.setItem('current-chat-messages', JSON.stringify(newMessages));
      setStoredMessages(newMessages);
      console.log('Successfully stored messages for offline use:', newMessages.length);
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  };

  return { 
    storedMessages, 
    setStoredMessages: updateStoredMessages 
  };
}