// --- src/stores/useAuthStore.ts ---

import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";

// JWT expiration handler
const handleJWTExpiration = async (error: any, clearAuth: () => void) => {
  if (error?.code === "PGRST301" && error?.message === "JWT expired") {
    console.log("JWT token expired, logging out automatically");

    try {
      // Clear auth state immediately
      clearAuth();

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Redirect to sign-in page
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }

      return true; // Indicates JWT expiration was handled
    } catch (logoutError) {
      console.error(
        "Error during automatic logout after JWT expiration",
        logoutError
      );
      // Still redirect even if logout fails
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return true;
    }
  }
  return false; // JWT expiration was not handled
};

export interface AuthState {
  authUser: User | null;
  profile: Profile | null;
  queryCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  profileError: string | null;
  // New authentication status flags
  isAuthenticated: boolean;
  rememberMe: boolean;
  extendedSession: boolean;
  loginInProgress: boolean;
  skipInitialRedirect: boolean;
  
  // Actions
  setAuthUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setQueryCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setProfileError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  setExtendedSession: (extended: boolean) => void;
  setLoginInProgress: (inProgress: boolean) => void;
  setSkipInitialRedirect: (skip: boolean) => void;
  
  // Main methods
  fetchSessionAndProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  handleJWTExpiration: (error: any) => Promise<boolean>;
  
  // Authentication flow methods
  handleSuccessfulLogin: (user: User, rememberMe?: boolean) => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  profile: null,
  queryCount: 0,
  isLoading: true,
  isInitialized: false,
  profileError: null,
  isAuthenticated: false,
  rememberMe: false,
  extendedSession: false,
  loginInProgress: false,
  skipInitialRedirect: false,

  setAuthUser: (user) => {
    console.log("Setting auth user", { userId: user?.id });
    set({ authUser: user });
  },

  setProfile: (profile) => {
    console.log("Setting profile", { profileId: profile?.id });
    set({ profile });
    if (profile?.query_count !== undefined)
      set({ queryCount: profile.query_count });
  },

  setQueryCount: (count) => set({ queryCount: count }),
  setLoading: (loading) => set({ isLoading: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setProfileError: (error) => set({ profileError: error }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setRememberMe: (remember) => set({ rememberMe: remember }),
  setExtendedSession: (extended) => set({ extendedSession: extended }),
  setLoginInProgress: (inProgress) => set({ loginInProgress: inProgress }),
  setSkipInitialRedirect: (skip) => set({ skipInitialRedirect: skip }),

  handleSuccessfulLogin: async (user: User, rememberMe = false) => {
    const { setAuthUser, setAuthenticated, setRememberMe, setExtendedSession, refreshProfile } = get();
    
    // Set authentication state
    setAuthUser(user);
    setAuthenticated(true);
    setRememberMe(rememberMe);
    
    if (rememberMe) {
      setExtendedSession(true);
    }
    
    // Fetch user profile
    await refreshProfile();
    
    console.log("Successful login handled in Zustand store");
  },

  checkAuthStatus: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session;
      
      set({ isAuthenticated: isAuth });
      
      if (isAuth && session.user) {
        set({ authUser: session.user });
      }
      
      return isAuth;
    } catch (error) {
      console.error("Error checking auth status:", error);
      set({ isAuthenticated: false });
      return false;
    }
  },

  initializeAuth: async () => {
    const { setLoading, setInitialized, fetchSessionAndProfile } = get();
    
    setLoading(true);
    
    try {
      await fetchSessionAndProfile();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  },

  fetchSessionAndProfile: async () => {
    const clear = get().clearAuth;
    try {
      set({ isLoading: true, profileError: null });
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        if (await handleJWTExpiration(error, clear)) return;
        return set({
          authUser: null,
          profile: null,
          queryCount: 0,
          isLoading: false,
          isAuthenticated: false,
          profileError: error.message,
        });
      }

      const user = session?.user;
      if (!user) {
        return set({
          authUser: null,
          profile: null,
          queryCount: 0,
          isLoading: false,
          isAuthenticated: false,
          profileError: "No user found",
        });
      }

      set({ authUser: user, isAuthenticated: true });
      await get().refreshProfile();
    } catch (err: any) {
      if (await handleJWTExpiration(err, clear)) return;
      set({
        authUser: null,
        profile: null,
        queryCount: 0,
        isAuthenticated: false,
        profileError: err.message,
      });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  refreshProfile: async () => {
    const { authUser, clearAuth } = get();
    if (!authUser) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `*, subscription_id(stripe_subscription_id, start_at, end_at, plan,old_plan,payment_status,price)`
        )
        .eq("id", authUser.id)
        .single();

      if (error) {
        if (await handleJWTExpiration(error, clearAuth)) return;
        set({ profile: null, queryCount: 0, profileError: error.message });
        return;
      }
      console.log("[authStore]------Profile Data--------:", data);
      set({ profile: data, queryCount: data.query_count || 0 });
    } catch (err: any) {
      if (await handleJWTExpiration(err, clearAuth)) return;
      set({ profile: null, profileError: err.message });
    }
  },

  logout: async () => {
    try {
      console.log('Starting logout process');
      await supabase.auth.signOut();
      get().clearAuth();
      console.log('Logout completed successfully');
      window.location.href = '/login'
    } catch (error) {
      console.log('Error during logout', error);
      throw error;
    }
  },

  clearAuth: () => {
    console.log('Clearing auth state');
    set({ 
      authUser: null, 
      profile: null, 
      queryCount: 0,
      isLoading: false, 
      isInitialized: true,
      profileError: null,
      isAuthenticated: false,
      rememberMe: false,
      extendedSession: false,
      loginInProgress: false,
      skipInitialRedirect: false
    });
  },

  handleJWTExpiration: async (error: any) =>
    await handleJWTExpiration(error, get().clearAuth),
}));