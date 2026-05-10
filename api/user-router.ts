import { z } from "zod";
import { eq, and, desc, count } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { favorites, notifications, adminLogs, apps, users, reviews } from "@db/schema";

const db = getDb();

export const favoriteRouter = createRouter({
  list: authedQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const params = input || { page: 1, limit: 20 };
      const offset = (params.page - 1) * params.limit;
      
      const list = await db
        .select({
          id: favorites.id,
          appId: favorites.appId,
          createdAt: favorites.createdAt,
          appName: apps.name,
          appSlug: apps.slug,
          appDescription: apps.description,
          appRating: apps.rating,
          appDeveloper: apps.developer,
        })
        .from(favorites)
        .innerJoin(apps, eq(favorites.appId, apps.id))
        .where(eq(favorites.userId, ctx.user.id))
        .orderBy(desc(favorites.createdAt))
        .limit(params.limit)
        .offset(offset);
      
      return list;
    }),

  toggle: authedQuery
    .input(z.object({ appId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.appId, input.appId), eq(favorites.userId, ctx.user.id)))
        .limit(1);
      
      if (existing[0]) {
        await db.delete(favorites).where(eq(favorites.id, existing[0].id));
        return { favorited: false };
      } else {
        await db.insert(favorites).values({ appId: input.appId, userId: ctx.user.id });
        return { favorited: true };
      }
    }),

  check: authedQuery
    .input(z.object({ appId: z.number().positive() }))
    .query(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.appId, input.appId), eq(favorites.userId, ctx.user.id)))
        .limit(1);
      
      return { favorited: !!existing[0] };
    }),
});

export const notificationRouter = createRouter({
  list: authedQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      unreadOnly: z.boolean().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      const params = input || { page: 1, limit: 20, unreadOnly: false };
      const offset = (params.page - 1) * params.limit;
      
      const conditions = [eq(notifications.userId, ctx.user.id)];
      if (params.unreadOnly) {
        conditions.push(eq(notifications.read, "false"));
      }
      
      const list = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(params.limit)
        .offset(offset);
      
      const unreadCount = await db
        .select({ count: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, "false")));
      
      return { notifications: list, unreadCount: unreadCount[0]?.count ?? 0 };
    }),

  markRead: authedQuery
    .input(z.object({ id: z.number().positive().optional(), all: z.boolean().default(false) }))
    .mutation(async ({ input, ctx }) => {
      if (input.all) {
        await db
          .update(notifications)
          .set({ read: "true" })
          .where(eq(notifications.userId, ctx.user.id));
      } else if (input.id) {
        await db
          .update(notifications)
          .set({ read: "true" })
          .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      }
      return { success: true };
    }),
});

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [appsCount] = await db.select({ count: count() }).from(apps);
    const [downloadsCount] = await db.select({ count: count() }).from(favorites);
    const [reviewsCount] = await db.select({ count: count() }).from(reviews);
    
    return {
      users: usersCount?.count ?? 0,
      apps: appsCount?.count ?? 0,
      downloads: downloadsCount?.count ?? 0,
      reviews: reviewsCount?.count ?? 0,
    };
  }),

  users: adminQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      role: z.enum(["user", "admin", "all"]).default("all"),
    }).optional())
    .query(async ({ input }) => {
      const params = input || { page: 1, limit: 20, role: "all" };
      const offset = (params.page - 1) * params.limit;
      
      const conditions = [];
      if (params.role !== "all") {
        conditions.push(eq(users.role, params.role));
      }
      
      const list = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
          createdAt: users.createdAt,
          lastSignInAt: users.lastSignInAt,
        })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(params.limit)
        .offset(offset);
      
      const total = await db.select({ count: count() }).from(users);
      
      return { users: list, total: total[0]?.count ?? 0 };
    }),

  updateUserRole: adminQuery
    .input(z.object({ id: z.number().positive(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input, ctx }) => {
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      
      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        action: "UPDATE_ROLE",
        entity: "user",
        entityId: input.id,
        details: `Changed role to ${input.role}`,
        ipAddress: ctx.req.headers.get("x-forwarded-for") || "unknown",
      });
      
      return { success: true };
    }),

  logs: adminQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const params = input || { page: 1, limit: 50 };
      const offset = (params.page - 1) * params.limit;
      
      const list = await db
        .select({
          id: adminLogs.id,
          action: adminLogs.action,
          entity: adminLogs.entity,
          entityId: adminLogs.entityId,
          details: adminLogs.details,
          ipAddress: adminLogs.ipAddress,
          createdAt: adminLogs.createdAt,
          adminName: users.name,
        })
        .from(adminLogs)
        .leftJoin(users, eq(adminLogs.adminId, users.id))
        .orderBy(desc(adminLogs.createdAt))
        .limit(params.limit)
        .offset(offset);
      
      return list;
    }),
});
