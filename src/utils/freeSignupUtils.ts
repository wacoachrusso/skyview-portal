
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

  // Check if the user is already authenticated
  const { data: session, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error checking user session:", sessionError);
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
      throw new Error("Error creating profile. Please try again.");
    }

    console.log("Profile created successfully for authenticated user:", profile);
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
        // Don't redirect to confirmation URL - sign them in directly
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to create account');
    }

    console.log("Free trial signup successful:", data);
    return data;
  } catch (error) {
    console.error("Error in handleFreeSignup:", error);
    throw error;
  }
};
