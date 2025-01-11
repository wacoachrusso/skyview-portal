import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Settings,
  MessageSquare,
  FileText,
  Bell,
  User,
  ShieldCheck,
} from "lucide-react";

export const DesktopNav = () => {
  const { profile } = useUserProfile();

  return (
    <nav className="hidden md:flex flex-col gap-2">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg"
      >
        <FileText className="h-5 w-5" />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/chat"
        className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg"
      >
        <MessageSquare className="h-5 w-5" />
        <span>Chat</span>
      </Link>
      <Link
        to="/account"
        className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg"
      >
        <User className="h-5 w-5" />
        <span>Account</span>
      </Link>
      <Link
        to="/settings"
        className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg"
      >
        <Settings className="h-5 w-5" />
        <span>Settings</span>
      </Link>
      <Link
        to="/release-notes"
        className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg"
      >
        <Bell className="h-5 w-5" />
        <span>Release Notes</span>
      </Link>
      {profile?.is_admin && (
        <Link
          to="/admin"
          className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg text-blue-600 dark:text-blue-400"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Admin Panel</span>
        </Link>
      )}
    </nav>
  );
};