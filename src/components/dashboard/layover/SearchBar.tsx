
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
}

export const SearchBar = ({ searchQuery, setSearchQuery, handleSearch, isLoading }: SearchBarProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mt-4 flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Where's your layover? (City name or airport code)"
          className="pr-10 shadow-sm focus:border-brand-purple"
        />
      </div>
      <Button 
        onClick={handleSearch}
        disabled={isLoading || !searchQuery.trim()}
        className="bg-brand-purple hover:bg-brand-purple/90"
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="ml-2">Search</span>
      </Button>
    </div>
  );
};
