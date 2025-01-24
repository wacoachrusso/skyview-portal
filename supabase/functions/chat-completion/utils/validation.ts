export function cleanResponse(response: string): string {
  // Ensure references are properly formatted
  const cleanedResponse = response.replace(
    /\[REF\](Section [^,]+, Page \d+):(.*?)\[\/REF\]/g,
    (_, reference, quote) => {
      return `[REF]${reference.trim()}: ${quote.trim()}[/REF]`;
    }
  );
  
  // If no references were found, append a note
  if (!cleanedResponse.includes('[REF]')) {
    return cleanedResponse + '\n\n[REF]Note: No specific contract references were found for this query.[/REF]';
  }
  
  return cleanedResponse;
}

export function containsNonContractContent(content: string): boolean {
  // List of keywords that might indicate non-contract questions
  const nonContractKeywords = [
    'weather',
    'stock',
    'sports',
    'news',
    'movie',
    'restaurant',
    'recipe',
    'game'
  ];

  const contentLower = content.toLowerCase();
  return nonContractKeywords.some(keyword => contentLower.includes(keyword));
}