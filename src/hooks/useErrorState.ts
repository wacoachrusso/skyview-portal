
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useErrorState = () => {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: Error) => {
    console.error('Error occurred:', error);
    setError(error);
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};
