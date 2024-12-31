import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ContractUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const userId = user.id;

      // Create a unique file name
      const fileName = `${userId}/${Date.now()}-${file.name}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Record the upload in the database with user_id
      const { error: dbError } = await supabase
        .from('contract_uploads')
        .insert({
          file_name: file.name,
          file_path: fileName,
          user_id: userId
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Contract uploaded successfully",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your contract",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#1A1F2C] to-[#2A2F3C] border-b border-white/10 p-2 sm:p-3">
      <div className="max-w-screen-xl mx-auto flex justify-center items-center">
        <label htmlFor="contract-upload">
          <input
            id="contract-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            disabled={isUploading}
            onClick={() => document.getElementById('contract-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Upload Contract</span>
            <span className="sm:hidden">Upload</span>
            {isUploading && <span className="ml-2">...</span>}
          </Button>
        </label>
      </div>
    </div>
  );
}