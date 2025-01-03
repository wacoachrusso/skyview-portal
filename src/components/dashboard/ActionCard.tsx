import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const ActionCard = ({ icon: Icon, title, description, onClick }: ActionCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Card 
      className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 border-0 cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex items-center space-x-4">
        <Icon className="h-6 w-6 text-white/90" />
        <div>
          <h3 className="font-medium text-lg text-white/90">{title}</h3>
          <p className="text-white/70 text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};