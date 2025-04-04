
import { ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationContext } from "@/hooks/useNavigation";

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigate = useNavigate();
  
  const navigateTo = useCallback((path: string, options?: { replace?: boolean }) => {
    navigate(path, { replace: options?.replace });
  }, [navigate]);
  
  return (
    <NavigationContext.Provider value={{ navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}
