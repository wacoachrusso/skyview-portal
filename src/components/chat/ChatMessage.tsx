import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";
import { TypeAnimation } from 'react-type-animation';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const formatContent = (content: string) => {
    // Check if content contains a list or table-like structure
    if (content.includes("1.") || content.includes("•") || content.includes("|")) {
      const rows = content.split(/\d+\.\s+|\n/).filter(Boolean);
      
      // Check if it's a table structure (contains ":" or "|")
      if (content.includes(":") || content.includes("|")) {
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                {rows.map((row, index) => {
                  const [header, value] = row.split(/[:|]/).map(s => s.trim());
                  if (!header || !value) return null;
                  return (
                    <tr key={index} className="border-t border-white/10">
                      <td className="py-2 px-4 font-medium">{header}</td>
                      <td className="py-2 px-4">{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      
      // If it's a list, format as bullet points
      return (
        <ul className="list-disc list-inside space-y-2">
          {rows.map((item, index) => (
            <li key={index} className="pl-2">{item.trim()}</li>
          ))}
        </ul>
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
            <TypeAnimation
              sequence={[message.content]}
              wrapper="div"
              cursor={false}
              repeat={0}
              speed={90} // Increased typing speed (lower number = faster)
              className="whitespace-pre-wrap"
            />
          </div>
        )}
        <span className="text-[10px] sm:text-xs opacity-50">
          {format(new Date(message.created_at), "h:mm a")}
        </span>
      </div>
    </div>
  );
}