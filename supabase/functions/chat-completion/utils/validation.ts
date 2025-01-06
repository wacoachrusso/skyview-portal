export function cleanResponse(text: string): string {
  return text
    .replace(/【.*?】/g, '')
    .replace(/\[\d+:\d+†.*?\]/g, '')
    .trim();
}

export function containsNonContractContent(content: string): boolean {
  const nonContractKeywords = [
    'weather', 'stocks', 'recipe', 'movie', 'game', 'sports',
    'cryptocurrency', 'dating', 'shopping', 'entertainment'
  ];

  return nonContractKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
}