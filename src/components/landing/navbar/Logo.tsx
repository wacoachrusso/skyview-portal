import { Link } from "react-router-dom";

interface LogoProps {
  handleLogoClick: (e: React.MouseEvent) => void;
}

export function Logo({ handleLogoClick }: LogoProps) {
  return (
    <Link 
      to="/"
      onClick={handleLogoClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <img 
        src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
        alt="SkyGuide Logo" 
        className="h-6 w-auto md:h-8"
      />
      <span className="text-foreground text-base md:text-lg font-bold">SkyGuide</span>
    </Link>
  );
}