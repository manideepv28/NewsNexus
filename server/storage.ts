import { users, articles, savedArticles, type User, type InsertUser, type Article, type InsertArticle, type SavedArticle, type InsertSavedArticle, type UpdateUser } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;

  // Article operations
  getArticles(limit?: number, offset?: number): Promise<Article[]>;
  getArticlesByCategory(category: string, limit?: number, offset?: number): Promise<Article[]>;
  searchArticles(query: string, limit?: number, offset?: number): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: number): Promise<void>;

  // Saved articles operations
  getSavedArticles(userId: number): Promise<(SavedArticle & { article: Article })[]>;
  saveArticle(savedArticle: InsertSavedArticle): Promise<SavedArticle>;
  unsaveArticle(userId: number, articleId: number): Promise<boolean>;
  isArticleSaved(userId: number, articleId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private savedArticles: Map<string, SavedArticle>;
  private currentUserId: number;
  private currentArticleId: number;
  private currentSavedId: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.savedArticles = new Map();
    this.currentUserId = 1;
    this.currentArticleId = 1;
    this.currentSavedId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock articles
    const mockArticles: Omit<Article, 'id'>[] = [
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
      {
        title: "Global Climate Summit Reaches Historic Agreement",
        summary: "World leaders have reached a unanimous agreement on new climate policies that could significantly impact global carbon emissions.",
        content: "Full article content here...",
        source: "BBC News",
        category: "politics",
        imageUrl: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        url: "https://bbc.com/climate-summit",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        views: 1850,
      },
      {
        title: "Championship Final Breaks Viewership Records",
        summary: "Last night's championship game drew the largest television audience in sports history, with over 120 million viewers worldwide.",
        content: "Full article content here...",
        source: "ESPN",
        category: "sports",
        imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        url: "https://espn.com/championship-record",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        views: 5200,
      },
      {
        title: "Markets Surge Following Economic Report",
        summary: "Major stock indices reached new highs after the latest economic indicators showed stronger than expected growth.",
        content: "Full article content here...",
        source: "Wall Street Journal",
        category: "business",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        url: "https://wsj.com/markets-surge",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        views: 3100,
      },
      {
        title: "New Study Reveals Promising Treatment Results",
        summary: "Clinical trials for a new treatment show remarkable success rates, offering hope for patients with previously untreatable conditions.",
        content: "Full article content here...",
        source: "Medical News Today",
        category: "health",
        imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        url: "https://medicalnews.com/new-treatment",
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
        views: 1650,
      },
      {
        title: "Blockbuster Film Breaks Opening Weekend Records",
        summary: "The highly anticipated sequel dominated box offices worldwide, earning over $300 million in its opening weekend.",
        content: "Full article content here...",
        source: "Entertainment Weekly",
        category: "entertainment",
        imageUrl: "https://images.unsplash.com/photo-1489599894617-e40116ceb684?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        url: "https://ew.com/blockbuster-record",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        views: 4750,
      },
    ];

    mockArticles.forEach(article => {
      const id = this.currentArticleId++;
      this.articles.set(id, { ...article, id });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      preferences: [],
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Article operations
  async getArticles(limit = 20, offset = 0): Promise<Article[]> {
    const articles = Array.from(this.articles.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
    return articles;
  }

  async getArticlesByCategory(category: string, limit = 20, offset = 0): Promise<Article[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => category === 'trending' || article.category === category)
      .sort((a, b) => {
        if (category === 'trending') {
          return b.views - a.views; // Sort by views for trending
        }
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      })
      .slice(offset, offset + limit);
    return articles;
  }

  async searchArticles(query: string, limit = 20, offset = 0): Promise<Article[]> {
    const searchTerm = query.toLowerCase();
    const articles = Array.from(this.articles.values())
      .filter(article => 
        article.title.toLowerCase().includes(searchTerm) ||
        article.summary.toLowerCase().includes(searchTerm) ||
        article.source.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
    return articles;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const article: Article = {
      ...insertArticle,
      content: insertArticle.content || null,
      url: insertArticle.url || null,
      imageUrl: insertArticle.imageUrl || null,
      id,
      views: 0,
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticleViews(id: number): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views += 1;
      this.articles.set(id, article);
    }
  }

  // Saved articles operations
  async getSavedArticles(userId: number): Promise<(SavedArticle & { article: Article })[]> {
    const savedArticles = Array.from(this.savedArticles.values())
      .filter(saved => saved.userId === userId)
      .map(saved => {
        const article = this.articles.get(saved.articleId);
        return article ? { ...saved, article } : null;
      })
      .filter(Boolean) as (SavedArticle & { article: Article })[];
    
    return savedArticles.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }

  async saveArticle(insertSavedArticle: InsertSavedArticle): Promise<SavedArticle> {
    const id = this.currentSavedId++;
    const savedArticle: SavedArticle = {
      ...insertSavedArticle,
      id,
      savedAt: new Date(),
    };
    const key = `${insertSavedArticle.userId}-${insertSavedArticle.articleId}`;
    this.savedArticles.set(key, savedArticle);
    return savedArticle;
  }

  async unsaveArticle(userId: number, articleId: number): Promise<boolean> {
    const key = `${userId}-${articleId}`;
    return this.savedArticles.delete(key);
  }

  async isArticleSaved(userId: number, articleId: number): Promise<boolean> {
    const key = `${userId}-${articleId}`;
    return this.savedArticles.has(key);
  }
}

export const storage = new MemStorage();
