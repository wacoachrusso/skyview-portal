
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

interface ReleaseNoteFormValues {
  version: string;
  title: string;
  description: string;
  is_major: boolean;
  release_date: Date | string;
}

interface UseReleaseNoteFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export const useReleaseNoteForm = ({ onSuccess, initialData }: UseReleaseNoteFormProps = {}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReleaseNoteFormValues>({
    defaultValues: initialData
      ? {
          ...initialData,
          release_date: initialData.release_date || format(new Date(), 'yyyy-MM-dd'),
        }
      : {
          version: '',
          title: '',
          description: '',
          is_major: false,
          release_date: format(new Date(), 'yyyy-MM-dd'),
        },
  });

  const handleSubmit = async (values: ReleaseNoteFormValues) => {
    setLoading(true);
    try {
      // Format date if needed
      const formattedValues = {
        ...values,
        release_date: values.release_date instanceof Date
          ? format(values.release_date, 'yyyy-MM-dd')
          : values.release_date,
      };

      let response;
      if (initialData?.id) {
        // Update existing record
        response = await supabase
          .from('release_notes')
          .update(formattedValues)
          .eq('id', initialData.id);
      } else {
        // Create new record
        response = await supabase
          .from('release_notes')
          .insert(formattedValues);
      }

      if (response.error) throw response.error;

      toast({
        title: initialData ? 'Release note updated' : 'Release note created',
        description: initialData
          ? 'The release note has been updated successfully.'
          : 'The release note has been created successfully.',
      });

      if (onSuccess) onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error saving release note:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save release note. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
};
