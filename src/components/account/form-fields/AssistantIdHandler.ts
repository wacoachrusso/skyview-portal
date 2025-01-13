import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Assistant ID mapping
const ASSISTANT_IDS = {
  AMERICAN_FA: "asst_xpkEzhLUt4Qn6uzRzSxAekGh",
  UNITED_FA: "asst_YdZtVHPSq6TIYKRkKcOqtwzn",
} as const;

// Type for supported airlines
type SupportedAirline = "american airlines" | "united airlines";

// Type for supported roles
type SupportedRole = "flight attendant";

// Type for the assistant configuration
interface AssistantConfig {
  airline: SupportedAirline;
  role?: SupportedRole | undefined;
}

// Error class for unsupported configurations
class UnsupportedConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedConfigError';
  }
}

// Function to validate and normalize airline name
const normalizeAirline = (airline: string): SupportedAirline => {
  const normalized = airline.toLowerCase().trim();
  if (normalized !== "american airlines" && normalized !== "united airlines") {
    throw new UnsupportedConfigError(`Unsupported airline: ${airline}`);
  }
  return normalized;
};

// Function to validate and normalize role
const normalizeRole = (role: string | undefined): SupportedRole | undefined => {
  if (!role) return undefined;
  const normalized = role.toLowerCase().trim();
  if (normalized !== "flight attendant") {
    throw new UnsupportedConfigError(`Unsupported role: ${role}`);
  }
  return normalized;
};

// Main function to get assistant ID based on config
export const getAssistantId = (config: AssistantConfig): string => {
  console.log('Getting assistant ID for config:', config);
  
  try {
    const { airline, role } = config;
    
    if (role === "flight attendant") {
      if (airline === "american airlines") {
        console.log('Assigning American Airlines FA assistant');
        return ASSISTANT_IDS.AMERICAN_FA;
      } else if (airline === "united airlines") {
        console.log('Assigning United Airlines FA assistant');
        return ASSISTANT_IDS.UNITED_FA;
      }
    }
    
    throw new UnsupportedConfigError(`No assistant found for airline: ${airline} and role: ${role}`);
  } catch (error) {
    console.error('Error getting assistant ID:', error);
    throw error;
  }
};

// React Query hook to fetch and cache user's assistant ID
export const useAssistantId = () => {
  return useQuery({
    queryKey: ['assistantId'],
    queryFn: async () => {
      console.log('Fetching user metadata for assistant ID');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('User not authenticated');
      }
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('airline, user_type')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      if (!profile?.airline || !profile?.user_type) {
        console.error('Missing required profile data');
        throw new Error('Missing required profile data: airline or user type');
      }
      
      try {
        const airline = normalizeAirline(profile.airline);
        const role = normalizeRole(profile.user_type);
        
        return getAssistantId({ airline, role });
      } catch (error) {
        if (error instanceof UnsupportedConfigError) {
          console.error('Unsupported configuration:', error.message);
          throw error;
        }
        throw new Error('Failed to determine assistant ID');
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false
  });
};

// Helper function to check if a configuration is supported
export const isSupportedConfig = (airline: string, role: string): boolean => {
  try {
    const normalizedAirline = normalizeAirline(airline);
    const normalizedRole = normalizeRole(role);
    getAssistantId({ airline: normalizedAirline, role: normalizedRole });
    return true;
  } catch (error) {
    return false;
  }
};

/*
 * To extend this system for more airlines and roles:
 * 1. Add new airline to SupportedAirline type
 * 2. Add new role to SupportedRole type if needed
 * 3. Add new assistant ID to ASSISTANT_IDS constant
 * 4. Update normalizeAirline/normalizeRole functions to handle new values
 * 5. Update getAssistantId logic to handle new combinations
 * 
 * Example:
 * - Add "delta airlines" to SupportedAirline
 * - Add "DELTA_FA": "asst_..." to ASSISTANT_IDS
 * - Update normalizeAirline to accept "delta airlines"
 * - Add Delta condition in getAssistantId
 */