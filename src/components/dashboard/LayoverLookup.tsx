
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Coffee, Palmtree, MapPin, Building, Pizza, Users } from "lucide-react";

// Mock data for demonstration purposes
const mockLayoverData = {
  "JFK": {
    restaurants: [
      { name: "Shake Shack", description: "Famous burgers and shakes", rating: 4.5 },
      { name: "Uptown Brasserie", description: "Upscale American cuisine", rating: 4.2 },
      { name: "Deep Blue Sushi", description: "Fresh sushi and Japanese fare", rating: 4.3 }
    ],
    attractions: [
      { name: "TWA Hotel", description: "Retro-styled hotel with observation deck", rating: 4.4 },
      { name: "JetBlue T5 Rooftop", description: "Outdoor lounging area with views", rating: 4.1 },
      { name: "Art & Exhibition Space", description: "Rotating art installations", rating: 3.9 }
    ],
    spots: [
      { name: "AirTrain to Jamaica", description: "Quick access to NYC subway", rating: 4.0 },
      { name: "Idlewild Books", description: "International bookstore", rating: 4.2 },
      { name: "XpresSpa", description: "In-terminal massage and spa services", rating: 3.8 }
    ]
  },
  "LAX": {
    restaurants: [
      { name: "Cassell's Hamburgers", description: "Classic burgers since 1948", rating: 4.4 },
      { name: "Border Grill", description: "Modern Mexican cuisine", rating: 4.3 },
      { name: "Urth Caffé", description: "Organic coffee and pastries", rating: 4.6 }
    ],
    attractions: [
      { name: "Observation Deck", description: "Views of aircraft and city", rating: 4.2 },
      { name: "LAX Theme Building", description: "Iconic space-age landmark", rating: 4.1 },
      { name: "Flight Path Museum", description: "Aviation history exhibits", rating: 4.0 }
    ],
    spots: [
      { name: "In-N-Out Burger", description: "Watch planes land while dining", rating: 4.7 },
      { name: "Manhattan Beach", description: "Quick Uber ride to the beach", rating: 4.5 },
      { name: "The Proud Bird", description: "Food bazaar with aircraft display", rating: 4.3 }
    ]
  },
  "ORD": {
    restaurants: [
      { name: "Tortas Frontera", description: "Rick Bayless Mexican sandwiches", rating: 4.7 },
      { name: "Publican Tavern", description: "Farm-to-table cuisine", rating: 4.4 },
      { name: "Summer House", description: "California-inspired menu", rating: 4.3 }
    ],
    attractions: [
      { name: "Yoga Room", description: "Free yoga space in Terminal 3", rating: 4.0 },
      { name: "Terminal 5 Art Gallery", description: "Rotating art exhibits", rating: 3.9 },
      { name: "Aeroponic Garden", description: "Vertical garden with tours", rating: 4.2 }
    ],
    spots: [
      { name: "Blue Line to Downtown", description: "Direct train to Chicago", rating: 4.1 },
      { name: "Fashion Outlets of Chicago", description: "Nearby luxury shopping", rating: 4.3 },
      { name: "Rosemont Entertainment District", description: "Dining and entertainment", rating: 4.0 }
    ]
  },
  "DEN": {
    restaurants: [
      { name: "Root Down DIA", description: "Farm-to-table with local ingredients", rating: 4.8 },
      { name: "Modern Market", description: "Fresh, healthy fare with local beers", rating: 4.5 },
      { name: "Denver Central Market", description: "Food hall with multiple options", rating: 4.6 }
    ],
    attractions: [
      { name: "Denver Art Museum", description: "World-class art collection downtown", rating: 4.7 },
      { name: "Red Rocks Park", description: "Famous amphitheater and hiking trails", rating: 4.9 }
    ],
    crewTips: [
      { name: "Union Station Layover", description: "Take the A-Line train to historic Union Station for dining and relaxation", rating: 4.8 }
    ]
  }
};

export const LayoverLookup = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Show Denver results by default
  useEffect(() => {
    setSearchResults(mockLayoverData["DEN"]);
    setSearchQuery("DEN");
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    setError("");
    
    // Simulating API call with timeout
    setTimeout(() => {
      const query = searchQuery.trim().toUpperCase();
      
      if (mockLayoverData[query as keyof typeof mockLayoverData]) {
        setSearchResults(mockLayoverData[query as keyof typeof mockLayoverData]);
      } else {
        setError("No information found for this airport. Try JFK, LAX, ORD, or DEN.");
      }
      
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getIconForCategory = (category: string) => {
    switch(category) {
      case 'restaurants':
        return <Pizza className="h-5 w-5 text-brand-orange" />;
      case 'attractions':
        return <Palmtree className="h-5 w-5 text-brand-emerald" />;
      case 'spots':
        return <MapPin className="h-5 w-5 text-brand-purple" />;
      case 'crewTips':
        return <Users className="h-5 w-5 text-brand-blue" />;
      default:
        return <Building className="h-5 w-5 text-brand-navy" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-brand-purple/10">
        <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-magenta/10 pb-8">
          <CardTitle className="flex items-center text-2xl">
            <Coffee className="mr-2 h-6 w-6 text-brand-purple" />
            Layover Lookup
          </CardTitle>
          <div className="mt-4 flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Where's your layover? (Try DEN, JFK, LAX, ORD)"
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
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
              <p>{error}</p>
            </div>
          )}

          {searchResults && (
            <div className="space-y-6">
              {Object.entries(searchResults).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="flex items-center text-lg font-semibold capitalize">
                    {getIconForCategory(category)}
                    <span className="ml-2">
                      {category === 'crewTips' ? 'Crew Tips' : category}
                    </span>
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(items as any[]).map((item, index) => (
                      <Card 
                        key={index} 
                        className="border-brand-slate/10 transition-all duration-200 hover:shadow-md cursor-pointer"
                        onClick={() => console.log(`Clicked on ${item.name}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-base font-medium">{item.name}</h4>
                              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <div className="flex items-center rounded-full bg-brand-purple/10 px-2 py-1 text-xs font-medium text-brand-purple">
                              {item.rating}★
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchResults && !error && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-medium">Find your layover hotspots</h3>
                <p className="mt-1">Enter airport code (like DEN, JFK, LAX, ORD) to discover nearby restaurants, attractions, and spots to visit.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
