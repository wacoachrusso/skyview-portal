import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText, Calendar, Info, Rocket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const ReleaseNotes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: releaseNotes, isLoading } = useQuery({
    queryKey: ["releaseNotes"],
    queryFn: async () => {
      console.log("Fetching release notes...");
      const { data, error } = await supabase
        .from("release_notes")
        .select("*")
        .order("release_date", { ascending: false });

      if (error) {
        console.error("Error fetching release notes:", error);
        throw error;
      }
      
      console.log("Fetched release notes:", data);
      return data;
    },
  });

  const markNotificationsAsRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Marking notifications as read");
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error("Error marking notifications as read:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
    onError: (error) => {
      console.error("Failed to mark notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification status",
      });
    },
  });

  useEffect(() => {
    markNotificationsAsRead.mutate();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Release Notes</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <div className="space-y-8">
          {releaseNotes?.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-card rounded-lg shadow-lg p-6 card-hover border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {note.is_major ? (
                    <Rocket className="h-5 w-5 text-brand-gold" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {note.title}
                    </h2>
                    <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {format(new Date(note.release_date), "MMMM d, yyyy")}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="font-mono">v{note.version}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                {note.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotes;