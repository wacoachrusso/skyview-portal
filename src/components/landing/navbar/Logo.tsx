
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LogoProps {
  handleLogoClick?: (e: React.MouseEvent) => void;
}

export function Logo({ handleLogoClick }: LogoProps) {
  const defaultLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      // If logged in, navigate to chat, otherwise to home
      const targetPath = session ? '/chat' : '/';
      window.location.href = targetPath; // Using direct location change to avoid React Router issues
    } catch (error) {
      console.error("Error in logo click:", error);
      window.location.href = '/'; // Fallback to home
    }
  };
  
  const logoClickHandler = handleLogoClick || defaultLogoClick;

  return (
    <Link 
      to="#"
      onClick={logoClickHandler}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      aria-label="SkyGuide"
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
