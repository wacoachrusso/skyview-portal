
import { Quote } from "lucide-react";
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

  useEffect(() => {
    if (message.role === "assistant") {
      setIsTyping(true);
      let index = 0;
      const content = message.content;
      // Speed up the typing effect significantly (increased to 20ms from 5ms)
      const typingInterval = setInterval(() => {
        // Process multiple characters at once for faster typing
        const chunkSize = 12; // Increase this number to speed up even more
        
        if (index <= content.length) {
          const newIndex = Math.min(index + chunkSize, content.length);
          setDisplayContent(content.slice(0, newIndex));
          index = newIndex;
          
          // End typing when we reach the end
          if (index >= content.length) {
            clearInterval(typingInterval);
            setIsTyping(false);
          }
        }
      }, 20); // Increased interval for better performance

      return () => clearInterval(typingInterval);
    } else {
      setDisplayContent(message.content);
    }
  }, [message.content, message.role]);

  const formatContent = (content: string) => {
    const parts = content.split(/(\[REF\].*?\[\/REF\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[REF]') && part.endsWith('[/REF]')) {
        const quote = part.replace('[REF]', '').replace('[/REF]', '');
        return (
          <div key={index} className="flex items-start gap-2 my-2 text-pink-300">
            <Quote className="h-4 w-4 mt-1 flex-shrink-0" />
            <em className="italic">{quote}</em>
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
    </div>
  );
}
