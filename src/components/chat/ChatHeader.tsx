import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/useLogout";
import { forceNavigate } from "@/utils/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  UserCircle,
} from "lucide-react";
import { ChatSettings } from "./ChatSettings";
import { useTheme } from "../theme-provider";
import ChatHeaderButton from "./ChatHeaderButton";

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
  const { theme } = useTheme();
  // Handle custom sign out to clear cached data
  const handleSignOut = async () => {
    try {
      // Clear cached data on sign out
      sessionStorage.removeItem("cached_user_profile");
      sessionStorage.removeItem("cached_auth_user");
      sessionStorage.removeItem("auth_status");
      handleLogout();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <header
      className={`flex items-center justify-between p-4 h-16 border-b ${
        theme === "dark"
          ? "bg-slate-800 text-white border-slate-700"
          : "bg-gradient-to-r from-gray-200 to-slate-200 text-slate-800 border-gray-300"
      }`}
    >
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={`hover:bg-accent/50 transition-colors ${
              theme === "dark"
                ? "text-slate-300 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>
        )}
        <div className={`flex lg:hidden items-center gap-2 `}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 transition-colors ${
              theme === "dark"
                ? "text-slate-300 hover:text-white hover:bg-slate-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300"
            }`}
          >
            <Menu className="h-4 w-4" />
            {!isMobile && <span className="ml-2 sr-only">Toggle Sidebar</span>}
          </Button>

          <h1
            className={`text-lg font-semibold leading-none gradient-text ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            SkyGuide
          </h1>
        </div>
      </div>
      <div className="hidden items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`mr-4 p-2 rounded ${
            theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-300"
          }`}
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
        <h1
          className={`text-xl font-semibold ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          SkyGuide
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <ChatHeaderButton
          icon={<LayoutDashboard className="h-4 w-4" />}
          to="/dashboard"
          text="Dashboard"
        />
        <ChatHeaderButton
          icon={<UserCircle className="h-4 w-4" />}
          to="/account"
          text="Account"
        />

        <ChatSettings />
        <Button
          variant="secondary"
          size="sm"
          onClick={startNewChat}
          className={`transition-colors ${
            theme === "dark"
              ? "bg-slate-700 hover:bg-slate-600 text-white"
              : "bg-slate-300 hover:bg-slate-400 text-slate-900"
          }`}
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
          className={`transition-colors ${
            theme === "dark"
              ? "text-slate-300 hover:text-red-400 hover:bg-red-900/20"
              : "text-slate-600 hover:text-red-600 hover:bg-red-100"
          }`}
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
