
import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { WelcomeMessage } from "./WelcomeMessage";
import { motion } from "framer-motion";

interface ChatContainerProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
}

export function ChatContainer({ 
  messages, 
  currentUserId, 
  isLoading, 
  onCopyMessage 
}: ChatContainerProps) {
  console.log('ChatContainer rendering with messages:', messages);
  
  // Only show welcome message if there are no messages and not loading
  const showWelcomeMessage = messages.length === 0 && !isLoading;

  return (
    <motion.div 
      className="flex-1 h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showWelcomeMessage ? (
        <WelcomeMessage />
      ) : (
        <ChatList
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
          onCopyMessage={onCopyMessage}
        />
      )}
    </motion.div>
  );
}
