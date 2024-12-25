import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  onBack: () => void;
  onNewChat: () => void;
}

export function ChatHeader({ onBack, onNewChat }: ChatHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-gradient-to-r from-[#1A1F2C] to-[#2A2F3C]">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-gold" strokeWidth={1.5} />
          <h1 className="text-base sm:text-xl font-semibold text-white">Know Your Contract</h1>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewChat}
        className="text-white hover:bg-white/10 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Chat</span>
      </Button>
    </header>
  );
}