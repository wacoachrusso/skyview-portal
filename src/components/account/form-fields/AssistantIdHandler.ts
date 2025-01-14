// Assistant ID mapping
const UNITED_FA_ASSISTANT_ID = "asst_YdZtVHPSq6TIYKRkKcOqtwzn";
const AMERICAN_FA_ASSISTANT_ID = "asst_xpkEzhLUt4Qn6uzRzSxAekGh";

export const getAssistantId = (airline: string, userType: string): string | null => {
  console.log('Getting assistant ID for:', { airline, userType });
  
  const normalizedUserType = userType.toLowerCase();
  const normalizedAirline = airline.toLowerCase();

  if (normalizedUserType === 'flight attendant') {
    if (normalizedAirline === 'american airlines') {
      console.log('Assigning American Airlines FA assistant');
      return AMERICAN_FA_ASSISTANT_ID;
    } else if (normalizedAirline === 'united airlines') {
      console.log('Assigning United Airlines FA assistant');
      return UNITED_FA_ASSISTANT_ID;
    }
  }
  
  console.log('No matching assistant found for:', { airline, userType });
  return null;
};