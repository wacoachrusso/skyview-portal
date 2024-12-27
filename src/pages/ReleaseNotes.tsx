import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText, Calendar, Info, Rocket } from "lucide-react";

const ReleaseNotes = () => {
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
        <div className="flex items-center space-x-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Release Notes</h1>
        </div>

        <div className="space-y-8">
          {releaseNotes?.map((note) => (
            <div
              key={note.id}
              className="bg-card rounded-lg shadow-lg p-6 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {note.is_major ? (
                    <Rocket className="h-5 w-5 text-brand-gold" />
                  ) : (
                    <Info className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {note.title}
                    </h2>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
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
              <div className="mt-4 text-foreground whitespace-pre-wrap">
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