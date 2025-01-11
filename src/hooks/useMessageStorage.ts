import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';

export function useMessageStorage(messages: Message[]) {
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages.length > 0) {
      console.log('Storing messages in chat history:', messages.length, 'messages');
      try {
        localStorage.setItem('current-chat-messages', JSON.stringify(messages));
        console.log('Stored current chat messages in localStorage');
      } catch (error) {
        console.error('Error storing messages in localStorage:', error);
      }
    }
  }, [messages]);

  useEffect(() => {
    const stored = localStorage.getItem('current-chat-messages');
    if (stored) {
      try {
        const parsedMessages = JSON.parse(stored);
        setStoredMessages(parsedMessages);
        console.log('Loaded stored messages for offline use:', parsedMessages.length);
      } catch (error) {
        console.error('Error loading stored messages:', error);
      }
    }
  }, []);

  return { storedMessages, setStoredMessages };
}