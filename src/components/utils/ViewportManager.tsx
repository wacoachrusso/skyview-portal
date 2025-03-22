
import { useEffect } from "react";

export function ViewportManager() {
  // Add viewport meta tag for proper mobile display
  useEffect(() => {
    // Check if viewport meta tag exists
    const existingViewport = document.querySelector('meta[name="viewport"]');
    
    if (!existingViewport) {
      // Create and add viewport meta tag if it doesn't exist
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(viewportMeta);
    } else {
      // Update existing viewport meta to ensure it has the right settings
      existingViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  return null;
}
