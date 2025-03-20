
const DEFAULT_RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_RETRY_COUNT,
    initialDelay = INITIAL_RETRY_DELAY,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (!shouldRetry(error) || attempt === maxRetries - 1) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function defaultShouldRetry(error: any): boolean {
  // Retry on network errors and 5xx server errors
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return true;
  }

  const status = error.status || (error.response && error.response.status);
  return status >= 500 && status < 600;
}

export function isRateLimitError(error: any): boolean {
  const status = error.status || (error.response && error.response.status);
  return status === 429;
}
