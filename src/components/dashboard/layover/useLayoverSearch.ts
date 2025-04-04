
import { useState, useEffect } from "react";
import { mockLayoverData, cityToAirportCode } from "./LocationData";
import type { LocationData } from "./LocationData";

export const useLayoverSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentAirport, setCurrentAirport] = useState("");

  useEffect(() => {
    setSearchResults(mockLayoverData["DEN"]);
    setSearchQuery("DEN");
    setCurrentAirport("DEN");
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    setError("");
    
    setTimeout(() => {
      let query = searchQuery.trim();
      
      if (query.length !== 3 || !query.match(/^[A-Za-z]{3}$/)) {
        const normalizedQuery = query.toLowerCase();
        
        if (cityToAirportCode[normalizedQuery]) {
          query = cityToAirportCode[normalizedQuery];
        } else {
          const cityMatch = Object.keys(cityToAirportCode).find(city => 
            city.includes(normalizedQuery)
          );
          
          if (cityMatch) {
            query = cityToAirportCode[cityMatch];
          }
        }
      }
      
      query = query.toUpperCase();
      
      if (mockLayoverData[query as keyof typeof mockLayoverData]) {
        setSearchResults(mockLayoverData[query as keyof typeof mockLayoverData]);
        setCurrentAirport(query);
      } else {
        setError("No information found for this location. Try JFK (New York), LAX (Los Angeles), ORD (Chicago), or DEN (Denver).");
      }
      
      setIsLoading(false);
    }, 800);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    currentAirport,
    handleSearch
  };
};
