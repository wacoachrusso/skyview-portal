
import { Link } from "react-router-dom";
import { useDefaultLogoClickHandler } from "@/hooks/landing/useDefaultLogoClickHandler";
import { motion } from "framer-motion";

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
      className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
      aria-label="SkyGuide"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center"
      >
        <img 
          src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
          alt="SkyGuide Logo - Your trusted companion for contract interpretation" 
          className="h-6 w-auto md:h-8"
          style={{ 
            filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.3))',
            transition: 'filter 0.3s ease'
          }}
        />
      </motion.div>
      <motion.span 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-foreground text-xl md:text-2xl font-bold rich-text"
      >
        SkyGuide
      </motion.span>
    </Link>
  );
}
