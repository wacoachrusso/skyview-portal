import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  onBack: () => void;
}

export function ChatHeader({ onBack }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-4 p-4 border-b border-white/10">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-xl font-semibold text-white">Know Your Contract</h1>
    </header>
  );
}