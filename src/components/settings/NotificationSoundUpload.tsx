import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

export function NotificationSoundUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Audio file must be less than 1MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      
      // Upload to Supabase Storage
      const fileName = `notification-sound-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('audio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      // Update the service worker's notification sound URL
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.active?.postMessage({
          type: 'UPDATE_NOTIFICATION_SOUND',
          soundUrl: publicUrl,
        });
      }

      toast({
        title: "Success",
        description: "Notification sound updated successfully",
      });

    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload notification sound",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-foreground">Notification Sound</label>
          <p className="text-sm text-muted-foreground">
            Upload a custom notification sound (MP3, WAV, max 1MB)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => document.getElementById('audio-upload')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      <input
        id="audio-upload"
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}