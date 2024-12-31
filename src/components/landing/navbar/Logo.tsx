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
      aria-label="Return to SkyGuide homepage"
    >
      <img 
        src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
        alt="SkyGuide Logo - Your trusted companion for contract interpretation" 
        className="h-6 w-auto md:h-8"
      />
      <span className="text-foreground text-xl md:text-2xl font-bold">SkyGuide</span>
    </Link>
  );
}