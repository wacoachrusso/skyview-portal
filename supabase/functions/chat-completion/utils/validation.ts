export function cleanResponse(response: string): string {
  // Check if response has a proper reference with section and page number
  const hasProperReference = /\[REF\]Section \d+(\.\d+)?.*?, Page \d+:.*?\[\/REF\]/i.test(response);
  
  if (!hasProperReference) {
    console.error('Response missing proper contract reference:', response);
    throw new Error('INVALID_REFERENCE: Response must include specific contract section and page number');
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