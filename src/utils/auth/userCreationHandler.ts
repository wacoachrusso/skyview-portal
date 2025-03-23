
import { supabase } from "@/integrations/supabase/client";

// Define the expected signup data shape
export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  job_title: string;
  airline: string;
  plan: string;
}

/**
 * Creates a new user account
 */
export async function createUserAccount(data: SignupData) {
  console.log("Creating user account with data:", { ...data, password: '[REDACTED]' });
  
  try {
    // Create the auth user
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          user_type: data.job_title,
          airline: data.airline,
          subscription_plan: data.plan || "free"
        }
      }
    });
    
    if (signUpError) throw signUpError;
    
    console.log("User created successfully:", authUser);
    return authUser.user;
    
  } catch (error) {
    console.error("Error in createUserAccount:", error);
    throw error;
  }
}
