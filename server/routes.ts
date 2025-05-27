import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, updateUserSchema, insertSavedArticleSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Logged out successfully" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session!.userId!);
      if (!user) {
        if (req.session) {
          req.session.destroy(() => {});
        }
        return res.status(401).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // User profile routes
  app.put("/api/user/profile", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const updates = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(req.session.userId, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Update failed" });
    }
  });

  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      let articles;
      if (search) {
        articles = await storage.searchArticles(search, limit, offset);
      } else if (category) {
        articles = await storage.getArticlesByCategory(category, limit, offset);
      } else {
        articles = await storage.getArticles(limit, offset);
      }

      // If user is authenticated, check which articles are saved
      if (req.session?.userId) {
        const articlesWithSavedStatus = await Promise.all(
          articles.map(async (article) => ({
            ...article,
            isSaved: await storage.isArticleSaved(req.session!.userId!, article.id),
          }))
        );
        res.json({ articles: articlesWithSavedStatus });
      } else {
        res.json({ articles });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Update view count
      await storage.updateArticleViews(id);

      // Check if saved (if user is authenticated)
      let isSaved = false;
      if (req.session?.userId) {
        isSaved = await storage.isArticleSaved(req.session.userId, id);
      }

      res.json({ article: { ...article, isSaved } });
    } catch (error) {
      res.status(500).json({ message: "Failed to get article" });
    }
  });

  // Saved articles routes
  app.get("/api/saved-articles", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const savedArticles = await storage.getSavedArticles(req.session.userId);
      res.json({ savedArticles });
    } catch (error) {
      res.status(500).json({ message: "Failed to get saved articles" });
    }
  });

  app.post("/api/saved-articles", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { articleId } = insertSavedArticleSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });

      // Check if article exists
      const article = await storage.getArticle(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check if already saved
      const isAlreadySaved = await storage.isArticleSaved(req.session.userId, articleId);
      if (isAlreadySaved) {
        return res.status(400).json({ message: "Article already saved" });
      }

      const savedArticle = await storage.saveArticle({
        userId: req.session.userId,
        articleId,
      });

      res.json({ savedArticle });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to save article" });
    }
  });

  app.delete("/api/saved-articles/:articleId", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const articleId = parseInt(req.params.articleId);
      const success = await storage.unsaveArticle(req.session.userId, articleId);
      
      if (!success) {
        return res.status(404).json({ message: "Saved article not found" });
      }

      res.json({ message: "Article unsaved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsave article" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
