// components/shared/NavButton.tsx
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { ReactNode } from "react";

interface NavButtonProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  hideOnPath?: boolean;
}

export const NavButton = ({ to, children, icon, hideOnPath = false }: NavButtonProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (hideOnPath && isActive) return null;

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={`transition-all duration-300 text-white hover:bg-secondary hover:text-white ${
        isActive ? "bg-white/20" : ""
      }`}
    >
      <Link to={to} className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Link>
    </Button>
  );
};
