import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';

export function useMessageStorage(currentMessages: Message[]) {
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);

  // Load stored messages when component mounts
  useEffect(() => {
    try {
      const stored = localStorage.getItem('current-chat-messages');
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        console.log('Loaded stored messages:', parsedMessages.length);
        setStoredMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading stored messages:', error);
    }
  }, []);

  // Update stored messages whenever current messages change
  const updateStoredMessages = (messages: Message[]) => {
    try {
      if (messages.length > 0) {
        localStorage.setItem('current-chat-messages', JSON.stringify(messages));
        setStoredMessages(messages);
        console.log('Successfully stored messages for offline access:', messages.length);
      }
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  };

  // If there are current messages, use those. Otherwise, use stored messages
  const messages = currentMessages.length > 0 ? currentMessages : storedMessages;

  return {
    storedMessages: messages,
    setStoredMessages: updateStoredMessages
  };
}