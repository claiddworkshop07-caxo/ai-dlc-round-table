import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const equipmentStatusEnum = pgEnum("equipment_status", [
  "available",
  "borrowed",
]);

export const lendingStatusEnum = pgEnum("lending_status", [
  "active",
  "returned",
]);

export const equipment = pgTable("equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  status: equipmentStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const lendingRecords = pgTable("lending_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentId: uuid("equipment_id")
    .references(() => equipment.id)
    .notNull(),
  borrowerName: varchar("borrower_name", { length: 255 }).notNull(),
  borrowedAt: timestamp("borrowed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  dueDate: date("due_date").notNull(),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  memo: text("memo"),
  status: lendingStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
