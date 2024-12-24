import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";

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
            ? "bg-brand-navy text-white"
            : "bg-gray-100 text-gray-900"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-50">
          {format(new Date(message.created_at), "h:mm a")}
        </span>
      </div>
    </div>
  );
}