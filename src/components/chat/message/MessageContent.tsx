
import { Quote, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface MessageContentProps {
  message: {
    content: string;
    role: string;
  };
  isCurrentUser: boolean;
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const [displayContent, setDisplayContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (message.role === "assistant") {
      setIsTyping(true);
      setIsComplete(false);
      let index = 0;
      const content = message.content;
      
      // Clear any existing interval first
      const typingInterval = setInterval(() => {
        if (index <= content.length) {
          setDisplayContent(content.slice(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setIsComplete(true);
        }
      }, 5); // Increased typing speed for better user experience

      return () => clearInterval(typingInterval);
    } else {
      setDisplayContent(message.content);
      setIsComplete(true);
    }
  }, [message.content, message.role]);

  const formatContent = (content: string) => {
    // Split content by reference markers (🔹 Reference:)
    const parts = content.split(/(🔹 Reference:.*?)(?=\n|$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('🔹 Reference:')) {
        // Style the reference block
        return (
          <div key={index} className="flex items-start gap-2 my-3 p-3 text-blue-300 bg-blue-950/30 rounded-md border-l-4 border-blue-500/50 font-medium">
            <Quote className="h-4 w-4 mt-1 flex-shrink-0" />
            <div className="flex-1">{part}</div>
          </div>
        );
      } else if (part.includes('No specific contract reference was found')) {
        // Handle the "no reference found" message
        return (
          <div key={index} className="flex items-start gap-2 my-3 p-3 text-amber-300 bg-amber-950/20 rounded-md border-l-4 border-amber-500/50 italic">
            <Quote className="h-4 w-4 mt-1 flex-shrink-0" />
            <em>{part}</em>
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="whitespace-pre-wrap break-words">
      {formatContent(displayContent)}
      {isTyping && (
        <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
      )}
      {isComplete && message.role === "assistant" && (
        <div className="flex items-center text-xs text-gray-400 mt-2">
          <Check className="h-3 w-3 mr-1" />
          <span>Generated from contract</span>
        </div>
      )}
    </div>
  );
}
