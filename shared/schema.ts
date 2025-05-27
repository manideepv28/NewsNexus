import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  preferences: text("preferences").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content"),
  source: text("source").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  url: text("url"),
  publishedAt: timestamp("published_at").notNull(),
  views: integer("views").default(0).notNull(),
});

export const savedArticles = pgTable("saved_articles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  preferences: true,
}).partial();

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  views: true,
});

export const insertSavedArticleSchema = createInsertSchema(savedArticles).pick({
  userId: true,
  articleId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type SavedArticle = typeof savedArticles.$inferSelect;
export type InsertSavedArticle = z.infer<typeof insertSavedArticleSchema>;
