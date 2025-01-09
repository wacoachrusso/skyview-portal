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