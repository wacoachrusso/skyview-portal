
import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { WelcomeMessage } from "./WelcomeMessage";
import { motion } from "framer-motion";
import { LoadingSpinner } from "../shared/LoadingSpinner";

interface ChatContainerProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => Promise<void>;
  onSelectQuestion?: (question: string) => void;
}

export function ChatContainer({ 
  messages, 
  currentUserId, 
  isLoading, 
  onCopyMessage,
  onSelectQuestion
}: ChatContainerProps) {
  console.log('ChatContainer rendering with messages:', messages);
  
  // Only show welcome message if there are no messages
  const showWelcomeMessage = messages.length === 0;

  return (
    <motion.div 
      className="flex-1 h-full w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading && messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="md" />
        </div>
      ) : showWelcomeMessage ? (
        <WelcomeMessage onSelectQuestion={onSelectQuestion} />
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
