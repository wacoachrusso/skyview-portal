import { supabase } from "@/integrations/supabase/client";

interface Assistant {
  name: string;
  id: string;
}

const ASSISTANT_MAPPING: Record<string, Assistant> = {
  "American Airlines_Flight Attendant": {
    name: "SkyGuide AMERICAN AIRLINES FLIGHT ATTENDANT",
    id: "asst_xpkEzhLUt4Qn6uzRzSxAekGh"
  },
  "United Airlines_Flight Attendant": {
    name: "SkyGuide UAL FLIGHT ATTENDANT",
    id: "asst_YdZtVHPSq6TIYKRkKcOqtwzn"
  }
};

export const getAssistant = (airline: string, jobTitle: string): Assistant => {
  console.log('Getting assistant for:', { airline, jobTitle });
  
  const key = `${airline}_${jobTitle}`;
  const assistant = ASSISTANT_MAPPING[key];
  
  console.log('Assistant lookup:', { key, found: assistant ? 'yes' : 'no' });
  
  if (!assistant) {
    console.error('No assistant found for:', { key });
    throw new Error(`No assistant found for ${airline} ${jobTitle}`);
  }
  
  console.log('Found assistant:', assistant);
  return assistant;
};

export const assignAssistantToUser = async (userId: string, airline: string, jobTitle: string) => {
  console.log('Assigning assistant to user:', { userId, airline, jobTitle });
  
  try {
    // Get the assistant details
    const assistant = getAssistant(airline, jobTitle);
    
    // Update the user's profile in the database
    const { error } = await supabase
      .from('profiles')
      .update({ 
        assistant_id: assistant.id 
      })
      .eq('id', userId);

    if (error) {
      console.error('Error assigning assistant to user:', error);
      throw error;
    }

    console.log('Successfully assigned assistant to user:', {
      userId,
      assistantName: assistant.name,
      assistantId: assistant.id
    });

    return assistant;
  } catch (error) {
    console.error('Failed to assign assistant to user:', error);
    throw error;
  }
};
