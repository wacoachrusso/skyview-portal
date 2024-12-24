import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

interface ChatHeaderProps {
  onBack: () => void;
  onNewChat: () => void;
}

export function ChatHeader({ onBack, onNewChat }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-white">Know Your Contract</h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewChat}
        className="text-white hover:bg-white/10 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
    </header>
  );
}