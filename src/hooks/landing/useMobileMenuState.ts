
import { useState } from "react";

export function useMobileMenuState() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return { isMobileMenuOpen, setIsMobileMenuOpen };
}
