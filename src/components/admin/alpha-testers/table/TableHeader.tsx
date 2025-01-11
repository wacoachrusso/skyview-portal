import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";

export const TableHeader = () => {
  return (
    <UITableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Job Title</TableHead>
        <TableHead>Airline</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Feedback Count</TableHead>
        <TableHead>Last Feedback</TableHead>
        <TableHead className="whitespace-nowrap">Promoter Status</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </UITableHeader>
  );
};