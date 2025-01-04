import { useNavigate } from "react-router-dom";

export const DashboardLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { fromDashboard: true } });
  };

  return (
    <div className="flex items-center space-x-3">
      <a 
        href="/"
        onClick={handleLogoClick}
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <img 
          src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
          alt="SkyGuide Logo" 
          className="h-8 w-auto"
        />
        <span className="text-xl font-semibold text-foreground/90">
          SkyGuide
        </span>
      </a>
    </div>
  );
};