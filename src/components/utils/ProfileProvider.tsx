import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { PUBLIC_ROUTES } from "@/data/routes";

// Define Profile type
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  account_status?: string;
  subscription_plan?: string;
  subscription_status?: string;
  query_count?: number;
  is_admin?: boolean;
  [key: string]: any; // For any other fields
}

// Session storage keys
const PROFILE_STORAGE_KEY = "cached_user_profile";
const AUTH_USER_STORAGE_KEY = "cached_auth_user";

interface ProfileContextType {
  isLoading: boolean;
  loadError: string | null;
  userEmail: string | null;
  userName: string | null;
  profile: Profile | null;
  authUser: User | null;
  queryCount: number;
  isAdmin: boolean;
  setQueryCount: React.Dispatch<React.SetStateAction<number>>;
  refreshProfile: () => Promise<void>;
  handleCancelSubscription: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  reactivateAccount: (profileData: Profile) => Promise<Profile | null>;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { toast } = useToast();

  // State for profile data
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [queryCount, setQueryCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Refs for managing loading state
  const isMounted = useRef(true);
  const loadAttemptCount = useRef(0);
  const isRetrying = useRef(false);
  const toastDisplayed = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const loadInitiated = useRef(false);

  // Check if current path is a public route
  const isPublicRoute = useCallback(() => {
    return PUBLIC_ROUTES.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + "/")
    );
  }, [location.pathname]);

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
          authUser: JSON.parse(cachedAuthUser),
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
      sessionStorage.removeItem("auth_status");
      console.log("Cached profile data cleared");
    } catch (error) {
      console.error("Failed to clear cached profile data:", error);
    }
  };

  // Reactivate deleted account
  const reactivateAccount = async (
    profileData: Profile
  ): Promise<Profile | null> => {
    try {
      console.log("Attempting to reactivate account:", profileData.id);

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          account_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileData.id)
        .select()
        .single();

      if (error) {
        console.error("Error reactivating account:", error);
        toast({
          variant: "destructive",
          title: "Reactivation Failed",
          description:
            "Failed to reactivate your account. Please contact support.",
        });
        return null;
      }

      console.log("Account reactivated successfully");
      toast({
        title: "Account Reactivated",
        description: "Your account has been reactivated successfully.",
      });

      return updatedProfile;
    } catch (error) {
      console.error("Error in reactivateAccount:", error);
      return null;
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!authUser?.id) return;

    try {
      // Call to your backend service to cancel subscription
      const { error } = await supabase.functions.invoke("stripe-cancel-subscription", {
        body: { user_id: authUser.id },
      });

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Refresh profile to get updated subscription status
      refreshProfile();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to cancel subscription. Please try again.",
      });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!authUser?.id || !profile) return;

    try {
      // First mark the account as deleted in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          account_status: "deleted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id);

      if (profileError) throw profileError;

      // Cancel any active subscriptions if applicable
      if (profile.subscription_status === "active") {
        await handleCancelSubscription();
      }

      // Sign out the user
      await logout();

      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to delete your account. Please try again.",
      });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      clearCachedProfileData();
      setProfile(null);
      setAuthUser(null);
      setUserEmail(null);
      setUserName(null);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Main function to load profile data
  const loadProfile = async () => {
    // If we're already retrying, don't stack multiple attempts
    if (isRetrying.current) return;

    try {
      // Check for cached data first
      const cachedData = getCachedProfileData();

      if (cachedData) {
        if (isMounted.current) {
          setProfile(cachedData.profile);
          setAuthUser(cachedData.authUser);
          setUserEmail(cachedData.authUser.email);
          setUserName(cachedData.profile.full_name || null);
          setQueryCount(cachedData.profile.query_count || 0);
          setIsAdmin(cachedData.profile.is_admin || false);
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
      console.log(
        `Starting to load profile data... (Attempt ${loadAttemptCount.current})`
      );

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        if (!isPublicRoute()) {
          console.error("Error getting user:", userError);
        }

        clearCachedProfileData(); // Clear any invalid cached data
        if (isMounted.current) {
          setLoadError("Failed to authenticate user");
          setIsLoading(false);

          // Only redirect if not on a public route
          if (!isPublicRoute()) {
            navigate("/login");
          }
        }
        return;
      }

      if (!user) {
        console.log("No authenticated user found");
        clearCachedProfileData(); // Clear any invalid cached data
        if (isMounted.current) {
          setLoadError("No authenticated user found");
          setIsLoading(false);

          // Only redirect if not on a public route
          if (!isPublicRoute()) {
            navigate("/login");
          }
        }
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

        // Query promise
        const profilePromise = supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        // Race between the profile query and timeout
        const result = (await Promise.race([
          profilePromise,
          timeoutPromise,
        ])) as any;

        profileByIdData = result.data;
        profileByIdError = result.error;
      } catch (error: any) {
        console.log("Profile query timed out or failed:", error.message);
        profileByIdError = error;
      }
      // profileByIdData = ""

      console.log("Profile by ID query result:", {
        data: profileByIdData ? "data found" : "no data",
        error: profileByIdError,
      });

      // Check if profile is marked as deleted and reactivate if needed
      if (profileByIdData && profileByIdData.account_status === "deleted") {
        console.log("Found deleted account by ID, attempting reactivation");

        if (!isMounted.current) return;

        const reactivatedProfile = await reactivateAccount(profileByIdData);

        if (isMounted.current) {
          if (reactivatedProfile) {
            setProfile(reactivatedProfile);
            setUserName(reactivatedProfile.full_name || null);
            setQueryCount(reactivatedProfile.query_count || 0);
            setIsAdmin(reactivatedProfile.is_admin || false);
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
            setTimeout(
              () => reject(new Error("Email profile query timeout")),
              15000
            );
          });

          const emailProfilePromise = supabase
            .from("profiles")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

          const result = (await Promise.race([
            emailProfilePromise,
            timeoutPromise,
          ])) as any;

          profileByEmailData = result.data;
          profileByEmailError = result.error;
        } catch (error: any) {
          console.log(
            "Email profile query timed out or failed:",
            error.message
          );
          profileByEmailError = error;
        }

        console.log("Profile by email query result:", {
          data: profileByEmailData ? "data found" : "no data",
          error: profileByEmailError,
        });

        if (profileByEmailData) {
          // Found profile by email
          if (profileByEmailData.account_status === "deleted") {
            console.log(
              "Found deleted account by email, attempting reactivation"
            );

            if (!isMounted.current) return;

            const reactivatedProfile = await reactivateAccount(
              profileByEmailData
            );

            if (isMounted.current) {
              if (reactivatedProfile) {
                setProfile(reactivatedProfile);
                setUserName(reactivatedProfile.full_name || null);
                setQueryCount(reactivatedProfile.query_count || 0);
                setIsAdmin(reactivatedProfile.is_admin || false);
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
            .from("profiles")
            .update({ id: user.id })
            .eq("id", profileByEmailData.id);

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
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();

            if (refetchError) {
              console.error("Error refetching updated profile:", refetchError);
              setLoadError("Failed to retrieve updated profile");
              clearCachedProfileData();
            }

            if (isMounted.current) {
              if (updatedProfile) {
                setProfile(updatedProfile);
                setUserName(updatedProfile.full_name || null);
                setQueryCount(updatedProfile.query_count || 0);
                setIsAdmin(updatedProfile.is_admin || false);
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

            // Only redirect if not on a public route
            if (!isPublicRoute()) {
              // Display toast only once
              if (!toastDisplayed.current) {
                toastDisplayed.current = true;
                toast({
                  title: "Account Setup",
                  description:
                    "Please complete your account setup to continue.",
                });
              }
              navigate("/?scrollTo=pricing-section");
            }
          }
        }
      } else if (profileByIdData) {
        // Active profile found by ID
        if (isMounted.current) {
          setProfile(profileByIdData);
          setUserName(profileByIdData.full_name || null);
          setQueryCount(profileByIdData.query_count || 0);
          setIsAdmin(profileByIdData.is_admin || false);
          setLoadError(null);
          setIsLoading(false);
          // Cache the found profile
          cacheProfileData(profileByIdData, user);
        }
        return;
      }

      // If we get here, no valid profile was found
      if (isMounted.current) {
        console.log("No valid profile found");
        setLoadError("Profile not found");
        setIsLoading(false);
        clearCachedProfileData();

        // Only redirect if not on a public route
        if (!isPublicRoute()) {
          // Display toast only once
          if (!toastDisplayed.current) {
            toastDisplayed.current = true;
            toast({
              title: "Account Setup",
              description: "Please complete your account setup to continue.",
            });
          }
          navigate("/?scrollTo=pricing-section");
        }
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      if (isMounted.current) {
        setLoadError(error.message || "Failed to load profile");
        clearCachedProfileData();

        // Display toast only once for non-public routes
        if (!isPublicRoute() && !toastDisplayed.current) {
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

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!isLoading) {
      // Force clear cached data when manually refreshing
      clearCachedProfileData();
      loadInitiated.current = false;
      abortController.current = null;
      setIsLoading(true);
      setLoadError(null);
      toastDisplayed.current = false;
      await loadProfile();
    }
  }, [isLoading]);

  // Initialize profile on mount or when location changes
  useEffect(() => {
    // Reset initialization when pathname changes to ensure proper auth checks
    if (location.pathname) {
      if (!loadInitiated.current) {
        loadInitiated.current = true;
        isMounted.current = true;
        toastDisplayed.current = false;

        loadProfile();
      }
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [location.pathname]); // Run when pathname changes

  // Reset loadInitiated when location changes significantly
  useEffect(() => {
    // Reset initialization when pathname changes to ensure proper auth checks on navigation
    loadInitiated.current = false;
  }, [location.pathname]);

  // Update query count in context when it changes in profile
  useEffect(() => {
    if (profile && profile.query_count !== undefined) {
      setQueryCount(profile.query_count);
    }
  }, [profile?.query_count]);

  return (
    <ProfileContext.Provider
      value={{
        isLoading,
        loadError,
        userEmail,
        userName,
        profile,
        authUser,
        queryCount,
        isAdmin,
        setQueryCount,
        refreshProfile,
        handleCancelSubscription,
        handleDeleteAccount,
        reactivateAccount,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
