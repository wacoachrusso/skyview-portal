
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, Mail, PlayCircle } from "lucide-react";

export function EmailQueueManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingEmails, setProcessingEmails] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    loadEmails();
  }, [activeTab]);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_emails")
        .select("*")
        .eq("status", activeTab)
        .order("scheduled_for", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setEmails(data || []);
    } catch (error) {
      console.error("Error loading emails:", error);
      toast({
        title: "Error",
        description: "Failed to load email queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    setProcessingEmails(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-email-queue");

      if (error) {
        throw error;
      }

      toast({
        title: "Queue Processed",
        description: `Successfully processed ${data?.results?.length || 0} emails`,
      });
      
      // Refresh the email list
      loadEmails();
    } catch (error) {
      console.error("Error processing email queue:", error);
      toast({
        title: "Error",
        description: "Failed to process email queue",
        variant: "destructive",
      });
    } finally {
      setProcessingEmails(false);
    }
  };

  const retryEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_emails")
        .update({ status: "pending" })
        .eq("id", emailId);

      if (error) {
        throw error;
      }

      toast({
        title: "Email Queued",
        description: "Email has been queued for retry",
      });
      
      // Refresh the email list
      loadEmails();
    } catch (error) {
      console.error("Error retrying email:", error);
      toast({
        title: "Error",
        description: "Failed to retry email",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "sent":
        return <Badge className="bg-green-500">Sent</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Email Queue Manager</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEmails} 
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={processQueue} 
              disabled={processingEmails}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Process Queue
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Manage and monitor scheduled email deliveries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="text-center py-8">Loading emails...</div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab} emails found
              </div>
            ) : (
              <div className="space-y-4">
                {emails.map((email) => (
                  <div 
                    key={email.id} 
                    className="border rounded-md p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {email.email_type.charAt(0).toUpperCase() + email.email_type.slice(1)} Email
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          To: {email.name ? `${email.name} (${email.email})` : email.email}
                        </p>
                      </div>
                      {getStatusBadge(email.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Scheduled for:</span>{" "}
                        {formatDate(email.scheduled_for)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        {formatDate(email.created_at)}
                      </div>
                      {email.processed_at && (
                        <div>
                          <span className="text-muted-foreground">Processed:</span>{" "}
                          {formatDate(email.processed_at)}
                        </div>
                      )}
                    </div>
                    
                    {email.status === "failed" && (
                      <div className="mt-3">
                        <div className="text-sm text-red-500 mb-2">
                          Error: {email.metadata?.error || "Unknown error"}
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => retryEmail(email.id)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
