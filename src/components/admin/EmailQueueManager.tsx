
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

export function EmailQueueManager() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_emails')
        .select('*')
        .order('scheduled_for', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error("Error fetching email queue:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load email queue."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const processEmailQueue = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('process-email-queue', {
        body: {}
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Email queue processing initiated."
      });
      
      // Refresh the list after a short delay
      setTimeout(fetchEmails, 2000);
    } catch (error) {
      console.error("Error processing email queue:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process email queue."
      });
    } finally {
      setProcessing(false);
    }
  };

  const retryEmail = async (id) => {
    try {
      // Reset the email status to pending
      const { error } = await supabase
        .from('scheduled_emails')
        .update({ 
          status: 'pending',
          retry_count: 0,
          error_message: null
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Email Reset",
        description: "Email has been reset and will be processed in the next queue run."
      });
      
      fetchEmails();
    } catch (error) {
      console.error("Error resetting email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset email."
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "outline",
      processing: "default",
      sent: "success",
      error: "destructive"
    };
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Email Queue Manager</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchEmails} 
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Button 
              onClick={processEmailQueue} 
              disabled={processing}
              size="sm"
              className="gap-1"
            >
              <Send className="h-4 w-4" />
              {processing ? "Processing..." : "Process Queue"}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Manage scheduled emails and process the email queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No emails in queue
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium">{email.email}</TableCell>
                    <TableCell>{email.email_type}</TableCell>
                    <TableCell>{getStatusBadge(email.status)}</TableCell>
                    <TableCell>
                      {email.scheduled_for ? (
                        <span title={format(new Date(email.scheduled_for), "PPpp")}>
                          {formatDistanceToNow(new Date(email.scheduled_for), { addSuffix: true })}
                        </span>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {email.updated_at ? (
                        <span title={format(new Date(email.updated_at), "PPpp")}>
                          {formatDistanceToNow(new Date(email.updated_at), { addSuffix: true })}
                        </span>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {email.status === 'error' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryEmail(email.id)}
                        >
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
