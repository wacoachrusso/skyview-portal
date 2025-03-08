
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define the form schema
const formSchema = z.object({
  version: z.string().min(1, "Version is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_major: z.boolean().default(false),
  release_date: z.date().nullable().default(null),
});

export const useReleaseNoteForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: "",
      title: "",
      description: "",
      is_major: false,
      release_date: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submission started with values:", values);
    setIsLoading(true);
    
    try {
      // Format the release date
      const formattedValues = {
        ...values,
        release_date: values.release_date ? values.release_date.toISOString() : new Date().toISOString(),
      };
      
      console.log("Creating new release note with values:", JSON.stringify(formattedValues));
      
      const { data, error } = await supabase
        .from("release_notes")
        .insert([formattedValues])
        .select();
        
      if (error) {
        console.error("Insert error details:", error);
        throw error;
      }
      
      console.log("Note created successfully:", data);
      toast({
        title: "Success",
        description: "Release note created successfully",
      });
      
      // Reset form after successful submission
      form.reset();
      
    } catch (error) {
      console.error("Error saving release note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save release note: " + (error instanceof Error ? error.message : String(error)),
      });
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
  };
};
