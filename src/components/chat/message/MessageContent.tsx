import { Message } from "@/types/chat";
import { TypeAnimation } from "react-type-animation";
import ReactMarkdown from "react-markdown";

interface MessageContentProps {
  message: Message;
  isCurrentUser: boolean;
}

function formatContent(content: string) {
  return content.replace(/\[REF\](.*?)\[\/REF\]/g, (_, p1) => `> **Reference:** ${p1}`);
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  if (isCurrentUser) {
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      <TypeAnimation
        sequence={[message.content]}
        wrapper="div"
        cursor={false}
        repeat={0}
        speed={90}
        className="whitespace-pre-wrap"
      />
    </div>
  );
}