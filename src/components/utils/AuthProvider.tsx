/**
 * AuthProvider.tsx
 * 
 * 📄 Description:
 * This component is a global provider that handles Supabase auth state.
 * It ensures the user session is restored on load, listens for auth state changes,
 * and refreshes the session when the app regains visibility or focus.
 *
 * ✅ Responsibilities:
 * - On initial mount, load the session and user profile.
 * - Listen for Supabase auth state changes (SIGN_IN, SIGN_OUT, etc.)
 * - Refresh session when app becomes visible or focused.
 * - Unsubscribe from listeners on cleanup.
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStores';
import chalk from 'chalk';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { fetchSessionAndProfile, clearAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    // Step 1: Initial fetch
    console.log(chalk.bgBlue.black.bold('[AuthProvider] Step 1: Fetching session and profile...'));
    fetchSessionAndProfile();

    // Step 2: Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(chalk.bgBlue.black.bold(`[AuthProvider] Step 2: Auth state changed → ${event}`));

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log(chalk.bgGreen.black.bold('[AuthProvider] Step 2.1: User signed in or token refreshed → Fetching profile'));
        fetchSessionAndProfile();
      } else if (event === 'SIGNED_OUT') {
        console.log(chalk.bgRed.white.bold('[AuthProvider] Step 2.2: User signed out → Clearing auth'));
        clearAuth();
      }
    });


    // Cleanup
    return () => {
      console.log(chalk.bgGray.black.bold('[AuthProvider] Cleaning up listeners...'));
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  return <>{children}</>;
};
