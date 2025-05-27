// This file is not needed since we're using real data from the backend
// but keeping it as a reference for the data structure

import type { Article } from "@shared/schema";

export const mockArticles: Omit<Article, 'id'>[] = [
  {
    title: "Breakthrough in Quantum Computing Could Revolutionize Cybersecurity",
    summary: "Scientists at MIT have announced a major breakthrough in quantum computing that could fundamentally change how we approach cybersecurity. The new quantum processor demonstrates unprecedented stability and error correction capabilities.",
    content: "Full article content here...",
    source: "TechCrunch",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    url: "https://techcrunch.com/quantum-breakthrough",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    views: 2300,
  },
  // ... more mock articles
];
