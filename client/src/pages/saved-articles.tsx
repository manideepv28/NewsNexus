import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SavedArticle, Article } from "@shared/schema";

interface SavedArticleWithArticle extends SavedArticle {
  article: Article;
}

export default function SavedArticles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ savedArticles: SavedArticleWithArticle[] }>({
    queryKey: ["/api/saved-articles"],
    enabled: !!user,
  });

  const unsaveMutation = useMutation({
    mutationFn: async (articleId: number) => {
      await apiRequest("DELETE", `/api/saved-articles/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article removed",
        description: "Article removed from your saved list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove article",
        variant: "destructive",
      });
    },
  });

  const handleUnsave = (articleId: number) => {
    unsaveMutation.mutate(articleId);
  };

  const savedArticles = data?.savedArticles || [];

  const SavedArticleSkeleton = () => (
    <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
      <Skeleton className="w-20 h-16 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-8 h-8" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Please sign in to view your saved articles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to News
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Saved Articles</CardTitle>
            <CardDescription>
              Your reading list - {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Failed to load saved articles. Please try again later.
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SavedArticleSkeleton key={i} />
                ))}
              </div>
            ) : savedArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't saved any articles yet.
                </p>
                <Link href="/">
                  <Button>Browse Articles</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedArticles.map(({ article, savedAt }) => (
                  <div
                    key={article.id}
                    className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex items-start gap-2"
                        >
                          {article.title}
                          <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                        </a>
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{format(new Date(article.publishedAt), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>Saved {format(new Date(savedAt), "MMM d")}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnsave(article.id)}
                      disabled={unsaveMutation.isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
