import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/useLogout";
import { forceNavigate } from "@/utils/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Plus,
  UserCircle,
} from "lucide-react";

interface ChatHeaderProps {
  startNewChat: () => void;
  setIsSidebarOpen: (value: boolean) => void;
  showBackButton?: boolean;
  isSidebarOpen?: boolean;
  userName: string;
  onBack?: () => void;
}

const ChatHeader = ({
  isSidebarOpen,
  setIsSidebarOpen,
  userName,
  startNewChat,
  onBack,
  showBackButton = false,
}: ChatHeaderProps) => {
  const isMobile = useIsMobile();
  const { handleLogout } = useLogout();
  
  // Handle custom sign out to clear cached data
  const handleSignOut = async () => {
    try {
      // Clear cached data on sign out
      sessionStorage.removeItem("cached_user_profile");
      sessionStorage.removeItem("cached_auth_user");
      handleLogout();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  
  return (
    <header className="flex items-center justify-between bg-slate-800 text-white p-4 h-16 border-b border-slate-700">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>
        )}
        <div className={`hidden items-center gap-2 ${isMobile ? "ml-10" : ""}`}>
          <div className="items-center justify-center">
            <img
              src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png"
              alt="SkyGuide Logo"
              className="h-7 w-auto premium-logo-glow transition-all duration-300"
            />
          </div>
          <h1 className="text-lg font-semibold text-foreground leading-none gradient-text">
            SkyGuide
          </h1>
        </div>
      </div>
      <div className="hidden items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mr-4 p-2 rounded hover:bg-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">SkyGuide</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => forceNavigate("/dashboard")}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Dashboard</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => forceNavigate("/account")}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center transition-colors"
        >
          <UserCircle className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Account</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={startNewChat}
          className="text-secondary-foreground bg-secondary/90 hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">New Chat</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Logout</span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;