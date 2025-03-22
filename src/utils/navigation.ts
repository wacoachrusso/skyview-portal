
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
  // Define public routes with canonical paths to prevent duplicates
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
  
  // Normalize path for comparison (removing any query parameters and trailing slashes)
  let normalizedPath = path.split('?')[0];
  normalizedPath = normalizedPath.endsWith('/') && normalizedPath !== '/' 
    ? normalizedPath.slice(0, -1) 
    : normalizedPath;
  
  return publicRoutes.some(route => 
    normalizedPath === route || 
    (route !== '/' && normalizedPath.startsWith(route))
  );
};

/**
 * Get a list of unique application routes for navigation
 * This helps prevent duplicate routes in navigation menus
 */
export const getUniqueAppRoutes = (): string[] => {
  return [
    '/chat',
    '/account',
    '/settings',
    '/dashboard',
    '/admin',
    '/privacy-policy',
    '/about',
    '/help-center',
    '/release-notes',
    '/refunds'
  ];
};

/**
 * Get a human-readable name for a route
 */
export const getRouteDisplayName = (route: string): string => {
  const routeMap: Record<string, string> = {
    '/': 'Home',
    '/login': 'Login',
    '/signup': 'Sign Up',
    '/chat': 'Chat',
    '/account': 'Account',
    '/settings': 'Settings',
    '/dashboard': 'Dashboard',
    '/admin': 'Admin',
    '/privacy-policy': 'Privacy Policy',
    '/about': 'About',
    '/help-center': 'Help Center',
    '/release-notes': 'Release Notes',
    '/refunds': 'Refunds',
    '/WebViewDemo': 'Web View Demo'
  };
  
  return routeMap[route] || route.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

/**
 * Helper function to force navigation to another page
 * This bypasses all session and redirect checks
 */
export const forceNavigate = (path: string) => {
  // Set flags to bypass all checks
  localStorage.setItem('skip_initial_redirect', 'true');
  localStorage.setItem('disable_redirects', 'true');
  
  // Use direct window location change for maximum reliability
  window.location.href = `${window.location.origin}${path}`;
  
  // Reset the disable_redirects flag after navigation completes
  setTimeout(() => {
    localStorage.removeItem('disable_redirects');
  }, 2000);
};
