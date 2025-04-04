import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Coffee, Palmtree, MapPin, Building, Pizza, Users, Bed, Share2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const mockLayoverData = {
  "JFK": {
    name: "New York (JFK)",
    foodAndCoffee: [
      { name: "Shake Shack", description: "Famous burgers and shakes", rating: 4.5 },
      { name: "Uptown Brasserie", description: "Upscale American cuisine", rating: 4.2 },
      { name: "Deep Blue Sushi", description: "Fresh sushi and Japanese fare", rating: 4.3 }
    ],
    thingsToDo: [
      { name: "TWA Hotel", description: "Retro-styled hotel with observation deck", rating: 4.4 },
      { name: "JetBlue T5 Rooftop", description: "Outdoor lounging area with views", rating: 4.1 },
      { name: "Art & Exhibition Space", description: "Rotating art installations", rating: 3.9 }
    ],
    crewTips: [
      { name: "AirTrain to Jamaica", description: "Quick access to NYC subway", rating: 4.0 },
      { name: "Idlewild Books", description: "International bookstore", rating: 4.2 }
    ],
    restAndRecovery: [
      { name: "XpresSpa", description: "In-terminal massage and spa services", rating: 3.8 },
      { name: "Quiet Zone", description: "Secluded area for relaxation", rating: 3.7 }
    ]
  },
  "LAX": {
    name: "Los Angeles (LAX)",
    foodAndCoffee: [
      { name: "Cassell's Hamburgers", description: "Classic burgers since 1948", rating: 4.4 },
      { name: "Border Grill", description: "Modern Mexican cuisine", rating: 4.3 },
      { name: "Urth Caffé", description: "Organic coffee and pastries", rating: 4.6 }
    ],
    thingsToDo: [
      { name: "Observation Deck", description: "Views of aircraft and city", rating: 4.2 },
      { name: "LAX Theme Building", description: "Iconic space-age landmark", rating: 4.1 },
      { name: "Flight Path Museum", description: "Aviation history exhibits", rating: 4.0 }
    ],
    crewTips: [
      { name: "In-N-Out Burger", description: "Watch planes land while dining", rating: 4.7 },
      { name: "Manhattan Beach", description: "Quick Uber ride to the beach", rating: 4.5 }
    ],
    restAndRecovery: [
      { name: "Be Relax Spa", description: "Terminal spa with massage chairs", rating: 4.0 },
      { name: "Meditation Room", description: "Quiet space for mindfulness", rating: 3.9 }
    ]
  },
  "ORD": {
    name: "Chicago (ORD)",
    foodAndCoffee: [
      { name: "Tortas Frontera", description: "Rick Bayless Mexican sandwiches", rating: 4.7 },
      { name: "Publican Tavern", description: "Farm-to-table cuisine", rating: 4.4 },
      { name: "Summer House", description: "California-inspired menu", rating: 4.3 }
    ],
    thingsToDo: [
      { name: "Terminal 5 Art Gallery", description: "Rotating art exhibits", rating: 3.9 },
      { name: "Aeroponic Garden", description: "Vertical garden with tours", rating: 4.2 }
    ],
    crewTips: [
      { name: "Blue Line to Downtown", description: "Direct train to Chicago", rating: 4.1 },
      { name: "Fashion Outlets of Chicago", description: "Nearby luxury shopping", rating: 4.3 }
    ],
    restAndRecovery: [
      { name: "Yoga Room", description: "Free yoga space in Terminal 3", rating: 4.0 },
      { name: "XpresSpa", description: "Full service spa with massages", rating: 3.8 }
    ]
  },
  "DEN": {
    name: "Denver (DEN)",
    foodAndCoffee: [
      { name: "Root Down DIA", description: "Farm-to-table with local ingredients", rating: 4.8 },
      { name: "Modern Market", description: "Fresh, healthy fare with local beers", rating: 4.5 },
      { name: "Denver Central Market", description: "Food hall with multiple options", rating: 4.6 }
    ],
    thingsToDo: [
      { name: "Denver Art Museum", description: "World-class art collection downtown", rating: 4.7 },
      { name: "Red Rocks Park", description: "Famous amphitheater and hiking trails", rating: 4.9 }
    ],
    crewTips: [
      { name: "Union Station Layover", description: "Take the A-Line train to historic Union Station for dining and relaxation", rating: 4.8 },
      { name: "Cherry Creek Shopping", description: "Upscale shopping district accessible by light rail", rating: 4.5 }
    ],
    restAndRecovery: [
      { name: "Elway's Restaurant", description: "Quiet corner booths for relaxation", rating: 4.3 },
      { name: "Massage Therapy", description: "On-site chair massages in Concourse B", rating: 4.1 }
    ]
  }
};

