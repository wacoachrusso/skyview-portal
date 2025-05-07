import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";

// If you need to expand this type inline without modifying the original interface
type MessageWithStreamingProps = Message & {
  isTemp?: boolean;
  isStreaming?: boolean;
};

/**
 * A simplified function that handles sending a message and receiving AI response
 * without relying on React hooks.
 */
export async function handleSendMessage({
  content,
  currentUserId,
  currentConversationId,
  setMessages,
  setCurrentConversationId,
  setIsLoading,
  setConversations,
  setQueryCount,
  toast
}: {
  content: string;
  currentUserId: string | null;
  currentConversationId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<MessageWithStreamingProps[]>>;
  setCurrentConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setQueryCount: React.Dispatch<React.SetStateAction<number>>;
  toast: any;
}): Promise<void> {
  // Validate required parameters
  if (!currentUserId) {
    toast({
      title: "Error",
      description: "You need to be logged in to send messages.",
      variant: "destructive",
      duration: 2000,
    });
    return;
  }

  // Set loading state
  setIsLoading(true);
  
  let newConversationId = currentConversationId;
  let tempUserMessageId = `temp-${Date.now()}`;

  try {
    // Create a new conversation if one doesn't exist
    if (!newConversationId) {
      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: currentUserId,
            title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      newConversationId = newConversation.id;
      setCurrentConversationId(newConversationId);
      setConversations((prev) => [newConversation, ...prev]);
    }

    // Add temporary user message to the UI
    const tempUserMessage: MessageWithStreamingProps = {
      id: tempUserMessageId,
      content,
      user_id: currentUserId,
      role: "user", // This is now explicitly "user", matching the Message type
      conversation_id: newConversationId,
      created_at: new Date().toISOString(),
      isTemp: true
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    // Insert the user message into the database
    const { data: userMessage, error: userMessageError } = await supabase
      .from("messages")
      .insert([
        {
          content,
          user_id: currentUserId,
          role: "user",
          conversation_id: newConversationId,
        },
      ])
      .select()
      .single();

    if (userMessageError) throw userMessageError;

    // Replace the temporary message with the saved message
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === tempUserMessageId) {
          // Ensure we're returning a properly typed Message object
          return {
            ...userMessage,
            role: userMessage.role as "user" | "assistant", // Ensure the role is properly typed
          } as Message;
        }
        return msg;
      })
    );

    // Create a streaming indicator message
    const streamingId = `streaming-${Date.now()}`;
    const streamingMessage: MessageWithStreamingProps = {
      id: streamingId,
      content: "",
      user_id: null,
      role: "assistant", // Explicitly typed as "assistant"
      conversation_id: newConversationId,
      created_at: new Date().toISOString(),
      isStreaming: true
    };

    setMessages((prev) => [...prev, streamingMessage]);

    // Get user profile for subscription info
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUserId)
      .single();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    console.log(`access token is found, so we can proceed for chat`)
    // Call the AI service
    console.time('benchmark');
    console.time('ttfb');
    // const res = await fetch('http://localhost:54321/functions/v1/chat-completion', {
    const res = await fetch('https://xnlzqsoujwsffoxhhybk.supabase.co/functions/v1/chat-completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ content, subscriptionPlan: profile?.subscription_plan || "free", assistantId: profile?.assistant_id || "default_assistant_id", priority: true, stream: true }),
    });
    console.timeEnd('benchmark')
    let fullContent = "";
    if (!res.ok || !res.body) {
      console.log('error happened during chat-completion request')
      // Fallback for unexpected response format
      fullContent = "I'm sorry, I couldn't generate a response.";
      
      // Update streaming message with fallback content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingId
            ? { ...msg, content: fullContent, isStreaming: false }
            : msg
        )
      );
      
      // Insert AI message to database
      await insertAIMessage(fullContent, newConversationId);
    }
    
    let lastProcessedContent = ""
    const reader = res.body.getReader();
    // const decoder = new TextDecoder("utf-8");
    
    const aiResponse = {
      onChunk: null,
      onComplete: null,
      onError: null,
    };

    aiResponse.onChunk = (chunk: string) => {
      fullContent += chunk;
    
      // Update streaming message with new content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingId ? { ...msg, content: fullContent } : msg
        )
      );
    };
    
    aiResponse.onComplete = async () => {
      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingId ? { ...msg, isStreaming: false } : msg
        )
      );
    
      // Insert AI message to the database
      await insertAIMessage(fullContent, newConversationId as string);
    };
    aiResponse.onError = (error: Error) => {
      console.error("Error in AI response stream:", error);
      toast({
        title: "Error",
        description: "Error receiving the complete response.",
        variant: "destructive",
        duration: 2000,
      });
      
      // Remove streaming message
      setMessages((prev) => prev.filter((msg) => msg.id !== streamingId));
    };

    // const reader = stream.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    let partialLine = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('Stream ended.');
        aiResponse.onComplete?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Combine leftover from last chunk
      const lines = buffer.split('\n');
      buffer = ''; // Clear buffer — we’ll handle leftover manually

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // First, combine with partialLine if it exists
        if (partialLine) {
          line = partialLine + line;
          partialLine = '';
        }

        if (!line.startsWith('data: ')) continue;

        let json = line.replace('data: ', '').trim();

        // If it's the last line and not complete, store for next round
        if (i === lines.length - 1 && json[json.length - 1] !== '}') {
          partialLine = json;
          continue;
        }

        if (json === '[DONE]') continue;

        try {
          const event = JSON.parse(json);

          if (event.object === 'thread.message.delta') {
            const text = event.delta?.content?.[0]?.text?.value;
            if (text) {
              if (!fullContent) console.timeEnd('ttfb');
              aiResponse.onChunk(text);
            }
          }
        } catch (err) {
          console.error('Stream parse error:', err, '\nBroken JSON:', json);
          // Keep partial if it's likely incomplete JSON
          partialLine = json;
        }
      }
    }

    // Update query count
    if (profile && profile.subscription_plan === "free") {
      const newQueryCount = (profile.query_count || 0) + 1;
      await supabase
        .from("profiles")
        .update({ query_count: newQueryCount })
        .eq("id", currentUserId);
      setQueryCount(newQueryCount);
    }

  } catch (error) {
    console.error("Error in handleSendMessage:", error);
    toast({
      title: "Error",
      description: "Failed to send message. Please try again.",
      variant: "destructive",
      duration: 2000,
    });

    // Remove the temporary user message if there was an error
    setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessageId));
  } finally {
    setIsLoading(false);
  }
}

// Helper function to insert AI messages
async function insertAIMessage(content: string, conversationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("messages")
      .insert([
        {
          content,
          user_id: null,
          role: "assistant",
          conversation_id: conversationId,
        },
      ]);

    if (error) {
      console.error("Error inserting AI message:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in insertAIMessage:", error);
    throw error;
  }
}