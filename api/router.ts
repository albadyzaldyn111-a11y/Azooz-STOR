import { authRouter } from "./auth-router";
import { appsRouter } from "./app-router";
import { categoryRouter, tagRouter, reviewRouter } from "./content-router";
import { favoriteRouter, notificationRouter, adminRouter } from "./user-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  app: appsRouter,
  category: categoryRouter,
  tag: tagRouter,
  review: reviewRouter,
  favorite: favoriteRouter,
  notification: notificationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
