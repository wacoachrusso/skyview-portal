// 1. First, let's improve the AuthButtons.tsx component to immediately render using localStorage

import { useLogout } from "@/hooks/useLogout";
import { LoggedInButtons } from "./buttons/LoggedInButtons";
import { LoggedOutButtons } from "./buttons/LoggedOutButtons";
import { LoadingButtons } from "./buttons/LoadingButtons";
import { useEffect, useState } from "react";

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
  
  // IMPORTANT: Use localStorage for immediate state
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(() => {
    return localStorage.getItem('auth_status') === 'logged_in';
  });
  
  // Update from API response later
  useEffect(() => {
    if (!isLoading) {
      setLocalIsLoggedIn(isLoggedIn);
    }
  }, [isLoggedIn, isLoading]);

  // Show loading only if we're loading AND we don't have a cached state
  if (isLoading && localStorage.getItem('auth_status') === null) {
    return <LoadingButtons isMobile={isMobile} />;
  }

  // Use localIsLoggedIn instead of isLoggedIn for immediate rendering
  if (localIsLoggedIn) {
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