import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
interface UserProfile {
  id: string;
  full_name?: string;
  subscription_plan?: string;
  subscription_status?: string;
  query_count?: number;
  is_admin?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any; // Supabase user
  profile: UserProfile | null;
  isAdmin: boolean;
  queryCount: number;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login', 
  '/signup', 
  '/', 
  '/auth/callback', 
  '/privacy-policy', 
  '/about',
  '/help-center',
  '/WebViewDemo'
];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [refreshTimeout, setRefreshTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  
  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }
      
      return profileData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };
  
  // Refresh session
  const refreshSession = async (): Promise<boolean> => {
    // Prevent multiple refreshes simultaneously
    if (isRefreshing) return false;
    setIsRefreshing(true);
    
    try {
      console.log('Refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
        setIsRefreshing(false);
        return false;
      }
      
      if (data && data.session) {
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        // Save tokens
        localStorage.setItem('auth_access_token', data.session.access_token);
        localStorage.setItem('auth_refresh_token', data.session.refresh_token);
        
        // Schedule next refresh for 5 minutes before token expiry
        const expiresIn = data.session.expires_in; // in seconds
        if (refreshTimeout) clearTimeout(refreshTimeout);
        const newTimeout = setTimeout(() => {
          refreshSession();
        }, (expiresIn - 300) * 1000); // 5 minutes before expiry
        setRefreshTimeout(newTimeout);
        
        // Fetch profile after session refresh
        const profileData = await fetchUserProfile(data.session.user.id);
        if (profileData) {
          setProfile(profileData);
          setIsAdmin(profileData?.is_admin || false);
          setQueryCount(profileData?.query_count || 0);
          setSubscriptionPlan(profileData?.subscription_plan || null);
          setSubscriptionStatus(profileData?.subscription_status || null);
        }
        
        setIsRefreshing(false);
        return true;
      }
      setIsRefreshing(false);
      return false;
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      setIsRefreshing(false);
      return false;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      
      // Clear local storage items
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('user_is_admin');
      localStorage.removeItem('payment_in_progress');
      localStorage.removeItem('postPaymentConfirmation');
      localStorage.removeItem('subscription_activated');
      localStorage.removeItem('new_user_signup');
      
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle new user signup redirect
  const handleNewUserSignup = () => {
    const isNewUserSignup = localStorage.getItem('new_user_signup') === 'true';
    
    if (isNewUserSignup && location.pathname !== '/chat') {
      console.log('New user signup detected, redirecting to chat');
      localStorage.removeItem('new_user_signup');
      navigate('/chat', { replace: true });
      return true;
    }
    
    if (isNewUserSignup && location.pathname === '/chat') {
      localStorage.removeItem('new_user_signup');
    }
    
    return false;
  };
  
  // Handle payment recovery
  const handlePaymentRecovery = async (): Promise<boolean> => {
    try {
      const paymentInProgress = localStorage.getItem('payment_in_progress') === 'true';
      const postPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
      const subscriptionActivated = localStorage.getItem('subscription_activated') === 'true';
  
      const isAtLoginOrRoot = location.pathname === '/login' || location.pathname === '/';
  
      if ((paymentInProgress || postPayment || subscriptionActivated) && isAtLoginOrRoot) {
        console.log('Payment flow interrupted, attempting to recover session');
  
        const restored = await refreshSession();
  
        if (!restored) {
          console.warn('All session restoration attempts failed, clearing localStorage flags');
          [
            'payment_in_progress',
            'postPaymentConfirmation',
            'subscription_activated',
            'auth_access_token',
            'auth_refresh_token',
            'auth_user_id',
            'auth_user_email',
          ].forEach(key => localStorage.removeItem(key));
        } else if (location.pathname !== '/chat') {
          navigate('/chat', { replace: true });
        }
  
        return restored;
      }
  
      return false;
    } catch (error) {
      console.error('Error during payment recovery:', error);
      return false;
    }
  };
  
  
  // Check subscription status and handle redirects
  const checkSubscriptionStatus = async (userId: string) => {
    const profileData = await fetchUserProfile(userId);
    
    if (!profileData) return;
    
    setProfile(profileData);
    setIsAdmin(profileData?.is_admin || false);
    setQueryCount(profileData?.query_count || 0);
    setSubscriptionPlan(profileData?.subscription_plan || null);
    setSubscriptionStatus(profileData?.subscription_status || null);
    
    // Store admin status
    if (profileData?.is_admin) {
      localStorage.setItem('user_is_admin', 'true');
      
      // Only redirect admin if they're on login/signup pages
      if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/chat', { replace: true });
      }
      return;
    } else {
      localStorage.removeItem('user_is_admin');
    }
    
    // Check for active paid subscription
    if (profileData?.subscription_status === 'active' && 
        profileData?.subscription_plan !== 'free' && 
        profileData?.subscription_plan !== 'trial_ended') {
          
      // Only redirect if on public pages
      if (isPublicRoute) {
        navigate('/chat', { replace: true });
      }
      return;
    }
    
    // Free trial ended or inactive subscription - go to pricing
    if ((profileData?.subscription_plan === 'free' && profileData?.query_count >= 2) ||
        (profileData?.subscription_status === 'inactive' && profileData?.subscription_plan !== 'free')) {
      console.log('Free trial ended/inactive subscription, going to pricing');
      navigate('/?scrollTo=pricing-section', { replace: true });
    }
  };
  
  // Initialize auth state
  useEffect(() => {
    // Skip checking if we're in these special routes
    if (location.pathname === '/auth/callback' || 
        location.pathname.includes('/stripe-callback')) {
      setIsLoading(false);
      return;
    }
    
    // Handle new user signup first
    if (handleNewUserSignup()) {
      setIsLoading(false);
      return;
    }
    
    const initAuth = async () => {
      try {
        // Handle payment recovery first
        const recovered = await handlePaymentRecovery();
        if (recovered) {
          setIsLoading(false);
          return;
        }
        
        // Get session from Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // Set authentication state
          setIsAuthenticated(true);
          setUser(sessionData.session.user);
          
          // Schedule next refresh 5 minutes before token expiry
          const expiresIn = sessionData.session.expires_in; // in seconds
          if (refreshTimeout) clearTimeout(refreshTimeout);
          const newTimeout = setTimeout(() => {
            refreshSession();
          }, (expiresIn - 300) * 1000); // 5 minutes before expiry
          setRefreshTimeout(newTimeout);
          
          // Save tokens
          localStorage.setItem('auth_access_token', sessionData.session.access_token);
          localStorage.setItem('auth_refresh_token', sessionData.session.refresh_token);
          
          // Check user subscription status
          await checkSubscriptionStatus(sessionData.session.user.id);
          
          // Handle post-payment redirect
          const postPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
          if (postPayment && location.pathname !== '/chat') {
            navigate('/chat', { replace: true });
            return;
          } else if (postPayment && location.pathname === '/chat') {
            localStorage.removeItem('postPaymentConfirmation');
            localStorage.removeItem('payment_in_progress');
            localStorage.removeItem('subscription_activated');
          }
          
          // Redirect authenticated users from login/signup
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/chat', { replace: true });
          }
        } else if (!isPublicRoute) {
          // No session and trying to access protected route
          console.log('No active session found, redirecting to login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Clean up on unmount
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [location.pathname]);
  
  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          await checkSubscriptionStatus(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setProfile(null);
          
          if (!isPublicRoute) {
            navigate('/login', { replace: true });
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed automatically');
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Save new tokens
          localStorage.setItem('auth_access_token', session.access_token);
          localStorage.setItem('auth_refresh_token', session.refresh_token);
          
          // Schedule next refresh
          const expiresIn = session.expires_in; // in seconds
          if (refreshTimeout) clearTimeout(refreshTimeout);
          const newTimeout = setTimeout(() => {
            refreshSession();
          }, (expiresIn - 300) * 1000); // 5 minutes before expiry
          setRefreshTimeout(newTimeout);
        }
      }
    );
    
    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const value = {
    isAuthenticated,
    isLoading,
    user,
    profile,
    isAdmin,
    queryCount,
    subscriptionPlan,
    subscriptionStatus,
    logout,
    refreshSession,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Route guard HOC
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, isPublicRoute, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }
  
  return <>{children}</>;
};

// Create withAuth HOC for component-level protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithAuth: React.FC<P> = (props) => {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
  
  return WithAuth;
};