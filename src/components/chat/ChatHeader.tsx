import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  onBack: () => void;
  onNewChat: () => void;
}

export function ChatHeader({ onBack, onNewChat }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
          <img 
            src="/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png" 
            alt="SkyGuide Logo" 
            className="h-5 w-5 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <h1 className="text-base sm:text-xl font-semibold text-white">Know Your Contract</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="text-white hover:bg-white/10 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy flex items-center gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>
      </div>
    </header>
  );
}