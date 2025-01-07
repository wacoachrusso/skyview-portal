import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AlphaTestersTable } from "./alpha-testers/AlphaTestersTable";
import { NewTesterDialog } from "./alpha-testers/NewTesterDialog";
import { supabase } from "@/integrations/supabase/client";

export const AlphaTesters = () => {
  const [isNewTesterDialogOpen, setIsNewTesterDialogOpen] = useState(false);

  const { data: testers, refetch } = useQuery({
    queryKey: ["alpha-testers"],
    queryFn: async () => {
      console.log("Fetching alpha testers...");
      const { data, error } = await supabase
        .from("alpha_testers")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching alpha testers:", error);
        throw error;
      }

      console.log("Fetched alpha testers:", data);
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alpha Testers</h2>
        <Button onClick={() => setIsNewTesterDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tester
        </Button>
      </div>

      <AlphaTestersTable testers={testers} refetch={refetch} />

      <NewTesterDialog
        open={isNewTesterDialogOpen}
        onOpenChange={setIsNewTesterDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
};