const cityToAirportCode: Record<string, string> = {
  "new york": "JFK",
  "nyc": "JFK",
  "los angeles": "LAX",
  "la": "LAX",
  "chicago": "ORD",
  "denver": "DEN"
};

interface TipFormValues {
  category: string;
  name: string;
  description: string;
  location: string;
}

export const LayoverLookup = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>(["foodAndCoffee", "thingsToDo", "crewTips", "restAndRecovery"]);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [currentAirport, setCurrentAirport] = useState("");
  const { toast } = useToast();

  const form = useForm<TipFormValues>({
    defaultValues: {
      category: "foodAndCoffee",
      name: "",
      description: "",
      location: ""
    }
  });

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleCategory = (category: string) => {
    if (openCategories.includes(category)) {
      setOpenCategories(openCategories.filter(c => c !== category));
    } else {
      setOpenCategories([...openCategories, category]);
    }
  };

  const getIconForCategory = (category: string) => {
    switch(category) {
      case 'foodAndCoffee':
        return <Pizza className="h-5 w-5 text-brand-orange" />;
      case 'thingsToDo':
        return <Palmtree className="h-5 w-5 text-brand-emerald" />;
      case 'crewTips':
        return <Users className="h-5 w-5 text-brand-blue" />;
      case 'restAndRecovery':
        return <Bed className="h-5 w-5 text-brand-purple" />;
      default:
        return <Building className="h-5 w-5 text-brand-navy" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch(category) {
      case 'foodAndCoffee':
        return 'Food & Coffee';
      case 'thingsToDo':
        return 'Things to Do';
      case 'crewTips':
        return 'Crew Tips';
      case 'restAndRecovery':
        return 'Rest & Recovery';
      default:
        return category;
    }
  };

  const onSubmitTip = (data: TipFormValues) => {
    console.log('Tip submitted:', {
      airport: currentAirport,
      ...data
    });

    toast({
      title: "Tip submitted successfully!",
      description: "Thank you for sharing your recommendation with fellow crew members.",
    });

    setTipModalOpen(false);
    form.reset();
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
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
              <p>{error}</p>
            </div>
          )}

          {searchResults && (
            <div className="space-y-6">
              {searchResults.name && (
                <h2 className="text-xl font-semibold text-brand-navy">{searchResults.name}</h2>
              )}
              
              {Object.entries(searchResults)
                .filter(([key]) => key !== 'name')
                .map(([category, items]) => (
                  <Collapsible 
                    key={category} 
                    open={openCategories.includes(category)}
                    onOpenChange={() => toggleCategory(category)}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-slate-100 dark:bg-slate-800 px-4 py-2 text-left hover:bg-slate-200 dark:hover:bg-slate-700">
                      <h3 className="flex items-center text-lg font-semibold">
                        {getIconForCategory(category)}
                        <span className="ml-2 text-foreground">
                          {getCategoryTitle(category)}
                        </span>
                      </h3>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ScrollArea className="h-56 pr-4">
                        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
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
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>
                ))}

              <div className="flex justify-center mt-4">
                <Button 
                  variant="link" 
                  className="text-brand-purple text-sm flex items-center"
                  onClick={() => setTipModalOpen(true)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Got a great spot here? Share a tip
                </Button>
              </div>
            </div>
          )}

          {!searchResults && !error && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-medium">Find your layover hotspots</h3>
                <p className="mt-1">Enter city name (like Chicago, Denver) or airport code (like ORD, DEN) to discover nearby restaurants, attractions, and spots to visit.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={tipModalOpen} onOpenChange={setTipModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share a Tip for {currentAirport}</DialogTitle>
            <DialogDescription>
              Help fellow crew members discover great spots during their layover.
              Your tip will be reviewed and may be added to our database.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitTip)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="foodAndCoffee">Food & Coffee</SelectItem>
                        <SelectItem value="thingsToDo">Things to Do</SelectItem>
                        <SelectItem value="crewTips">Crew Tips</SelectItem>
                        <SelectItem value="restAndRecovery">Rest & Recovery</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of the place" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What makes this place special for crew?"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location/Directions</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="How to find it (terminal, nearby landmarks, etc.)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setTipModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Tip</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
