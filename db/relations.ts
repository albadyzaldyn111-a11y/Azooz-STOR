import { relations } from "drizzle-orm";
import { users, apps, categories, tags, appTags, downloads, reviews, favorites, notifications, adminLogs } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  apps: many(apps),
  downloads: many(downloads),
  reviews: many(reviews),
  favorites: many(favorites),
  notifications: many(notifications),
  adminLogs: many(adminLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  apps: many(apps),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  category: one(categories, {
    fields: [apps.categoryId],
    references: [categories.id],
  }),
  developer: one(users, {
    fields: [apps.developerId],
    references: [users.id],
  }),
  appTags: many(appTags),
  downloads: many(downloads),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  appTags: many(appTags),
}));

export const appTagsRelations = relations(appTags, ({ one }) => ({
  app: one(apps, {
    fields: [appTags.appId],
    references: [apps.id],
  }),
  tag: one(tags, {
    fields: [appTags.tagId],
    references: [tags.id],
  }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  app: one(apps, {
    fields: [downloads.appId],
    references: [apps.id],
  }),
  user: one(users, {
    fields: [downloads.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  app: one(apps, {
    fields: [reviews.appId],
    references: [apps.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  app: one(apps, {
    fields: [favorites.appId],
    references: [apps.id],
  }),
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));
