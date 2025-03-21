
export function cleanResponse(response: string): string {
  if (!response) {
    return "I couldn't generate a response. Please try asking your question again.";
  }
  
  // Remove any source citations like 【8:0†source】
  const cleanedResponse = response.replace(/【[^】]*】/g, '');
  
  // Ensure references are properly formatted
  let formattedResponse = cleanedResponse.replace(
    /\[REF\](Section [^,]+, Page \d+):(.*?)\[\/REF\]/g,
    (_, reference, quote) => {
      return `[REF]${reference.trim()}: ${quote.trim()}[/REF]`;
    }
  );
  
  // If no references were found, append a note
  if (!formattedResponse.includes('[REF]')) {
    formattedResponse = formattedResponse + '\n\n[REF]Note: No specific contract references were found for this query.[/REF]';
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
