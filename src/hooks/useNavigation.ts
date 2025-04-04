
import { createContext, useContext, useCallback } from "react";

// Create a context for navigation functions
export interface NavigationContextType {
  navigateTo: (path: string, options?: { replace?: boolean }) => void;
}

export const NavigationContext = createContext<NavigationContextType | null>(null);

// Hook to use the navigation context
export function useNavigation() {
  const context = useContext(NavigationContext);
  
  if (!context) {
    // Return a safe fallback that uses window.location if context is not available
    return {
      navigateTo: (path: string, options?: { replace?: boolean }) => {
        if (options?.replace) {
          window.location.replace(path);
        } else {
          window.location.href = path;
        }
      }
    };
  }
  
  return context;
}
