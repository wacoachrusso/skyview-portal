
import { Link } from "react-router-dom";
import { useDefaultLogoClickHandler } from "@/hooks/landing/useDefaultLogoClickHandler";

interface LogoProps {
  handleLogoClick?: (e: React.MouseEvent) => void;
}

export function Logo({ handleLogoClick }: LogoProps) {
  const { defaultLogoClick } = useDefaultLogoClickHandler();
  
  const logoClickHandler = handleLogoClick || defaultLogoClick;

  return (
    <Link 
      to="#"
      onClick={logoClickHandler}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      aria-label="SkyGuide"
    >
      <div className="flex items-center justify-center">
        <img 
          src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
          alt="SkyGuide Logo - Your trusted companion for contract interpretation" 
          className="h-6 w-auto md:h-8"
          style={{ 
            mixBlendMode: 'lighten', 
            filter: 'drop-shadow(0 0 0 transparent)'
          }}
        />
      </div>
      <span className="text-foreground text-xl md:text-2xl font-bold">SkyGuide</span>
    </Link>
  );
}
