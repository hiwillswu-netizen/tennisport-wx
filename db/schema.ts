import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
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
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 网球场馆表
export const venues = mysqlTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  district: varchar("district", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["室内", "室外"]).notNull(),
  courtType: varchar("court_type", { length: 50 }).notNull().default("硬地"),
  courtsCount: int("courts_count").notNull().default(1),
  priceWeekday: varchar("price_weekday", { length: 100 }).notNull().default(""),
  priceWeekend: varchar("price_weekend", { length: 100 }).notNull().default(""),
  priceEvening: varchar("price_evening", { length: 100 }).notNull().default(""),
  phone: varchar("phone", { length: 50 }).notNull().default(""),
  hours: varchar("hours", { length: 100 }).notNull().default(""),
  bookingUrl: text("booking_url"),
  bookingMiniProgram: varchar("booking_mini_program", { length: 255 }).notNull().default(""),
  bookingAppId: varchar("booking_app_id", { length: 255 }).notNull().default(""),
  bookingPath: varchar("booking_path", { length: 500 }).notNull().default(""),
  tags: text("tags"),
  lat: float("lat"),
  lng: float("lng"),
  source: varchar("source", { length: 255 }).notNull().default(""),
  isActive: mysqlEnum("is_active", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = typeof venues.$inferInsert;
