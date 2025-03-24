
import { Quote, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface MessageContentProps {
  message: {
    content: string;
    role: string;
  };
  isCurrentUser: boolean;
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const [displayContent, setDisplayContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [renderError, setRenderError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Set the entire message content immediately - no incremental typing effect
      setDisplayContent(message.content || "");
      setIsComplete(true);
    } catch (error) {
      console.error("Error rendering message content:", error);
      setRenderError(error as Error);
    }
  }, [message.content]);

  const formatContent = (content: string) => {
    if (!content) return null;
    
    try {
      // Check if the content contains an HTML table
      const hasTable = content.includes('<table>') && content.includes('</table>');
      
      // Split content by reference markers (🔹 Reference:) and table markers
      const parts = hasTable 
        ? content.split(/(<table>.*?<\/table>)|(🔹 Reference:.*?)(?=\n|$)/gs)
        : content.split(/(🔹 Reference:.*?)(?=\n|$)/g);
      
      return parts.filter(Boolean).map((part, index) => {
        if (!part) return null;
        
        // Only style the specific reference blocks
        if (part.startsWith('🔹 Reference:')) {
          // Style the reference block
          return (
            <div key={index} className="flex items-start gap-2 my-3 p-3 text-blue-300 bg-blue-950/30 rounded-md border-l-4 border-blue-500/50 font-medium">
              <Quote className="h-4 w-4 mt-1 flex-shrink-0" />
              <div className="flex-1">{part}</div>
            </div>
          );
        } else if (part.includes('No specific contract reference')) {
          // Handle the "no reference found" message
          return (
            <div key={index} className="flex items-start gap-2 my-3 p-3 text-amber-300 bg-amber-950/20 rounded-md border-l-4 border-amber-500/50 italic">
              <Quote className="h-4 w-4 mt-1 flex-shrink-0" />
              <em>{part}</em>
            </div>
          );
        } else if (part.startsWith('<table>') && part.includes('</table>')) {
          // Parse and render HTML table
          return renderTable(part, index);
        }
        // Regular text content - no special formatting
        return <span key={index}>{part}</span>;
      });
    } catch (error) {
      console.error("Error formatting content:", error);
      return <span className="text-red-400">Error rendering message. Please try refreshing the page.</span>;
    }
  };

  // Function to parse and render HTML tables
  const renderTable = (tableHtml: string, key: number) => {
    try {
      // Extract rows from the table HTML
      const rowsMatch = tableHtml.match(/<tr>(.*?)<\/tr>/gs);
      if (!rowsMatch) return <span key={key}>{tableHtml}</span>;
      
      const headerMatch = rowsMatch[0].match(/<th>(.*?)<\/th>/gs);
      const isHeaderRow = headerMatch && headerMatch.length > 0;
      
      const headers = isHeaderRow 
        ? rowsMatch[0].match(/<th>(.*?)<\/th>/gs)?.map(h => h.replace(/<\/?th>/g, '')) || []
        : [];
      
      const dataRows = isHeaderRow ? rowsMatch.slice(1) : rowsMatch;
      
      return (
        <div key={key} className="my-4 w-full overflow-x-auto">
          <Table className="border-collapse">
            {isHeaderRow && (
              <TableHeader>
                <TableRow>
                  {headers.map((header, i) => (
                    <TableHead key={i} className="text-white bg-brand-navy/80">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {dataRows.map((row, rowIndex) => {
                const cells = row.match(/<td>(.*?)<\/td>/gs)?.map(c => c.replace(/<\/?td>/g, '')) || [];
                return (
                  <TableRow key={rowIndex} className="even:bg-gray-50/5">
                    {cells.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    } catch (error) {
      console.error("Error rendering table:", error);
      return <span key={key} className="text-red-400">Error rendering table. {tableHtml}</span>;
    }
  };

  // Display error state if there was a rendering error
  if (renderError) {
    return (
      <div className="text-red-400 p-2 border border-red-400 rounded">
        Error displaying message. Please refresh the page and try again.
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words">
      {formatContent(displayContent)}
      {isComplete && message.role === "assistant" && (
        <div className="flex items-center text-xs text-gray-400 mt-2">
          <Check className="h-3 w-3 mr-1" />
          <span>Generated from contract</span>
        </div>
      )}
    </div>
  );
}
