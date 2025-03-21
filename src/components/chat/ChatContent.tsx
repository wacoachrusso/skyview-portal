
import React from 'react';
import { WelcomeMessage } from './WelcomeMessage';
import { ChatMessage } from './ChatMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export interface ChatContentProps {
  messages: any[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  showWelcome: boolean;
  currentConversationId: string | null;
}

export function ChatContent({ 
  messages, 
  isLoading, 
  onSendMessage, 
  showWelcome,
  currentConversationId
}: ChatContentProps) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col w-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : showWelcome ? (
          <WelcomeMessage onSelectQuestion={(question) => onSendMessage(question)} />
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isUserMessage={message.role === 'user'}
            />
          ))
        )}
      </div>
    </div>
  );
}
