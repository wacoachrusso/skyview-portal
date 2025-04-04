
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee } from "lucide-react";
import { motion } from "framer-motion";

// Import all the components
import { SearchBar } from "./layover/SearchBar";
import { ResultsView } from "./layover/ResultsView";
import { EmptyState } from "./layover/EmptyState";
import { ErrorMessage } from "./layover/ErrorMessage";
import { TipForm } from "./layover/TipForm";
import { useLayoverSearch } from "./layover/useLayoverSearch";

export const LayoverLookup = () => {
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    isLoading, 
    error, 
    currentAirport, 
    handleSearch 
  } = useLayoverSearch();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto" // Added max-width constraint
    >
      <Card className="overflow-hidden border-brand-purple/10">
        <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-magenta/10 py-4"> {/* Reduced padding */}
          <CardTitle className="flex items-center text-xl"> {/* Reduced text size */}
            <Coffee className="mr-2 h-5 w-5 text-brand-purple" /> {/* Smaller icon */}
            Layover Lookup
          </CardTitle>
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isLoading={isLoading}
          />
        </CardHeader>

        <CardContent className="p-4"> {/* Reduced padding */}
          {error && <ErrorMessage message={error} />}

          {searchResults && (
            <ResultsView 
              data={searchResults}
              onOpenTipForm={() => setTipModalOpen(true)}
            />
          )}

          {!searchResults && !error && <EmptyState />}
        </CardContent>
      </Card>

      <TipForm 
        open={tipModalOpen} 
        onOpenChange={setTipModalOpen} 
        airportCode={currentAirport} 
      />
    </motion.div>
  );
};
