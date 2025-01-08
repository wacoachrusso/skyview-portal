import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { TableHeader } from "./table/TableHeader";
import { TesterRow } from "./table/TesterRow";
import { useTesterActions } from "./hooks/useTesterActions";
import { AlphaTester } from "./types";

interface AlphaTestersTableProps {
  testers: AlphaTester[];
  refetch: () => void;
}

export const AlphaTestersTable = ({ testers, refetch }: AlphaTestersTableProps) => {
  const { togglePromoterStatus, updateStatus } = useTesterActions(testers, refetch);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader />
        <TableBody>
          {testers?.map((tester) => (
            <TesterRow
              key={tester.id}
              tester={tester}
              onStatusChange={updateStatus}
              onPromoterToggle={togglePromoterStatus}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};