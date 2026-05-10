import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
}, (table) => [
  index("users_role_idx").on(table.role),
  index("users_email_idx").on(table.email),
]);

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  color: varchar("color", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("categories_slug_idx").on(table.slug),
]);

export const apps = mysqlTable("apps", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  description: text("description"),
  longDescription: text("longDescription"),
  version: varchar("version", { length: 50 }).notNull().default("1.0.0"),
  developer: varchar("developer", { length: 255 }).notNull(),
  developerId: bigint("developerId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  size: varchar("size", { length: 50 }),
  downloadUrl: varchar("downloadUrl", { length: 500 }),
  fileName: varchar("fileName", { length: 255 }),
  fileMimeType: varchar("fileMimeType", { length: 100 }),
  screenshots: text("screenshots"),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).notNull().references(() => categories.id, { onDelete: "restrict" }),
  releaseDate: timestamp("releaseDate").defaultNow().notNull(),
  changelog: text("changelog"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0").notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  featured: mysqlEnum("featured", ["true", "false"]).default("false").notNull(),
  trending: mysqlEnum("trending", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("apps_slug_idx").on(table.slug),
  index("apps_category_idx").on(table.categoryId),
  index("apps_status_idx").on(table.status),
  index("apps_featured_idx").on(table.featured),
  index("apps_trending_idx").on(table.trending),
  index("apps_developer_idx").on(table.developerId),
  index("apps_rating_idx").on(table.rating),
  index("apps_download_count_idx").on(table.downloadCount),
]);

export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("tags_slug_idx").on(table.slug),
]);

export const appTags = mysqlTable("app_tags", {
  id: serial("id").primaryKey(),
  appId: bigint("appId", { mode: "number", unsigned: true }).notNull().references(() => apps.id, { onDelete: "cascade" }),
  tagId: bigint("tagId", { mode: "number", unsigned: true }).notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [
  uniqueIndex("apptags_unique_idx").on(table.appId, table.tagId),
  index("apptags_tag_idx").on(table.tagId),
]);

export const downloads = mysqlTable("downloads", {
  id: serial("id").primaryKey(),
  appId: bigint("appId", { mode: "number", unsigned: true }).notNull().references(() => apps.id, { onDelete: "cascade" }),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("downloads_app_idx").on(table.appId),
  index("downloads_user_idx").on(table.userId),
  index("downloads_created_idx").on(table.createdAt),
]);

export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  appId: bigint("appId", { mode: "number", unsigned: true }).notNull().references(() => apps.id, { onDelete: "cascade" }),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  helpfulCount: int("helpfulCount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("reviews_app_user_idx").on(table.appId, table.userId),
  index("reviews_app_idx").on(table.appId),
  index("reviews_status_idx").on(table.status),
  index("reviews_rating_idx").on(table.rating),
]);

export const favorites = mysqlTable("favorites", {
  id: serial("id").primaryKey(),
  appId: bigint("appId", { mode: "number", unsigned: true }).notNull().references(() => apps.id, { onDelete: "cascade" }),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("favorites_app_user_idx").on(table.appId, table.userId),
  index("favorites_user_idx").on(table.userId),
]);

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["info", "success", "warning", "system"]).default("info").notNull(),
  read: mysqlEnum("read", ["true", "false"]).default("false").notNull(),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("notifications_user_idx").on(table.userId),
  index("notifications_read_idx").on(table.read),
]);

export const adminLogs = mysqlTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: bigint("adminId", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: bigint("entityId", { mode: "number", unsigned: true }),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("adminlogs_admin_idx").on(table.adminId),
  index("adminlogs_action_idx").on(table.action),
  index("adminlogs_entity_idx").on(table.entity),
  index("adminlogs_created_idx").on(table.createdAt),
]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type App = typeof apps.$inferSelect;
export type InsertApp = typeof apps.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type Download = typeof downloads.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
