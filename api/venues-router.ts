import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { venues } from "@db/schema";
import { eq, like, and, or, desc, count } from "drizzle-orm";

export const venuesRouter = createRouter({
  // 获取所有场馆（公开接口）
  list: publicQuery
    .input(
      z.object({
        district: z.string().optional(),
        type: z.string().optional(),
        keyword: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.district && input.district !== "all") {
        conditions.push(eq(venues.district, input.district));
      }
      if (input?.type && input.type !== "all") {
        conditions.push(eq(venues.type, input.type as "室内" | "室外"));
      }
      if (input?.keyword) {
        const kw = `%${input.keyword}%`;
        conditions.push(
          or(
            like(venues.name, kw),
            like(venues.address, kw),
            like(venues.district, kw)
          )!
        );
      }

      const query = conditions.length > 0
        ? db.select().from(venues).where(and(...conditions)).orderBy(desc(venues.updatedAt))
        : db.select().from(venues).orderBy(desc(venues.updatedAt));

      return await query;
    }),

  // 根据ID获取单个场馆
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(venues)
        .where(eq(venues.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  // 创建场馆（公开接口）
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "场馆名称不能为空"),
        address: z.string().min(1, "地址不能为空"),
        district: z.string().min(1, "区域不能为空"),
        type: z.enum(["室内", "室外"]),
        courtType: z.string().default("硬地"),
        courtsCount: z.number().min(1).default(1),
        priceWeekday: z.string().default(""),
        priceWeekend: z.string().default(""),
        priceEvening: z.string().default(""),
        phone: z.string().default(""),
        hours: z.string().default(""),
        bookingUrl: z.string().optional(),
        bookingMiniProgram: z.string().default(""),
        tags: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        source: z.string().default(""),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(venues).values(input);
      return { id: Number(result[0].insertId), success: true };
    }),

  // 更新场馆（公开接口）
  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        address: z.string().min(1).optional(),
        district: z.string().min(1).optional(),
        type: z.enum(["室内", "室外"]).optional(),
        courtType: z.string().optional(),
        courtsCount: z.number().min(1).optional(),
        priceWeekday: z.string().optional(),
        priceWeekend: z.string().optional(),
        priceEvening: z.string().optional(),
        phone: z.string().optional(),
        hours: z.string().optional(),
        bookingUrl: z.string().optional(),
        bookingMiniProgram: z.string().optional(),
        tags: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(venues).set(data).where(eq(venues.id, id));
      return { success: true };
    }),

  // 删除场馆
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(venues).where(eq(venues.id, input.id));
      return { success: true };
    }),

  // 获取统计信息
  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(venues);
    return {
      total: all.length,
      indoor: all.filter((v) => v.type === "室内").length,
      outdoor: all.filter((v) => v.type === "室外").length,
    };
  }),
});
