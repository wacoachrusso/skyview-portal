import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ChatSettings } from "../ChatSettings";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SidebarHeaderProps {
  onDeleteAll: () => void;
}

export function SidebarHeader({ onDeleteAll }: SidebarHeaderProps) {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { fromChat: true } });
  };

  return (
    <div className="p-3 sm:p-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#1E1E2E] to-[#2A2F3C]">
      <a 
        href="/"
        onClick={handleLogoClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white font-semibold text-sm sm:text-base">S</span>
        </div>
        <span className="text-white font-semibold text-sm sm:text-base">Ask SkyGuide</span>
      </a>
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1E1E2E] border border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Clear All Conversations</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete all your conversations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={onDeleteAll}
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ChatSettings />
      </div>
    </div>
  );
}