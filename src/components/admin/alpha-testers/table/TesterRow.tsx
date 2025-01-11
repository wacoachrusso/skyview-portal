import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { AlphaTester } from "../types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TesterRowProps {
  tester: AlphaTester;
  onStatusChange: (testerId: string, newStatus: "active" | "inactive" | "removed") => void;
  onPromoterToggle: (testerId: string, currentStatus: boolean) => void;
  onDelete: () => void;
}

export const TesterRow = ({ tester, onStatusChange, onPromoterToggle, onDelete }: TesterRowProps) => {
  return (
    <TableRow key={tester.id}>
      <TableCell>{tester.full_name || "N/A"}</TableCell>
      <TableCell>{tester.email}</TableCell>
      <TableCell>{tester.profiles?.user_type || "N/A"}</TableCell>
      <TableCell>{tester.profiles?.airline || "N/A"}</TableCell>
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
            onStatusChange(tester.id, newStatus);
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
              onPromoterToggle(tester.id, tester.is_promoter)
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
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};