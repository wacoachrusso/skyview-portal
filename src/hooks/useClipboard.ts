
import { useState } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
}

/**
 * A hook for copying text to the clipboard
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = async (text: string): Promise<boolean> => {
    try {
      if (!navigator?.clipboard) {
        throw new Error('Clipboard not supported');
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Reset copied state after timeout
      const timeout = options.timeout || 2000;
      setTimeout(() => {
        setCopied(false);
      }, timeout);

      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopied(false);
      setError(err instanceof Error ? err : new Error('Failed to copy'));
      return false;
    }
  };

  return { copy, copied, error };
}
