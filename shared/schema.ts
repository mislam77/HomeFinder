import { pgTable, text, serial, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  savedProperties: integer("saved_properties").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFeet: integer("square_feet").notNull(),
  yearBuilt: integer("year_built"),
  propertyType: text("property_type").notNull(),
  listingType: text("listing_type").notNull(), // buy or rent
  imageUrl: text("image_url").notNull(),
  userId: integer("user_id").notNull(),
  featured: boolean("featured").default(false),
  status: text("status").default("available"),
  avgRating: numeric("avg_rating").default("0"),
  ratingCount: integer("rating_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  message: text("message"),
  status: text("status").default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  rating: numeric("rating").notNull(),
  propertiesSold: integer("properties_sold").notNull(),
  imageUrl: text("image_url").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.username,
  password: (schema) => schema.password, 
  email: (schema) => schema.email,
  fullName: (schema) => schema.fullName
});

export const insertPropertySchema = createInsertSchema(properties, {
  // Make sure these fields are properly typed to accept either strings or numbers
  price: z.union([
    z.string(),
    z.number().transform(val => String(val))
  ]),
  lat: z.union([
    z.string(),
    z.number().transform(val => String(val))
  ]),
  lng: z.union([
    z.string(),
    z.number().transform(val => String(val))
  ]),
  // Ensure bedrooms, bathrooms, squareFeet can be strings or numbers
  bedrooms: z.union([
    z.number(),
    z.string().transform(val => Number(val))
  ]),
  bathrooms: z.union([
    z.number(),
    z.string().transform(val => Number(val))
  ]),
  squareFeet: z.union([
    z.number(),
    z.string().transform(val => Number(val))
  ]),
  yearBuilt: z.union([
    z.number().optional(),
    z.string().transform(val => val ? Number(val) : undefined).optional()
  ]),
}).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments, {
  // Override the date field to accept both Date objects and strings
  date: z.union([z.date(), z.string().transform(val => new Date(val))]),
}).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  savedProperties: string | number[]; // Allow both string and array
  createdAt: Date;
};

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const propertyFilterSchema = z.object({
  city: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minBeds: z.string().optional(),
  minBaths: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  minSqft: z.string().optional(),
  maxSqft: z.string().optional(),
  minYear: z.string().optional(),
  maxYear: z.string().optional(),
});

export type PropertyFilter = z.infer<typeof propertyFilterSchema>;