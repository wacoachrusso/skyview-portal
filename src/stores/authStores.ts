import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

// Logger utility for consistent debugging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[AuthStore] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[AuthStore] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[AuthStore] ${message}`, data || '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[AuthStore] ${message}`, data || '');
  }
};

// JWT expiration handler
const handleJWTExpiration = async (error: any, clearAuth: () => void) => {
  if (error?.code === 'PGRST301' && error?.message === 'JWT expired') {
    logger.warn('JWT token expired, logging out automatically');
    
    try {
      // Clear auth state immediately
      clearAuth();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Redirect to sign-in page
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      
      return true; // Indicates JWT expiration was handled
    } catch (logoutError) {
      logger.error('Error during automatic logout after JWT expiration', logoutError);
      // Still redirect even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      return true;
    }
  }
  return false; // JWT expiration was not handled
};

interface AuthState {
  authUser: User | null;
  profile: Profile | null;
  queryCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  profileError: string | null;
  
  // Actions
  setAuthUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setQueryCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setProfileError: (error: string | null) => void;
  fetchSessionAndProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  handleJWTExpiration: (error: any) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  profile: null,
  queryCount: 0,
  isLoading: true,
  isInitialized: false,
  profileError: null,

  setAuthUser: (user) => {
    logger.debug('Setting auth user', { userId: user?.id, email: user?.email });
    set({ authUser: user });
  },

  setProfile: (profile) => {
    logger.debug('Setting profile', { profileId: profile?.id, queryCount: profile?.query_count });
    set({ profile });
    // Auto-update query count when profile changes
    if (profile?.query_count !== undefined) {
      set({ queryCount: profile.query_count });
    }
  },

  setQueryCount: (count) => {
    logger.debug('Setting query count', { count });
    set({ queryCount: count });
  },

  setLoading: (loading) => {
    logger.debug('Setting loading state', { loading });
    set({ isLoading: loading });
  },

  setInitialized: (initialized) => {
    logger.debug('Setting initialized state', { initialized });
    set({ isInitialized: initialized });
  },

  setProfileError: (error) => {
    if (error) {
      logger.error('Setting profile error', error);
    } else {
      logger.debug('Clearing profile error');
    }
    set({ profileError: error });
  },

