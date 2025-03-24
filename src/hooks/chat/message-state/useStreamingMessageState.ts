
import { Message } from "@/types/chat";

/**
 * Hook to manage streaming message updates
 */
export function useStreamingMessageState(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  // Add a streaming AI message that will be updated in real-time
  const addStreamingMessage = (conversationId: string): string => {
    const streamingId = 'streaming-' + Date.now().toString();
    const streamingMessage: Message = {
      id: streamingId,
      conversation_id: conversationId,
      user_id: null,
      content: '',
      role: "assistant",
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, streamingMessage]);
    return streamingId;
  };

  // Update the streaming message content as it arrives
  const updateStreamingMessage = (streamingId: string, content: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === streamingId 
          ? { ...msg, content: content }
          : msg
      )
    );
  };

  // Finish the streaming message with final content
  const finishStreamingMessage = (streamingId: string, finalContent: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === streamingId 
          ? { ...msg, content: finalContent }
          : msg
      )
    );
  };

  return {
    addStreamingMessage,
    updateStreamingMessage,
    finishStreamingMessage,
  };
}
