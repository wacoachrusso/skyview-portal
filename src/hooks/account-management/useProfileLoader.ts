
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile, UseProfileLoaderReturn } from "./types";
import { User } from "@supabase/supabase-js";
import { useAccountReactivation } from "./useAccountReactivation";

export const useProfileLoader = (): UseProfileLoaderReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reactivateAccount } = useAccountReactivation();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const loadProfile = async () => {
      try {
        console.log("Starting to load profile data...");
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          if (isMounted.current) {
            setIsLoading(false);
          }
          navigate('/login');
          return;
        }
        
        if (!user) {
          console.log("No authenticated user found");
          if (isMounted.current) {
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
        
        // First try finding profile by user ID
        const { data: profileByIdData, error: profileByIdError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        console.log("Profile by ID query result:", { 
          data: profileByIdData, 
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
            }
            setIsLoading(false);
          }
          return;
        }
        
        // If no profile found by ID, try by email
        if (!profileByIdData && user.email) {
          console.log("No profile found by ID, trying email lookup");
          const { data: profileByEmailData, error: profileByEmailError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
            
          console.log("Profile by email query result:", { 
            data: profileByEmailData, 
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
                setIsLoading(false);
              }
            } else {
              console.log("Updated profile ID to match auth ID");
              
              // Check if component is still mounted before continuing
              if (!isMounted.current) return;
              
              // Refetch profile with updated ID
              const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (isMounted.current) {
                setProfile(updatedProfile);
                setIsLoading(false);
              }
            }
            return;
          } else {
            console.log("No profile found by email either");
            if (isMounted.current) {
              setIsLoading(false);
            }
          }
        } else if (profileByIdData) {
          // Active profile found by ID
          if (isMounted.current) {
            setProfile(profileByIdData);
            setIsLoading(false);
          }
          return;
        }
        
        // If we get here, no valid profile was found
        if (isMounted.current) {
          console.log("No valid profile found, redirecting to onboarding");
          setIsLoading(false);
          toast({
            title: "Account Setup",
            description: "Please complete your account setup to continue.",
          });
          navigate('/?scrollTo=pricing-section');
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
        if (isMounted.current) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load profile information.",
          });
          setIsLoading(false);
        }
      }
    };
    
    loadProfile();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted.current = false;
    };
  }, [navigate, toast, reactivateAccount]);

  return {
    isLoading,
    userEmail,
    profile,
    authUser
  };
};
