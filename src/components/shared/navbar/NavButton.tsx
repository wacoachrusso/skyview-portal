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
}

export const NavButton = ({ to, children, icon, hideOnPath = false }: NavButtonProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isActive = location.pathname === to;

  if (hideOnPath && isActive) return null;

  // Theme-aware styling
  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const activeBgClass = theme === "dark" ? "bg-white/20" : "bg-black/10";
  const hoverClass = theme === "dark" 
    ? "hover:bg-secondary hover:text-white" 
    : "hover:bg-gray-200 hover:text-gray-900";
  
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