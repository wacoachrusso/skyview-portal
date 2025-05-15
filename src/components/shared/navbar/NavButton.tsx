// components/shared/NavButton.tsx
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../ui/button";
import { ReactNode } from "react";
import { useTheme } from "@/components/theme-provider";

interface NavButtonProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  hideOnPath?: boolean;
  isPublicRoute?: boolean;
}

export const NavButton = ({
  to,
  children,
  icon,
  hideOnPath = false,
  isPublicRoute = false,
}: NavButtonProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isActive = location.pathname === to;

  if (hideOnPath && isActive) return null;

  // Public route styling (consistent regardless of theme)
  if (isPublicRoute) {
    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="transition-all duration-300 text-white hover:bg-secondary hover:text-white"
      >
        <Link to={to} className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </Link>
      </Button>
    );
  }

  // Private route styling (theme-aware)
  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const activeBgClass = theme === "dark" ? "bg-white/20" : "bg-black/10";
  const hoverClass = "hover:bg-secondary hover:text-white";

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={`transition-all duration-300 ${textColor} ${hoverClass} ${
        isActive ? activeBgClass : ""
      }`}
    >
      <Link to={to} className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Link>
    </Button>
  );
};
