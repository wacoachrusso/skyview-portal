import { MetricType } from "./metrics/useMetricsData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface DialogContent {
  title: string;
  content: ReactNode;
}

export const getDialogContent = (
  metric: MetricType | null,
  onDelete: (id: string) => Promise<void>,
  isDeleting: boolean
): DialogContent => {
  const { data: feedbackData } = useQuery({
    queryKey: ["messageFeedback"],
    queryFn: async () => {
      console.log('Fetching message feedback data');
      const { data, error } = await supabase
        .from("message_feedback")
        .select(`
          *,
          messages:messages(content),
          profiles:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: metric === "messageFeedback"
  });

  switch (metric) {
    case "messageFeedback":
      return {
        title: "Message Feedback",
        content: (
          <div className="space-y-4">
            {feedbackData?.map((feedback) => (
              <div key={feedback.id} className="bg-secondary p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">
                      {feedback.profiles?.full_name || feedback.profiles?.email || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(feedback.created_at), 'PPp')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(feedback.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-background p-3 rounded text-sm">
                  <p className="font-medium">Message:</p>
                  <p className="text-muted-foreground">{feedback.messages?.content}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Feedback:</p>
                  <p className="text-sm text-muted-foreground">{feedback.feedback_text || 'No feedback text provided'}</p>
                </div>
                <div className="flex gap-2">
                  {feedback.rating && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Rating: {feedback.rating}/5
                    </span>
                  )}
                  {feedback.is_incorrect && (
                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                      Marked as Incorrect
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ),
      };
    case "alphaTesters":
      return {
        title: "Alpha Testers",
        content: <p>Alpha testers content goes here.</p>,
      };
    case "promoters":
      return {
        title: "Promoters",
        content: <p>Promoters content goes here.</p>,
      };
    case "users":
      return {
        title: "Total Users",
        content: <p>Total users content goes here.</p>,
      };
    case "activeUsers":
      return {
        title: "Active Users (30d)",
        content: <p>Active users content goes here.</p>,
      };
    case "notifications":
      return {
        title: "Notifications Sent",
        content: <p>Notifications content goes here.</p>,
      };
    case "releaseNotes":
      return {
        title: "Release Notes",
        content: <p>Release notes content goes here.</p>,
      };
    case "newUsers":
      return {
        title: "New Users (30d)",
        content: <p>New users content goes here.</p>,
      };
    case "monthlySubUsers":
      return {
        title: "Monthly Subscribers",
        content: <p>Monthly subscribers content goes here.</p>,
      };
    case "yearlySubUsers":
      return {
        title: "Yearly Subscribers",
        content: <p>Yearly subscribers content goes here.</p>,
      };
  }

  return {
    title: "Statistics",
    content: <p>Select a metric to view details</p>,
  };
};