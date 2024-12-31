import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function ContractUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only allow PDF files
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const userId = session.user.id;
      const fileName = `${userId}/${file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Record the upload in the database
      const { error: dbError } = await supabase
        .from('contract_uploads')
        .insert({
          file_name: file.name,
          file_path: fileName,
        });

      if (dbError) throw dbError;

      toast({
        title: "Contract uploaded",
        description: "Your contract has been uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="relative">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <Button 
          variant="ghost" 
          className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Contract
        </Button>
      </div>
    </div>
  );
}