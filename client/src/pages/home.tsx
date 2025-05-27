import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Header from "@/components/header";
import CategoryNav from "@/components/category-nav";
import ArticleCard from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@shared/schema";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("today");
  const [sortBy, setSortBy] = useState("latest");

  const { data, isLoading, error } = useQuery<{ articles: (Article & { isSaved?: boolean })[] }>({
    queryKey: ["/api/articles", { category: activeCategory, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== "trending") {
        params.append("category", activeCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }
      return response.json();
    },
  });

  const articles = data?.articles || [];

  const getCategoryTitle = (category: string) => {
    if (category === "trending") return "Trending News";
    return `${category.charAt(0).toUpperCase() + category.slice(1)} News`;
  };

  const ArticleSkeleton = () => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="w-full h-32" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-6" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />
      <CategoryNav 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : getCategoryTitle(activeCategory)}
          </h2>
          <p className="text-muted-foreground">
            Stay updated with the latest news from around the world
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {articles.length} articles
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="relevant">Most Relevant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Articles Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Failed to load articles. Please try again later.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 lg:col-span-2">
              <ArticleSkeleton />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No articles found matching your search." 
                : "No articles available in this category."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  featured={index === 0}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Load More Articles
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
