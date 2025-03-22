
import { useLogout } from "@/hooks/useLogout";
import { LoggedInButtons } from "./buttons/LoggedInButtons";
import { LoggedOutButtons } from "./buttons/LoggedOutButtons";
import { LoadingButtons } from "./buttons/LoadingButtons";

interface AuthButtonsProps {
  isLoading: boolean;
  isLoggedIn: boolean;
  scrollToPricing: () => void;
  isMobile?: boolean;
  showChatOnly?: boolean;
}

export function AuthButtons({ 
  isLoading, 
  isLoggedIn, 
  scrollToPricing, 
  isMobile = false, 
  showChatOnly = false 
}: AuthButtonsProps) {
  const { handleLogout } = useLogout();

  if (isLoading) {
    return <LoadingButtons isMobile={isMobile} />;
  }

  if (isLoggedIn) {
    return (
      <LoggedInButtons 
        isMobile={isMobile} 
        showChatOnly={showChatOnly} 
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <LoggedOutButtons 
      isMobile={isMobile} 
      scrollToPricing={scrollToPricing} 
    />
  );
}
