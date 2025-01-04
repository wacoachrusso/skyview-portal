import { useState } from 'react';

export const useBulkSelection = () => {
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);

  const handleCheckboxChange = (conversationId: string, checked: boolean) => {
    setSelectedConversations(prev => 
      checked 
        ? [...prev, conversationId]
        : prev.filter(id => id !== conversationId)
    );
  };

  const clearSelection = () => {
    setSelectedConversations([]);
  };

  return {
    selectedConversations,
    handleCheckboxChange,
    clearSelection
  };
};