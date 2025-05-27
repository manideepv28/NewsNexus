import { useState } from "react";
import { format } from "date-fns";
import { Eye, Bookmark, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@shared/schema";

interface ArticleCardProps {
  article: Article & { isSaved?: boolean };
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(article.isSaved || false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/saved-articles/${article.id}`);
      } else {
        await apiRequest("POST", "/api/saved-articles", { articleId: article.id });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ["/api/saved-articles"] });
      toast({
        title: isSaved ? "Article unsaved" : "Article saved",
        description: isSaved 
          ? "Article removed from your saved articles" 
          : "Article saved to your reading list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save articles",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      politics: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      sports: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      business: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      entertainment: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return format(new Date(date), "MMM d, yyyy");
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
        featured ? "md:col-span-2 lg:col-span-2" : ""
      )}
    >
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className={cn(
            "w-full object-cover",
            featured ? "h-48" : "h-32"
          )}
        />
      )}
      
      <CardContent className={cn("p-4", featured ? "p-6" : "")}>
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={getCategoryColor(article.category)}
          >
            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </Badge>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className={cn(
                "p-1 h-auto",
                isSaved ? "text-accent" : "text-muted-foreground hover:text-accent"
              )}
            >
              <Bookmark className={cn("h-4 w-4", isSaved ? "fill-current" : "")} />
            </Button>
          )}
        </div>

        <h3 className={cn(
          "font-bold text-foreground mb-3 leading-tight hover:text-primary transition-colors",
          featured ? "text-xl" : "text-lg"
        )}>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
            {article.title}
            <ExternalLink className="h-4 w-4 mt-1 flex-shrink-0 opacity-50" />
          </a>
        </h3>

        <p className={cn(
          "text-muted-foreground mb-4",
          featured ? "line-clamp-3" : "line-clamp-2 text-sm"
        )}>
          {article.summary}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>{article.source}</span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="h-3 w-3" />
            <span>{article.views.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
