
import { useNavigate } from "react-router-dom";

export const DashboardLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex items-center space-x-3">
      <a 
        href="/"
        onClick={handleLogoClick}
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
            alt="SkyGuide Logo" 
            className="h-8 w-auto"
            style={{ 
              mixBlendMode: 'lighten', 
              filter: 'drop-shadow(0 0 0 transparent)'
            }}
          />
        </div>
        <span className="text-xl font-semibold text-foreground/90">
          SkyGuide
        </span>
      </a>
    </div>
  );
};
