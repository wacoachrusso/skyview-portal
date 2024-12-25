import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";
import { TypeAnimation } from 'react-type-animation';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const formatTableContent = (content: string) => {
    if (content.includes("years of service")) {
      const rows = content.split(/\d+\.\s+/).filter(Boolean);
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-white/5 text-white font-semibold">Years of Service</th>
                <th className="py-2 px-4 bg-white/5 text-white font-semibold">Vacation Days</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const [years, days] = row.split(':').map(s => s.trim());
                return (
                  <tr key={index} className="border-t border-white/10">
                    <td className="py-2 px-4">{years}</td>
                    <td className="py-2 px-4">{days}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    return content;
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 p-1 sm:p-2",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 sm:px-4 sm:py-2",
          isCurrentUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
            : "bg-gradient-to-r from-[#2A2F3C] to-[#1E1E2E] text-white shadow-md"
        )}
      >
        {isCurrentUser ? (
          <p className="text-sm sm:text-base">{message.content}</p>
        ) : (
          <div className="text-sm sm:text-base min-h-[20px]">
            {typeof message.content === 'string' ? formatTableContent(message.content) : message.content}
          </div>
        )}
        <span className="text-[10px] sm:text-xs opacity-50">
          {format(new Date(message.created_at), "h:mm a")}
        </span>
      </div>
    </div>
  );
}