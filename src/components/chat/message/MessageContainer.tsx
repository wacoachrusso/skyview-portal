
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MessageContainerProps {
  children: ReactNode;
  isCurrentUser: boolean;
}

export function MessageContainer({ children, isCurrentUser }: MessageContainerProps) {
  return (
    <div
      className={cn(
        "flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 rounded-xl px-3 py-2 sm:px-4 sm:py-2 relative shadow-lg transition-all duration-300",
        isCurrentUser
          ? "bg-chat-user-gradient text-white border border-blue-500/10"
          : "bg-chat-ai-gradient text-white border border-white/5"
      )}
    >
      {/* Message glow effect */}
      {isCurrentUser && (
        <div className="absolute inset-0 -z-10 bg-blue-500/5 rounded-xl blur-md opacity-75" />
      )}
      
      {children}
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </div>
  );
}
