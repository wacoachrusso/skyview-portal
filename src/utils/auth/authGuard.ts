// src/utils/authGuard.ts

/**
 * Checks if the user is authenticated based on local storage
 * Returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
    return localStorage.getItem("auth_status") === "authenticated";
  }
  
  /**
   * Redirects authenticated users away from public pages
   * @param navigate - React Router's navigate function
   * @returns true if redirection happened, false otherwise
   */
  export function redirectIfAuthenticated(navigate: (path: string, options?: {replace?: boolean}) => void): boolean {
    if (isAuthenticated()) {
      navigate("/chat", { replace: true });
      return true;
    }
    return false;
  }
  
  /**
   * Redirects unauthenticated users away from protected pages
   * @param navigate - React Router's navigate function
   * @returns true if redirection happened, false otherwise
   */
  export function redirectIfUnauthenticated(navigate: (path: string, options?: {replace?: boolean}) => void): boolean {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  }