  fetchSessionAndProfile: async () => {
    try {
      logger.info('Starting session and profile fetch');
      set({ isLoading: true, profileError: null });
      
      // Get current session with refresh
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error('Session error occurred', sessionError);
        
        // Check for JWT expiration
        if (await handleJWTExpiration(sessionError, get().clearAuth)) {
          return;
        }
        
        set({ 
          authUser: null, 
          profile: null, 
          queryCount: 0,
          isLoading: false,
          profileError: `Session error: ${sessionError.message}`
        });
        return;
      }

      if (!session?.user) {
        logger.warn('No authenticated user found in session');
        set({ 
          authUser: null, 
          profile: null, 
          queryCount: 0,
          isLoading: false,
          profileError: "No authenticated user found"
        });
        return;
      }

      logger.info('Session found, setting auth user', { userId: session.user.id });
      set({ authUser: session.user });

      // Fetch profile data
      logger.debug('Fetching profile data by user ID');
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        logger.error('Profile fetch by ID failed, trying email fallback', profileError);
        
        // Check for JWT expiration
        if (await handleJWTExpiration(profileError, get().clearAuth)) {
          return;
        }
        
        // Try by email as fallback
        const { data: emailProfile, error: emailError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", session.user.email)
          .single();
        
        if (emailError) {
          // Check for JWT expiration in email fallback
          if (await handleJWTExpiration(emailError, get().clearAuth)) {
            return;
          }
        }
        
        if (emailProfile) {
          logger.info('Profile found via email lookup', { profileId: emailProfile.id, queryCount: emailProfile.query_count });
          set({ 
            profile: emailProfile, 
            queryCount: emailProfile.query_count || 0,
            profileError: null 
          });
        } else {
          logger.error('Both ID and email profile lookups failed', { profileError, emailError });
          set({ 
            profile: null, 
            queryCount: 0,
            profileError: `Profile not found: ${profileError.message}. Email lookup also failed: ${emailError?.message}` 
          });
        }
      } else {
        logger.info('Profile fetched successfully', { profileId: profileData.id, queryCount: profileData.query_count });
        set({ 
          profile: profileData, 
          queryCount: profileData.query_count || 0,
          profileError: null 
        });
      }
    } catch (error: any) {
      logger.error('Unexpected error during session and profile fetch', error);
      
      // Check for JWT expiration in catch block
      if (await handleJWTExpiration(error, get().clearAuth)) {
        return;
      }
      
      set({ 
        authUser: null, 
        profile: null,
        queryCount: 0,
        profileError: `Failed to fetch session and profile: ${error.message}`
      });
    } finally {
      logger.debug('Session and profile fetch completed');
      set({ isLoading: false, isInitialized: true });
    }
  },

  refreshProfile: async () => {
    const { authUser, isLoading } = get();
    
    // Don't refresh if already loading or no authenticated user
    if (isLoading || !authUser) {
      logger.debug('Skipping profile refresh', { isLoading, hasAuthUser: !!authUser });
      return;
    }

    try {
      logger.info('Starting profile refresh', { userId: authUser.id });
      
      // Clear previous error
      set({ profileError: null });
      
      // Only set loading if we don't have existing profile data
      // This prevents UI flicker when refreshing
      const { profile } = get();
      if (!profile) {
        logger.debug('No existing profile, setting loading state');
        set({ isLoading: true });
      }

      // Fetch fresh profile data
      logger.debug('Fetching fresh profile data');
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        logger.error('Profile refresh by ID failed, trying email fallback', profileError);
        
        // Check for JWT expiration
        if (await handleJWTExpiration(profileError, get().clearAuth)) {
          return;
        }
        
        // Try by email as fallback
        const { data: emailProfile, error: emailError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", authUser.email)
          .single();
        
        if (emailError) {
          // Check for JWT expiration in email fallback
          if (await handleJWTExpiration(emailError, get().clearAuth)) {
            return;
          }
        }
        
        if (emailProfile) {
          logger.info('Profile refreshed via email lookup', { profileId: emailProfile.id, queryCount: emailProfile.query_count });
          set({ 
            profile: emailProfile, 
            queryCount: emailProfile.query_count || 0,
            profileError: null 
          });
        } else {
          logger.error('Both ID and email profile refresh failed', { profileError, emailError });
          set({ 
            profileError: `Profile refresh failed: ${profileError.message}. Email lookup also failed: ${emailError?.message}` 
          });
        }
      } else {
        logger.info('Profile refreshed successfully', { profileId: profileData.id, queryCount: profileData.query_count });
        set({ 
          profile: profileData, 
          queryCount: profileData.query_count || 0,
          profileError: null 
        });
      }
    } catch (error: any) {
      logger.error('Unexpected error during profile refresh', error);
      
      // Check for JWT expiration in catch block
      if (await handleJWTExpiration(error, get().clearAuth)) {
        return;
      }
      
      set({ 
        profileError: `Failed to refresh profile: ${error.message}` 
      });
    } finally {
      logger.debug('Profile refresh completed');
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      logger.info('Starting logout process');
      await supabase.auth.signOut();
      get().clearAuth();
      logger.info('Logout completed successfully');
    } catch (error) {
      logger.error('Error during logout', error);
      throw error;
    }
  },

  clearAuth: () => {
    logger.info('Clearing auth state');
    set({ 
      authUser: null, 
      profile: null, 
      queryCount: 0,
      isLoading: false, 
      isInitialized: true,
      profileError: null
    });
  },

  handleJWTExpiration: async (error: any) => {
    return await handleJWTExpiration(error, get().clearAuth);
  }
}));