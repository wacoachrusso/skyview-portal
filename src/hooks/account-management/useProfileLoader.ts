import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile, UseProfileLoaderReturn } from "./types";
import { User } from "@supabase/supabase-js";
import { useAccountReactivation } from "./useAccountReactivation";

// Session storage key
const PROFILE_STORAGE_KEY = "cached_user_profile";
const AUTH_USER_STORAGE_KEY = "cached_auth_user";

export const useProfileLoader = (): UseProfileLoaderReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reactivateAccount } = useAccountReactivation();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  
  // Use refs to prevent race conditions and control loading flow
  const isMounted = useRef(true);
  const loadAttemptCount = useRef(0);
  const isRetrying = useRef(false);
  const toastDisplayed = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const loadInitiated = useRef(false);

  // Helper function to store profile in session storage
  const cacheProfileData = (profileData: Profile, user: User) => {
    try {
      sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      console.log("Profile data cached in session storage");
    } catch (error) {
      console.error("Failed to cache profile data:", error);
    }
  };

  // Helper function to get cached profile data
  const getCachedProfileData = () => {
    try {
      const cachedProfile = sessionStorage.getItem(PROFILE_STORAGE_KEY);
      const cachedAuthUser = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
      
      if (cachedProfile && cachedAuthUser) {
        return {
          profile: JSON.parse(cachedProfile),
          authUser: JSON.parse(cachedAuthUser)
        };
      }
    } catch (error) {
      console.error("Failed to retrieve cached profile data:", error);
    }
    
    return null;
  };

  // Helper function to clear cached profile data
  const clearCachedProfileData = () => {
    try {
      sessionStorage.removeItem(PROFILE_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
      console.log("Cached profile data cleared");
    } catch (error) {
      console.error("Failed to clear cached profile data:", error);
    }
  };

  useEffect(() => {
    // Only run this effect once at component mount
    if (loadInitiated.current) return;
    
    loadInitiated.current = true;
    isMounted.current = true;
    toastDisplayed.current = false;

    const loadProfile = async () => {
      // If we're already retrying, don't stack multiple attempts
      if (isRetrying.current) return;
      
      try {
        // Check for cached data first
        const cachedData = getCachedProfileData();
        
        if (cachedData) {
          console.log("Using cached profile data");
          if (isMounted.current) {
            setProfile(cachedData.profile);
            setAuthUser(cachedData.authUser);
            setUserEmail(cachedData.authUser.email);
            setIsLoading(false);
            setLoadError(null);
            return;
          }
        }
        
        // No cached data, proceed with API call
        console.log("No cached data found, fetching from API");
        
        // Cancel any previous fetch operations
        if (abortController.current) {
          abortController.current.abort();
        }
        
        // Create a new abort controller for this attempt
        abortController.current = new AbortController();
        
        isRetrying.current = true;
        loadAttemptCount.current += 1;
        console.log(`Starting to load profile data... (Attempt ${loadAttemptCount.current})`);
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          clearCachedProfileData(); // Clear any invalid cached data
          if (isMounted.current) {
            setLoadError("Failed to authenticate user");
            setIsLoading(false);
          }
          navigate('/login');
          return;
        }
        
        if (!user) {
          console.log("No authenticated user found");
          clearCachedProfileData(); // Clear any invalid cached data
          if (isMounted.current) {
            setLoadError("No authenticated user found");
            setIsLoading(false);
          }
          navigate('/login');
          return;
        }
        
        if (isMounted.current) {
          setAuthUser(user);
          setUserEmail(user.email);
        }
        
        console.log("User authenticated:", { id: user.id, email: user.email });
        
        // First try finding profile by user ID with timeout protection
        let profileByIdData;
        let profileByIdError;
        
        try {
          // Use a promise with a timeout to prevent queries from hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Profile query timeout")), 15000);
          });
          
          // Query promise - remove the abortSignal method
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          // Race between the profile query and timeout
          const result = await Promise.race([
            profilePromise,
            timeoutPromise
          ]) as any;
          
          profileByIdData = result.data;
          profileByIdError = result.error;
          
        } catch (error: any) {
          console.log("Profile query timed out or failed:", error.message);
          profileByIdError = error;
        }
          
        console.log("Profile by ID query result:", { 
          data: profileByIdData ? "data found" : "no data", 
          error: profileByIdError 
        });
        
        // Check if profile is marked as deleted and reactivate if needed
        if (profileByIdData && profileByIdData.account_status === 'deleted') {
          console.log("Found deleted account by ID, attempting reactivation");
          
          if (!isMounted.current) return;
          
          const reactivatedProfile = await reactivateAccount(profileByIdData);
          
          if (isMounted.current) {
            if (reactivatedProfile) {
              setProfile(reactivatedProfile);
              setLoadError(null);
              // Cache the reactivated profile
              cacheProfileData(reactivatedProfile, user);
            } else {
              setLoadError("Failed to reactivate account");
              clearCachedProfileData();
            }
            setIsLoading(false);
          }
          return;
        }
        
        // If no profile found by ID, try by email
        if (!profileByIdData && user.email) {
          console.log("No profile found by ID, trying email lookup");
          
          let profileByEmailData;
          let profileByEmailError;
          
          try {
            // Try profile by email with timeout protection
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Email profile query timeout")), 15000);
            });
            
            const emailProfilePromise = supabase
              .from('profiles')
              .select('*')
              .eq('email', user.email)
              .maybeSingle();
              
            const result = await Promise.race([
              emailProfilePromise,
              timeoutPromise
            ]) as any;
            
            profileByEmailData = result.data;
            profileByEmailError = result.error;
          } catch (error: any) {
            console.log("Email profile query timed out or failed:", error.message);
            profileByEmailError = error;
          }
            
          console.log("Profile by email query result:", { 
            data: profileByEmailData ? "data found" : "no data", 
            error: profileByEmailError 
          });
          
          if (profileByEmailData) {
            // Found profile by email
            if (profileByEmailData.account_status === 'deleted') {
              console.log("Found deleted account by email, attempting reactivation");
              
              if (!isMounted.current) return;
              
              const reactivatedProfile = await reactivateAccount(profileByEmailData);
              
              if (isMounted.current) {
                if (reactivatedProfile) {
                  setProfile(reactivatedProfile);
                  setLoadError(null);
                  // Cache the reactivated profile
                  cacheProfileData(reactivatedProfile, user);
                } else {
                  setLoadError("Failed to reactivate account");
                  clearCachedProfileData();
                }
                setIsLoading(false);
              }
              return;
            }
            
            // Profile found by email but not tied to current auth ID,
            // Update the profile ID to match auth ID
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ id: user.id })
              .eq('id', profileByEmailData.id);
              
            if (updateError) {
              console.error("Error updating profile ID:", updateError);
              if (isMounted.current) {
                setLoadError("Failed to update profile ID");
                setIsLoading(false);
                clearCachedProfileData();
              }
            } else {
              console.log("Updated profile ID to match auth ID");
              
              // Check if component is still mounted before continuing
              if (!isMounted.current) return;
              
              // Refetch profile with updated ID
              const { data: updatedProfile, error: refetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
                
              if (refetchError) {
                console.error("Error refetching updated profile:", refetchError);
                setLoadError("Failed to retrieve updated profile");
                clearCachedProfileData();
              }
                
              if (isMounted.current) {
                if (updatedProfile) {
                  setProfile(updatedProfile);
                  setLoadError(null);
                  // Cache the updated profile
                  cacheProfileData(updatedProfile, user);
                } else {
                  setLoadError("Failed to retrieve updated profile");
                  clearCachedProfileData();
                }
                setIsLoading(false);
              }
            }
            return;
          } else {
            console.log("No profile found by email either");
            if (isMounted.current) {
              setLoadError("No profile found");
              setIsLoading(false);
              clearCachedProfileData();
            }
          }
        } else if (profileByIdData) {
          // Active profile found by ID
          if (isMounted.current) {
            setProfile(profileByIdData);
            setLoadError(null);
            setIsLoading(false);
            // Cache the found profile
            cacheProfileData(profileByIdData, user);
          }
          return;
        }
        
        // If we get here, no valid profile was found
        if (isMounted.current) {
          console.log("No valid profile found, redirecting to onboarding");
          setLoadError("Profile not found");
          setIsLoading(false);
          clearCachedProfileData();
          
          // Display toast only once
          if (!toastDisplayed.current) {
            toastDisplayed.current = true;
            toast({
              title: "Account Setup",
              description: "Please complete your account setup to continue.",
            });
          }
          navigate('/?scrollTo=pricing-section');
        }
        
      } catch (error: any) {
        console.error('Error loading profile:', error);
        if (isMounted.current) {
          setLoadError(error.message || "Failed to load profile");
          clearCachedProfileData();
          
          // Display toast only once
          if (!toastDisplayed.current) {
            toastDisplayed.current = true;
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load profile information.",
            });
          }
          
          setIsLoading(false);
        }
      } finally {
        isRetrying.current = false;
      }
    };
    
    loadProfile();
    
    // Cleanup function to prevent state updates on unmounted component
    // and abort any in-progress requests
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []); // Empty dependency array - run only on mount

  // Add function to retry loading the profile
  const retryLoading = () => {
    if (!isLoading) {
      // Force clear cached data when manually retrying
      clearCachedProfileData();
      loadInitiated.current = false; // Allow the effect to run again
      abortController.current = null;
      setIsLoading(true);
      setLoadError(null);
      toastDisplayed.current = false;
    }
  };

  return {
    isLoading,
    loadError,
    userEmail,
    profile,
    authUser,
    retryLoading
  };
};