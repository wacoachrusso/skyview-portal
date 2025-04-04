
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const DashboardLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { replace: true });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center space-x-3"
    >
      <a 
        href="/"
        onClick={handleLogoClick}
        className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200"
      >
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
            alt="SkyGuide Logo" 
            className="h-8 w-auto"
            style={{ 
              filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.3))',
              transition: 'filter 0.3s ease'
            }}
          />
        </div>
        <span className="text-xl font-semibold text-foreground/90 rich-text">
          SkyGuide
        </span>
      </a>
    </motion.div>
  );
};
