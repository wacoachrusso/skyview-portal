// Assistant ID mapping
const UNITED_FA_ASSISTANT_ID = "asst_YdZtVHPSq6TIYKRkKcOqtwzn";
const AMERICAN_FA_ASSISTANT_ID = "asst_xpkEzhLUt4Qn6uzRzSxAekGh";

export const getAssistantId = (airline: string, userType: string): string | null => {
  if (userType.toLowerCase() === 'flight attendant') {
    if (airline.toLowerCase() === 'american airlines') {
      return AMERICAN_FA_ASSISTANT_ID;
    } else if (airline.toLowerCase() === 'united airlines') {
      return UNITED_FA_ASSISTANT_ID;
    }
  }
  return null;
};