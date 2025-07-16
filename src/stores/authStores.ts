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
          profileError: "No user found",
        });
      }

      set({ authUser: user });
      await get().refreshProfile();
    } catch (err: any) {
      if (await handleJWTExpiration(err, clear)) return;
      set({
        authUser: null,
        profile: null,
        queryCount: 0,
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
    setTimeout(() => {
      
    })
    // set({ 
    //   authUser: null, 
    //   profile: null, 
    //   queryCount: 0,
    //   isLoading: false, 
    //   isInitialized: true,
    //   profileError: null
    // });
  },

  handleJWTExpiration: async (error: any) =>
    await handleJWTExpiration(error, get().clearAuth),
}));
