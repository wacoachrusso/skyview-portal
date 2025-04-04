
import { useState } from "react";
import { LocationData } from "./LocationData";
import { CategorySection } from "./CategorySection";
import { ResultsHeader } from "./ResultsHeader";

interface ResultsViewProps {
  data: LocationData;
  onOpenTipForm: () => void;
}

export const ResultsView = ({ data, onOpenTipForm }: ResultsViewProps) => {
  const [openCategories, setOpenCategories] = useState<string[]>(["foodAndCoffee", "thingsToDo", "crewTips", "restAndRecovery"]);

  const toggleCategory = (category: string) => {
    if (openCategories.includes(category)) {
      setOpenCategories(openCategories.filter(c => c !== category));
    } else {
      setOpenCategories([...openCategories, category]);
    }
  };

  return (
    <div className="space-y-6">
      <ResultsHeader name={data.name} onOpenTipForm={onOpenTipForm} />
      
      {Object.entries(data)
        .filter(([key]) => key !== 'name')
        .map(([category, items]) => (
          <CategorySection 
            key={category}
            category={category}
            items={items as any[]}
            isOpen={openCategories.includes(category)}
            onToggle={() => toggleCategory(category)}
          />
        ))}
    </div>
  );
};
