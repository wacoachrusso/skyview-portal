export function cleanResponse(response: string): string {
  // Ensure there's a reference section
  if (!response.includes('[REF]')) {
    return response + '\n\n[REF]Note: This response requires clarification. Please rephrase your question to focus on specific contract sections.[/REF]';
  }
  return response;
}

export function containsNonContractContent(content: string): boolean {
  // List of keywords that might indicate non-contract questions
  const nonContractKeywords = [
    'weather',
    'restaurant',
    'movie',
    'sports',
    'game',
    'recipe',
    'cook',
    'personal',
    'relationship',
    'dating',
    'entertainment'
  ];

  const contentLower = content.toLowerCase();
  return nonContractKeywords.some(keyword => contentLower.includes(keyword));
}