
export function cleanResponse(response: string): string {
  if (!response) {
    return "I couldn't generate a response. Please try asking your question again.";
  }
  
  // Remove any source citations like 【8:0†source】
  const cleanedResponse = response.replace(/【[^】]*】/g, '');
  
  // Format contract references with the standardized format
  let formattedResponse = cleanedResponse.replace(
    /\[REF\](.*?)\[\/REF\]/g,
    (match, reference) => {
      // Add the colored diamond emoji and format in a highlighted box
      return `\n\n🔹 Reference: ${reference.trim()}\n`;
    }
  );
  
  // If no references were found, append a note
  if (!formattedResponse.includes('🔹 Reference:')) {
    formattedResponse = formattedResponse + '\n\n🔹 Note: No specific contract references were found for this query. Please consult your union representative for further clarification.';
  }
  
  return formattedResponse;
}

export function containsNonContractContent(content: string): boolean {
  if (!content) return false;
  
  // List of keywords that might indicate non-contract questions
  const nonContractKeywords = [
    'weather',
    'stock',
    'sports',
    'news',
    'movie',
    'restaurant',
    'recipe',
    'game',
    'travel',
    'vacation',
    'hotel',
    'flight'
  ];

  const contentLower = content.toLowerCase();
  return nonContractKeywords.some(keyword => contentLower.includes(keyword));
}
