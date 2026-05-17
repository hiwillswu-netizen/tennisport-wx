import { authRouter } from "./auth-router";
import { venuesRouter } from "./venues-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  venues: venuesRouter,
});

export type AppRouter = typeof appRouter;
