
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Search, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type WaitlistEntry = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  airline: string;
  base: string;
  preferred_contact: string;
  created_at: string;
};

export function WaitlistTable() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch waitlist entries
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("waitlist_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      setFilteredEntries(data || []);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      toast({
        title: "Error",
        description: "Failed to load waitlist entries.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Filter entries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = entries.filter(
      (entry) =>
        entry.full_name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.role.toLowerCase().includes(query) ||
        entry.airline.toLowerCase().includes(query) ||
        entry.base.toLowerCase().includes(query)
    );
    setFilteredEntries(filtered);
  }, [searchQuery, entries]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Export waitlist as CSV
  const exportToCsv = () => {
    const headers = [
      "Full Name",
      "Email",
      "Role",
      "Airline",
      "Base",
      "Preferred Contact",
      "Signed Up",
    ];

    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(","));
    
    // Add data rows
    for (const entry of entries) {
      const values = [
        `"${entry.full_name.replace(/"/g, '""')}"`,
        `"${entry.email.replace(/"/g, '""')}"`,
        `"${entry.role.replace(/"/g, '""')}"`,
        `"${entry.airline.replace(/"/g, '""')}"`,
        `"${entry.base?.replace(/"/g, '""') || ""}"`,
        `"${entry.preferred_contact?.replace(/"/g, '""') || ""}"`,
        `"${formatDate(entry.created_at)}"`,
      ];
      csvRows.push(values.join(","));
    }
    
    // Create and download the CSV file
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `skyguide-waitlist-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Waitlist Signups</CardTitle>
            <CardDescription>
              View and manage pre-launch waitlist signups
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEntries}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportToCsv}
              disabled={isLoading || entries.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search waitlist entries..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {entries.length === 0
              ? "No waitlist entries found."
              : "No entries match your search."}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>Contact Preference</TableHead>
                  <TableHead>Signup Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.full_name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.role}</TableCell>
                    <TableCell>{entry.airline}</TableCell>
                    <TableCell>{entry.base || "-"}</TableCell>
                    <TableCell>{entry.preferred_contact || "-"}</TableCell>
                    <TableCell>{formatDate(entry.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      </CardContent>
    </Card>
  );
}
