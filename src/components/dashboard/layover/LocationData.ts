
export interface LocationItem {
  name: string;
  description: string;
  rating: number;
}

export interface LocationData {
  name: string;
  foodAndCoffee: LocationItem[];
  thingsToDo: LocationItem[];
  crewTips: LocationItem[];
  restAndRecovery: LocationItem[];
}

export const mockLayoverData: Record<string, LocationData> = {
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

export const cityToAirportCode: Record<string, string> = {
  "new york": "JFK",
  "nyc": "JFK",
  "los angeles": "LAX",
  "la": "LAX",
  "chicago": "ORD",
  "denver": "DEN"
};
