import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Landmark, 
  Cpu, 
  Trophy, 
  TrendingUp, 
  Heart, 
  Film 
} from "lucide-react";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "politics", label: "Politics", icon: Landmark },
  { id: "technology", label: "Technology", icon: Cpu },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "business", label: "Business", icon: TrendingUp },
  { id: "health", label: "Health", icon: Heart },
  { id: "entertainment", label: "Entertainment", icon: Film },
];

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 py-3 overflow-x-auto">
          {categories.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              onClick={() => onCategoryChange(id)}
              className={cn(
                "whitespace-nowrap pb-2 border-b-2 border-transparent transition-colors",
                activeCategory === id
                  ? "text-primary border-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
