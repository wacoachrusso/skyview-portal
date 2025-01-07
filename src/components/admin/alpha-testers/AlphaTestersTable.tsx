import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AlphaTestersTableProps {
  testers: any[];
  refetch: () => void;
}

export const AlphaTestersTable = ({ testers, refetch }: AlphaTestersTableProps) => {
  const { toast } = useToast();

  const togglePromoterStatus = async (testerId: string, currentStatus: boolean) => {
    try {
      console.log("Toggling promoter status:", { testerId, currentStatus });
      const { error } = await supabase
        .from("alpha_testers")
        .update({ is_promoter: !currentStatus })
        .eq("id", testerId);

      if (error) throw error;

      const tester = testers.find(t => t.id === testerId);
      if (tester) {
        console.log("Sending promoter status change email");
        const { error: emailError } = await supabase.functions.invoke("send-alpha-status-email", {
          body: { 
            email: tester.email,
            fullName: tester.full_name,
            status: tester.status,
            isPromoterChange: true,
            becamePromoter: !currentStatus
          },
        });

        if (emailError) {
          console.error("Error sending promoter status change email:", emailError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Status updated but failed to send notification email",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: `Tester ${currentStatus ? "removed from" : "marked as"} promoter`,
      });

      refetch();
    } catch (error) {
      console.error("Error toggling promoter status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update promoter status",
      });
    }
  };

  const updateStatus = async (testerId: string, newStatus: "active" | "inactive" | "removed") => {
    try {
      console.log("Updating tester status:", { testerId, newStatus });
      const { error } = await supabase
        .from("alpha_testers")
        .update({ status: newStatus })
        .eq("id", testerId);

      if (error) throw error;

      const tester = testers.find(t => t.id === testerId);
      if (tester) {
        console.log("Sending status update email");
        const { error: emailError } = await supabase.functions.invoke("send-alpha-status-email", {
          body: { 
            email: tester.email,
            fullName: tester.full_name,
            status: newStatus,
            isPromoterChange: tester.is_promoter
          },
        });

        if (emailError) {
          console.error("Error sending status update email:", emailError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Status updated but failed to send notification email",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Tester status updated successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error updating tester status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update tester status",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Feedback Count</TableHead>
            <TableHead>Last Feedback</TableHead>
            <TableHead className="whitespace-nowrap">Promoter Status</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testers?.map((tester) => (
            <TableRow key={tester.id}>
              <TableCell>{tester.full_name || "N/A"}</TableCell>
              <TableCell>{tester.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    tester.status === "active"
                      ? "default"
                      : tester.status === "inactive"
                      ? "secondary"
                      : "destructive"
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    const newStatus =
                      tester.status === "active"
                        ? "inactive"
                        : tester.status === "inactive"
                        ? "removed"
                        : "active";
                    updateStatus(tester.id, newStatus);
                  }}
                >
                  {tester.status}
                </Badge>
              </TableCell>
              <TableCell>{tester.feedback_count || 0}</TableCell>
              <TableCell>
                {tester.last_feedback_at
                  ? format(new Date(tester.last_feedback_at), "MMM d, yyyy")
                  : "Never"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tester.is_promoter}
                    onCheckedChange={() =>
                      togglePromoterStatus(tester.id, tester.is_promoter)
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {tester.is_promoter ? "Promoter" : "Tester"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(tester.created_at), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};