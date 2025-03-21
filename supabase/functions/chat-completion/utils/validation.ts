
/**
 * Clean the OpenAI response to ensure it's properly formatted
 */
export function cleanResponse(response: string): string {
  // Ensure proper highlighting of contract references and sections
  let cleanedResponse = response;
  
  // Enhance any section references (e.g., "Section 5.2") with highlighting
  cleanedResponse = cleanedResponse.replace(
    /\b(Section|Article)\s+(\d+(\.\d+)*)/gi,
    '<b>$1 $2</b>'
  );
  
  // Enhance page references
  cleanedResponse = cleanedResponse.replace(
    /\b(Page|p\.)\s+(\d+)/gi,
    '<b>$1 $2</b>'
  );
  
  // Clean up any markdown artifacts that might be present
  cleanedResponse = cleanedResponse.replace(/```/g, '');
  
  return cleanedResponse;
}

/**
 * Check if content appears to be non-contract related
 */
export function containsNonContractContent(content: string): boolean {
  // List of non-contract related keywords or patterns
  const nonContractKeywords = [
    /\b(weather|stock|market|sports|game|movie|film|music|song|recipe|cook|food|politics)\b/i,
    /\b(who is|what is|where is|when is|why is)\b/i,
    /\b(tell me about|explain|describe)\b/i,
    /\b(joke|funny|humor|entertainment)\b/i,
    /\b(personal|private|individual)\b/i
  ];
  
  // Check for presence of contract-related keywords
  const contractKeywords = [
    /\b(contract|agreement|clause|section|article|provision|term|condition|policy|union|grievance)\b/i,
    /\b(payment|compensation|salary|wage|benefit|retirement|sick leave|vacation|pto|pay)\b/i,
    /\b(schedule|hour|shift|overtime|rest|break|duty|assignment|trip|reserve)\b/i,
    /\b(seniority|bidding|training|qualification|certification|recurrent)\b/i,
    /\b(discipline|termination|furlough|layoff|recall|probation|performance|evaluation)\b/i
  ];
  
  // If the content contains contract-related terms, consider it contract-related
  for (const pattern of contractKeywords) {
    if (pattern.test(content)) {
      return false; // Contains contract content
    }
  }
  
  // Check for non-contract patterns
  for (const pattern of nonContractKeywords) {
    if (pattern.test(content)) {
      return true; // Contains non-contract content
    }
  }
  
  // Default to allowing the question if we can't determine
  return false;
}
