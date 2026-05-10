import { z } from "zod";
import { eq, desc, count, and } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, tags, reviews, users } from "@db/schema";

const db = getDb();

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    return db.select().from(categories).orderBy(categories.name);
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const result = await db.select().from(categories).where(eq(categories.slug, input.slug)).limit(1);
      if (!result[0]) throw new Error("Category not found");
      return result[0];
    }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1).max(100),
      slug: z.string().min(1).max(120),
      description: z.string().optional(),
      icon: z.string().max(255).optional(),
      color: z.string().max(50).optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(categories).values(input).$returningId();
      return { id: result[0].id, success: true };
    }),
});

export const tagRouter = createRouter({
  list: publicQuery.query(async () => {
    return db.select().from(tags).orderBy(tags.name);
  }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1).max(50),
      slug: z.string().min(1).max(60),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(tags).values(input).$returningId();
      return { id: result[0].id, success: true };
    }),
});

export const reviewRouter = createRouter({
  list: publicQuery
    .input(z.object({
      appId: z.number().positive(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(20).default(10),
      status: z.enum(["pending", "approved", "rejected", "all"]).default("approved"),
    }))
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      
      const conditions = [eq(reviews.appId, input.appId)];
      if (input.status !== "all") {
        conditions.push(eq(reviews.status, input.status));
      }
      
      const list = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          title: reviews.title,
          content: reviews.content,
          helpfulCount: reviews.helpfulCount,
          status: reviews.status,
          createdAt: reviews.createdAt,
          userName: users.name,
          userAvatar: users.avatar,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const countResult = await db.select({ count: count() }).from(reviews).where(eq(reviews.appId, input.appId));
      
      return {
        reviews: list,
        total: countResult[0]?.count ?? 0,
      };
    }),

  create: authedQuery
    .input(z.object({
      appId: z.number().positive(),
      rating: z.number().min(1).max(5),
      title: z.string().max(255).optional(),
      content: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.appId, input.appId), eq(reviews.userId, ctx.user.id)))
        .limit(1);
      
      if (existing[0]) {
        throw new Error("You have already reviewed this app");
      }
      
      const result = await db.insert(reviews).values({
        ...input,
        userId: ctx.user.id,
        status: "pending",
      }).$returningId();
      
      return { id: result[0].id, success: true };
    }),

  approve: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ input }) => {
      await db.update(reviews).set({ status: "approved" }).where(eq(reviews.id, input.id));
      return { success: true };
    }),

  reject: adminQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ input }) => {
      await db.update(reviews).set({ status: "rejected" }).where(eq(reviews.id, input.id));
      return { success: true };
    }),
});
