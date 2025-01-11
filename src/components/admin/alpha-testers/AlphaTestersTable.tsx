import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { TableHeader } from "./table/TableHeader";
import { TesterRow } from "./table/TesterRow";
import { useTesterActions } from "./hooks/useTesterActions";
import { AlphaTester } from "./types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface AlphaTestersTableProps {
  testers: AlphaTester[];
  refetch: () => void;
}

export const AlphaTestersTable = ({ testers, refetch }: AlphaTestersTableProps) => {
  const [testerToDelete, setTesterToDelete] = useState<AlphaTester | null>(null);
  const { togglePromoterStatus, updateStatus, deleteTester, isDeleting } = useTesterActions(testers, refetch);

  return (
    <>
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
                onDelete={() => setTesterToDelete(tester)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!testerToDelete} onOpenChange={(open) => !open && setTesterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete the tester's
                account and remove their data from our servers.
              </p>
              <div className="mt-4 rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Tester Details:
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Name: {testerToDelete?.full_name}</p>
                      <p>Email: {testerToDelete?.email}</p>
                      <p>Status: {testerToDelete?.status}</p>
                      <p>Role: {testerToDelete?.is_promoter ? 'Promoter' : 'Tester'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => testerToDelete && deleteTester(testerToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner /> Deleting...
                </div>
              ) : (
                "Delete Tester"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};