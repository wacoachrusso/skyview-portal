import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";
import { TypeAnimation } from 'react-type-animation';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-2 p-2",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1 rounded-lg px-4 py-2",
          isCurrentUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
            : "bg-gradient-to-r from-[#2A2F3C] to-[#1E1E2E] text-white shadow-md"
        )}
      >
        {isCurrentUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <TypeAnimation
            sequence={[message.content]}
            wrapper="p"
            speed={99}
            className="text-sm min-h-[20px]"
            cursor={false}
          />
        )}
        <span className="text-xs opacity-50">
          {format(new Date(message.created_at), "h:mm a")}
        </span>
      </div>
    </div>
  );
}