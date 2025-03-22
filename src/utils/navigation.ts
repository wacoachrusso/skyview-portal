
/**
 * Navigation utility functions to prevent redirect loops
 */

/**
 * Navigate to a route without triggering the redirect checks
 * This can be used to break redirect loops
 */
export const navigateWithoutRedirectCheck = (path: string) => {
  // Set a flag to skip the initial redirect check
  localStorage.setItem('skip_initial_redirect', 'true');
  
  // Use window.location for a full page reload to clear any stale state
  window.location.href = `${window.location.origin}${path}`;
};

/**
 * Check if a path is a public route that doesn't require authentication
 */
export const isPublicRoute = (path: string): boolean => {
  const publicRoutes = [
    '/login', 
    '/signup', 
    '/', 
    '/auth/callback', 
    '/privacy-policy', 
    '/about',
    '/help-center',
    '/WebViewDemo'
  ];
  
  return publicRoutes.includes(path);
};
