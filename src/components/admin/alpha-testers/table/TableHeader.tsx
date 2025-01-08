import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";

export const TableHeader = () => {
  return (
    <UITableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Feedback Count</TableHead>
        <TableHead>Last Feedback</TableHead>
        <TableHead className="whitespace-nowrap">Promoter Status</TableHead>
        <TableHead>Created At</TableHead>
      </TableRow>
    </UITableHeader>
  );
};