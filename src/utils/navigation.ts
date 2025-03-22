
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
  
  // Normalize path for comparison (removing any query parameters)
  const normalizedPath = path.split('?')[0];
  
  return publicRoutes.some(route => 
    normalizedPath === route || 
    (route !== '/' && normalizedPath.startsWith(route))
  );
};

/**
 * Set a temporary flag to indicate a new chat is being created
 * This prevents flickering during the new chat creation process
 */
export const setNewChatFlag = () => {
  sessionStorage.setItem('creating_new_chat', 'true');
  setTimeout(() => {
    sessionStorage.removeItem('creating_new_chat');
  }, 2000); // Clear after 2 seconds
};

/**
 * Check if a new chat is currently being created
 */
export const isCreatingNewChat = () => {
  return sessionStorage.getItem('creating_new_chat') === 'true';
};

/**
 * Temporarily disable all redirects
 * Use this when you want to navigate to a specific page without being redirected
 */
export const disableRedirects = (durationMs = 5000) => {
  localStorage.setItem('disable_redirects', 'true');
  setTimeout(() => {
    localStorage.removeItem('disable_redirects');
  }, durationMs);
};

/**
 * Check if redirects are currently disabled
 */
export const areRedirectsDisabled = () => {
  return localStorage.getItem('disable_redirects') === 'true';
};
