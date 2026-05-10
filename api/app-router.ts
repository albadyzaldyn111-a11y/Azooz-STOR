import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sql, eq, and, or, like, desc, asc, count } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { apps, categories, tags, appTags, downloads } from "@db/schema";

const db = getDb();

function sanitize(str: string): string {
  return str.replace(/[<>\"'&]/g, "").trim();
}

export const appsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
        category: z.string().optional(),
        tag: z.string().optional(),
        search: z.string().max(100).optional(),
        sort: z.enum(["newest", "popular", "rating", "name"]).default("newest"),
        status: z.enum(["published", "draft", "archived", "all"]).default("published"),
        featured: z.boolean().optional(),
        trending: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const page = input.page ?? 1;
      const limit = input.limit ?? 12;
      const offset = (page - 1) * limit;
      
      const conditions = [];
      
      if (input.status && input.status !== "all") {
        conditions.push(eq(apps.status, input.status));
      } else {
        conditions.push(eq(apps.status, "published"));
      }
      
      if (input.category) {
        conditions.push(eq(categories.slug, input.category));
      }
      
      if (input.search) {
        const safeSearch = sanitize(input.search);
        conditions.push(
          or(
            like(apps.name, `%${safeSearch}%`),
            like(apps.description, `%${safeSearch}%`),
            like(apps.developer, `%${safeSearch}%`)
          )
        );
      }
      
      if (input.featured) {
        conditions.push(eq(apps.featured, "true"));
      }
      
      if (input.trending) {
        conditions.push(eq(apps.trending, "true"));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const countResult = await db
        .select({ count: count() })
        .from(apps)
        .leftJoin(categories, eq(apps.categoryId, categories.id))
        .where(whereClause);
      
      const total = countResult[0]?.count ?? 0;
      
      const orderBy = {
        newest: desc(apps.createdAt),
        popular: desc(apps.downloadCount),
        rating: desc(apps.rating),
        name: asc(apps.name),
      }[input.sort] ?? desc(apps.createdAt);
      
      const list = await db
        .select({
          id: apps.id,
          name: apps.name,
          slug: apps.slug,
          description: apps.description,
          version: apps.version,
          developer: apps.developer,
          size: apps.size,
          rating: apps.rating,
          downloadCount: apps.downloadCount,
          reviewCount: apps.reviewCount,
          status: apps.status,
          featured: apps.featured,
          trending: apps.trending,
          screenshots: apps.screenshots,
          categoryId: apps.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
          createdAt: apps.createdAt,
        })
        .from(apps)
        .leftJoin(categories, eq(apps.categoryId, categories.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);
      
      return {
        apps: list,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string().min(1).max(300) }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: apps.id,
          name: apps.name,
          slug: apps.slug,
          description: apps.description,
          longDescription: apps.longDescription,
          version: apps.version,
          developer: apps.developer,
          size: apps.size,
          downloadUrl: apps.downloadUrl,
          screenshots: apps.screenshots,
          changelog: apps.changelog,
          rating: apps.rating,
          downloadCount: apps.downloadCount,
          reviewCount: apps.reviewCount,
          status: apps.status,
          featured: apps.featured,
          trending: apps.trending,
          releaseDate: apps.releaseDate,
          categoryId: apps.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
          createdAt: apps.createdAt,
          updatedAt: apps.updatedAt,
        })
        .from(apps)
        .leftJoin(categories, eq(apps.categoryId, categories.id))
        .where(and(eq(apps.slug, input.slug), eq(apps.status, "published")))
        .limit(1);
      
      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "App not found" });
      }
      
      const tagList = await db
        .select({ name: tags.name, slug: tags.slug })
        .from(appTags)
        .innerJoin(tags, eq(appTags.tagId, tags.id))
        .where(eq(appTags.appId, result[0].id));
      
      return { ...result[0], tags: tagList };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      const result = await db.select().from(apps).where(eq(apps.id, input.id)).limit(1);
      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "App not found" });
      }
      return result[0];
    }),

  featured: publicQuery.query(async () => {
    return db
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        description: apps.description,
        version: apps.version,
        developer: apps.developer,
        size: apps.size,
        rating: apps.rating,
        downloadCount: apps.downloadCount,
        screenshots: apps.screenshots,
        categoryName: categories.name,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(eq(apps.featured, "true"), eq(apps.status, "published")))
      .orderBy(desc(apps.createdAt))
      .limit(6);
  }),

  trending: publicQuery.query(async () => {
    return db
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        description: apps.description,
        version: apps.version,
        developer: apps.developer,
        size: apps.size,
        rating: apps.rating,
        downloadCount: apps.downloadCount,
        screenshots: apps.screenshots,
        categoryName: categories.name,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(eq(apps.trending, "true"), eq(apps.status, "published")))
      .orderBy(desc(apps.downloadCount))
      .limit(6);
  }),

  related: publicQuery
    .input(z.object({ appId: z.number().positive(), limit: z.number().min(1).max(10).default(4) }))
    .query(async ({ input }) => {
      const app = await db.select().from(apps).where(eq(apps.id, input.appId)).limit(1);
      if (!app[0]) return [];
      
      return db
        .select({
          id: apps.id,
          name: apps.name,
          slug: apps.slug,
          description: apps.description,
          version: apps.version,
          developer: apps.developer,
          rating: apps.rating,
          downloadCount: apps.downloadCount,
          screenshots: apps.screenshots,
        })
        .from(apps)
        .where(
          and(
            eq(apps.categoryId, app[0].categoryId),
            eq(apps.status, "published"),
            sql`${apps.id} != ${input.appId}`
          )
        )
        .orderBy(desc(apps.rating))
        .limit(input.limit);
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(300),
        description: z.string().optional(),
        longDescription: z.string().optional(),
        version: z.string().min(1).max(50).default("1.0.0"),
        developer: z.string().min(1).max(255),
        size: z.string().max(50).optional(),
        downloadUrl: z.string().max(500).optional(),
        screenshots: z.string().optional(),
        categoryId: z.number().positive(),
        changelog: z.string().optional(),
        tagIds: z.array(z.number().positive()).optional(),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
        featured: z.boolean().default(false),
        trending: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.select().from(apps).where(eq(apps.slug, input.slug)).limit(1);
      if (existing[0]) {
        throw new TRPCError({ code: "CONFLICT", message: "App slug already exists" });
      }
      
      const result = await db.insert(apps).values({
        ...input,
        featured: input.featured ? "true" : "false",
        trending: input.trending ? "true" : "false",
      }).$returningId();
      
      const appId = result[0].id;
      
      if (input.tagIds && input.tagIds.length > 0) {
        await db.insert(appTags).values(input.tagIds.map(tagId => ({ appId, tagId })));
      }
      
      return { id: appId, success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().positive(),
        data: z.object({
          name: z.string().min(1).max(255).optional(),
          slug: z.string().min(1).max(300).optional(),
          description: z.string().optional(),
          longDescription: z.string().optional(),
          version: z.string().min(1).max(50).optional(),
          developer: z.string().min(1).max(255).optional(),
          size: z.string().max(50).optional(),
          downloadUrl: z.string().max(500).optional(),
          screenshots: z.string().optional(),
          categoryId: z.number().positive().optional(),
          changelog: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          featured: z.boolean().optional(),
          trending: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = {};
      
      Object.entries(input.data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "featured" || key === "trending") {
            updateData[key] = value ? "true" : "false";
          } else {
            updateData[key] = value;
          }
        }
      });
      
      await db.update(apps).set(updateData).where(eq(apps.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ input }) => {
      await db.delete(apps).where(eq(apps.id, input.id));
      return { success: true };
    }),

  download: publicQuery
    .input(z.object({ appId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {
      await db.update(apps)
        .set({ downloadCount: sql`${apps.downloadCount} + 1` })
        .where(eq(apps.id, input.appId));
      
      await db.insert(downloads).values({
        appId: input.appId,
        userId: ctx.user?.id ?? null,
        ipAddress: ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown",
        userAgent: ctx.req.headers.get("user-agent") || "",
      });
      
      return { success: true };
    }),
});
