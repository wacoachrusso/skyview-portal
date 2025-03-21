
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MessageWrapperProps {
  children: ReactNode;
  isCurrentUser: boolean;
}

export function MessageWrapper({ children, isCurrentUser }: MessageWrapperProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-2 p-1 sm:p-2 group animate-fade-in",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {children}
    </div>
  );
}
