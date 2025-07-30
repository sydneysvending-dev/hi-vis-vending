import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  loyaltyTier: varchar("loyalty_tier").default("apprentice"), // apprentice, tradie, foreman
  totalPoints: integer("total_points").default(0),
  punchCardProgress: integer("punch_card_progress").default(0),
  isAdmin: boolean("is_admin").default(false),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  referralCount: integer("referral_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table for tracking purchases and redemptions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // purchase, redemption, bonus
  points: integer("points").notNull(), // positive for earned, negative for spent
  description: text("description").notNull(),
  machineId: varchar("machine_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rewards table for available rewards
export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  category: varchar("category").notNull(), // drink, snack, bonus
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vending machines table
export const machines = pgTable("machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  location: text("location").notNull(),
  isOnline: boolean("is_online").default(true),
  lastPing: timestamp("last_ping").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  points: true,
  description: true,
  machineId: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  name: true,
  description: true,
  pointsCost: true,
  category: true,
});

export const insertMachineSchema = createInsertSchema(machines).pick({
  name: true,
  location: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type Machine = typeof machines.$inferSelect;
