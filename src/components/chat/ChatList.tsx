import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
}

export function ChatList({ messages, currentUserId }: ChatListProps) {
  return (
    <div className="flex flex-col gap-2 p-4 overflow-y-auto">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isCurrentUser={message.user_id === currentUserId}
        />
      ))}
    </div>
  );
}