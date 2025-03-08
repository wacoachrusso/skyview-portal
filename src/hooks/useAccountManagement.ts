import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  subscription_plan: string;
  query_count: number;
  last_query_timestamp: string;
  account_status?: string;
  [key: string]: any; // For any other fields
}

export const useAccountManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log("Starting to load profile data...");
        setIsLoading(true);
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          throw userError;
        }
        
        if (!user) {
          console.log("No authenticated user found");
          navigate('/login');
          return;
        }
        
        setAuthUser(user);
        setUserEmail(user.email);
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
          await reactivateAccount(profileByIdData);
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
              await reactivateAccount(profileByEmailData);
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
            } else {
              console.log("Updated profile ID to match auth ID");
              // Refetch profile with updated ID
              const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
              setProfile(updatedProfile);
              return;
            }
          } else {
            console.log("No profile found by email either");
          }
        } else if (profileByIdData) {
          // Active profile found by ID
          setProfile(profileByIdData);
          return;
        }
        
        // If we get here, no valid profile was found
        console.log("No valid profile found, redirecting to onboarding");
        toast({
          title: "Account Setup",
          description: "Please complete your account setup to continue.",
        });
        navigate('/?scrollTo=pricing-section');
        
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information.",
        });
      } finally {
        console.log("Setting loading state to false");
        setIsLoading(false);
      }
    };
    
    const reactivateAccount = async (deletedProfile: Profile) => {
      try {
        console.log("Attempting to reactivate deleted account:", deletedProfile.id);
        
        // Update the profile to reactivate it
        const { data: reactivatedProfile, error: reactivationError } = await supabase
          .from('profiles')
          .update({
            account_status: 'active',
            // Reset to free plan (user can upgrade later)
            subscription_plan: 'free',
            // Reset query count for free plan
            query_count: 0,
            last_query_timestamp: new Date().toISOString()
          })
          .eq('id', deletedProfile.id)
          .select()
          .single();
        
        if (reactivationError) {
          console.error("Error reactivating account:", reactivationError);
          throw reactivationError;
        }
        
        console.log("Account successfully reactivated:", reactivatedProfile);
        
        // Set the profile state with the reactivated profile
        setProfile(reactivatedProfile);
        
        // Show success toast
        toast({
          title: "Account Reactivated",
          description: "Your account has been successfully reactivated. Please upgrade your subscription plan.",
        });
        
        // Redirect to pricing section or dashboard
        navigate('/?scrollTo=pricing-section');
        
      } catch (error) {
        console.error("Failed to reactivate account:", error);
        toast({
          variant: "destructive",
          title: "Reactivation Failed",
          description: "We couldn't reactivate your account. Please contact support.",
        });
        
        // Sign out the user if reactivation fails
        await supabase.auth.signOut();
        navigate('/login');
      }
    };
    
    loadProfile();
  }, [navigate, toast]);

  const handleCancelSubscription = async () => {
    try {
      if (!authUser) {
        console.error("No authenticated user found");
        return;
      }
      
      console.log("Cancelling subscription for user:", authUser.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: 'free',
          query_count: 0,
          last_query_timestamp: new Date().toISOString()
        })
        .eq('id', authUser.id);
        
      if (error) {
        console.error("Error updating subscription:", error);
        throw error;
      }
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      
      // Refresh profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
        
      setProfile(profileData);
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      if (!authUser) {
        console.error("No authenticated user found");
        return;
      }
      
      console.log("Marking account as deleted for user:", authUser.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'deleted',
          subscription_plan: 'free'
        })
        .eq('id', authUser.id);
        
      if (error) {
        console.error("Error deleting account:", error);
        throw error;
      }
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });
      
      navigate('/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account. Please try again.",
      });
    }
  };

  return {
    isLoading,
    userEmail,
    profile,
    handleCancelSubscription,
    handleDeleteAccount
  };
};