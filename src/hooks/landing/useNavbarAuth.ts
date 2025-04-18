import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNavbarAuth() {
  // Initialize state from localStorage first for instant display
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('auth_status') === 'logged_in';
  });
  const [isLoading, setIsLoading] = useState(!localStorage.getItem('auth_status'));
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('user_is_admin') === 'true';
  });

  useEffect(() => {
    let mounted = true;

    // Initial auth check
    const checkAuth = async () => {
      try {
        console.log('Checking auth state in Navbar');
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.log('No active session found or error:', sessionError);
          if (mounted) {
            // Update state and localStorage to match reality
            setIsLoggedIn(false);
            localStorage.removeItem('auth_status');
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          console.log('User is logged in:', session.user.email);
          
          // Update state and localStorage
          setIsLoggedIn(true);
          localStorage.setItem('auth_status', 'logged_in');
          
          // Check user's profile once
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type, airline, subscription_plan, query_count, is_admin')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }
          
          // Update admin state
          const isUserAdmin = profile?.is_admin || false;
          setIsAdmin(isUserAdmin);
          
          // Store admin status in localStorage
          if (isUserAdmin) {
            localStorage.setItem('user_is_admin', 'true');
          } else {
            localStorage.removeItem('user_is_admin');
          }
          
          // Handle redirects, but only once and with debouncing
          handleRedirect(isUserAdmin, profile);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        if (mounted) {
          setIsLoggedIn(false);
          localStorage.removeItem('auth_status');
          setIsLoading(false);
        }
      }
    };

    // Separate function for redirects to avoid repeated calls
    const handleRedirect = (isUserAdmin, profile) => {
      // Rest of your redirect logic remains the same
      // ...
    };

    // Initial check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in NavbarContainer:', event);
      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in in NavbarContainer:', session.user.email);
        setIsLoggedIn(true);
        localStorage.setItem('auth_status', 'logged_in');
        
        // Check if user is admin
        const checkAdminStatus = async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single();
              
            if (profile?.is_admin) {
              setIsAdmin(true);
              localStorage.setItem('user_is_admin', 'true');
            } else {
              setIsAdmin(false);
              localStorage.removeItem('user_is_admin');
            }
          } catch (err) {
            console.error('Error checking admin status:', err);
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        };
        
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out in NavbarContainer');
        setIsLoggedIn(false);
        setIsAdmin(false);
        localStorage.removeItem('auth_status');
        localStorage.removeItem('user_is_admin');
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoggedIn, isLoading, isAdmin };
}