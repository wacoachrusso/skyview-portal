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
        // Store in localStorage for offline access
        localStorage.setItem('current-chat-messages', JSON.stringify(messages));
        
        // Also store in IndexedDB for larger storage
        if ('indexedDB' in window) {
          const request = indexedDB.open('chatApp', 1);
          
          request.onerror = () => {
            console.error('Error opening IndexedDB');
          };
          
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('messages')) {
              db.createObjectStore('messages', { keyPath: 'id' });
            }
          };
          
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const tx = db.transaction('messages', 'readwrite');
            const store = tx.objectStore('messages');
            
            messages.forEach(message => {
              store.put(message);
            });
            
            console.log('Messages cached in IndexedDB');
          };
        }
        
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