
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
    navigate('/', { replace: true });
  };

  return (
    <div className="p-3 sm:p-3 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#1A1F2C] to-[#2A2F3C]">
      <a 
        href="/"
        onClick={handleLogoClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
            alt="SkyGuide Logo" 
            className="h-7 w-auto sm:h-8 premium-logo-glow"
          />
        </div>
        <span className="text-white font-semibold text-sm sm:text-base gradient-text">SkyGuide</span>
      </a>
      <div className="flex items-center gap-2 mr-5 sm:mr-0">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1E1E2E] border border-white/10 rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Clear All Conversations</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete all your conversations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600 transition-colors">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 transition-colors"
                onClick={onDeleteAll}
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
