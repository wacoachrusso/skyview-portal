export const cleanResponse = (text: string) => {
  return text
    .replace(/【.*?】/g, '')
    .replace(/\[\d+:\d+†.*?\]/g, '')
    .trim();
};