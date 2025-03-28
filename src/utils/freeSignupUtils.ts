
import { supabase } from "@/integrations/supabase/client";

interface FreeSignupParams {
  email?: string;
  password?: string; // Make password optional
  fullName?: string;
  jobTitle: string;
  airline: string;
  assistantId: string;
  isGoogleSignIn?: boolean; // Flag to check if the user signed in with Google
}

export const handleFreeSignup = async ({
  email,
  password,
  fullName,
  jobTitle,
  airline,
  assistantId,
  isGoogleSignIn = false, // Default to false
}: FreeSignupParams) => {
  console.log('Processing free plan signup for:', email);
  console.log('Using assistant ID:', assistantId);

  // Set a flag to prevent redirect loops during signup
  localStorage.setItem('signup_in_progress', 'true');

  // Check if the user is already authenticated
  const { data: session, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error checking user session:", sessionError);
    localStorage.removeItem('signup_in_progress');
    throw new Error("Error checking user session. Please try again.");
  }

  // If the user is authenticated (Google sign-in), create the profile directly
  if (isGoogleSignIn && session?.session?.user) {
    console.log("User is authenticated via Google, creating profile.");

    // Create the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: session.session.user.id, // Use the authenticated user's ID
        email: email?.trim().toLowerCase(),
        full_name: fullName?.trim(),
        user_type: jobTitle.toLowerCase(),
        airline: airline.toLowerCase(),
        subscription_plan: 'free',
        query_count: 0, // Start with 0 so they get one free query
        assistant_id: assistantId,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      localStorage.removeItem('signup_in_progress');
      throw new Error("Error creating profile. Please try again.");
    }

    console.log("Profile created successfully for authenticated user:", profile);
    
    // Set session tokens in cookies for persistence
    if (session.session) {
      document.cookie = `sb-access-token=${session.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      document.cookie = `sb-refresh-token=${session.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      document.cookie = `session_user_id=${session.session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      console.log("Session tokens stored in cookies for persistence");
    }
    
    // Store a flag to prevent pricing redirects
    sessionStorage.setItem('recently_signed_up', 'true');
    localStorage.setItem('new_user_signup', 'true');
    localStorage.removeItem('signup_in_progress');
    
    return { message: "Profile created successfully", profile };
  }

  // If the user is not authenticated, proceed with the normal signup flow
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email?.trim().toLowerCase(),
      password: password!, // Password is required for non-Google users
      options: {
        data: {
          full_name: fullName?.trim(),
          user_type: jobTitle.toLowerCase(),
          airline: airline.toLowerCase(),
          subscription_plan: 'free',
          assistant_id: assistantId,
        },
        // We don't redirect to confirmation URL - sign them in directly
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Signup error:", error);
      localStorage.removeItem('signup_in_progress');
      throw error;
    }

    if (!data.user) {
      localStorage.removeItem('signup_in_progress');
      throw new Error('Failed to create account');
    }
    
    // Set a flag to prevent pricing redirects
    sessionStorage.setItem('recently_signed_up', 'true');
    // This flag helps us know it's a new signup
    localStorage.setItem('new_user_signup', 'true');
    localStorage.removeItem('signup_in_progress');
    
    console.log("Free trial signup successful:", data);
    return data;
  } catch (error) {
    console.error("Error in handleFreeSignup:", error);
    localStorage.removeItem('signup_in_progress');
    throw error;
  }
};
