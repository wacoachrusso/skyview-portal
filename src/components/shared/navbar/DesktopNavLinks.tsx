import { NavButton } from "./NavButton";
import { MessageSquare, LayoutDashboard, User, Shield } from "lucide-react";
import { NotificationBell } from "../NotificationBell";
import { ChatSettings } from "../../chat/ChatSettings";
import UserDropdown from "./UserDropdown";

interface Props {
  isPrivate: boolean;
  isAdmin: boolean;
  isDashboardPage: boolean;
  isAccountPage: boolean;
}

export const DesktopNavLinks = ({
  isPrivate,
  isAdmin,
  isDashboardPage,
  isAccountPage
}: Props) => (
  <>
    <NotificationBell />
    <NavButton to="/chat" icon={<MessageSquare className="h-4 w-4" />} isPublicRoute={!isPrivate}>
      Ask SkyGuide
    </NavButton>
    {!isDashboardPage && (
      <NavButton to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} isPublicRoute={!isPrivate}>
        Dashboard
      </NavButton>
    )}
    {!isAccountPage && (
      <NavButton to="/account" icon={<User className="h-4 w-4" />} isPublicRoute={!isPrivate}>
        Account
      </NavButton>
    )}
    {isAdmin && isDashboardPage && (
      <NavButton to="/admin" icon={<Shield className="h-4 w-4" />} isPublicRoute={!isPrivate}>
        Admin Dashboard
      </NavButton>
    )}
    {isPrivate && <ChatSettings />}
    <UserDropdown isPublicRoute={!isPrivate} />
  </>
);
