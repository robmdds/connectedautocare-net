import { sql, relations } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  jsonb,
  uuid,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // admin, reseller_admin, reseller_agent, consumer, adjuster
  tenantId: varchar("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Multi-tenant support
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subdomain: varchar("subdomain").unique(),
  settings: jsonb("settings").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories (auto, RV, marine, powersports, home)
export const productCategoryEnum = pgEnum("product_category", [
  "auto", "rv", "marine", "powersports", "home"
]);

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: varchar("name").notNull(),
  category: productCategoryEnum("category").notNull(),
  description: text("description"),
  coverageOptions: jsonb("coverage_options").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate tables for pricing
export const rateTables = pgTable("rate_tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  productId: varchar("product_id").references(() => products.id),
  name: varchar("name").notNull(),
  version: varchar("version").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  rateData: jsonb("rate_data").notNull(), // Spreadsheet data as JSON
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle information
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin"),
  year: integer("year"),
  make: varchar("make"),
  model: varchar("model"),
  trim: varchar("trim"),
  bodyStyle: varchar("body_style"),
  engineSize: varchar("engine_size"),
  fuelType: varchar("fuel_type"),
  mileage: integer("mileage"),
  vehicleValue: decimal("vehicle_value", { precision: 10, scale: 2 }),
  vinDecodeData: jsonb("vin_decode_data"),
  isManualEntry: boolean("is_manual_entry").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quotes
export const quoteStatusEnum = pgEnum("quote_status", [
  "draft", "pending", "approved", "expired", "converted"
]);

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: varchar("quote_number").unique().notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  productId: varchar("product_id").references(() => products.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  customerEmail: varchar("customer_email"),
  customerName: varchar("customer_name"),
  customerPhone: varchar("customer_phone"),
  customerAddress: jsonb("customer_address"),
  coverageSelections: jsonb("coverage_selections").notNull(),
  basePremium: decimal("base_premium", { precision: 10, scale: 2 }).notNull(),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).default("0"),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  discounts: decimal("discounts", { precision: 10, scale: 2 }).default("0"),
  totalPremium: decimal("total_premium", { precision: 10, scale: 2 }).notNull(),
  status: quoteStatusEnum("status").default("draft"),
  expiresAt: timestamp("expires_at"),
  resellerId: varchar("reseller_id").references(() => users.id),
  resellerMarkup: decimal("reseller_markup", { precision: 5, scale: 2 }).default("0"),
  promoCode: varchar("promo_code"),
  utmData: jsonb("utm_data"),
  ratingData: jsonb("rating_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Policies
export const policyStatusEnum = pgEnum("policy_status", [
  "issued", "active", "cancelled", "expired", "lapsed"
]);

export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  policyNumber: varchar("policy_number").unique().notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  productId: varchar("product_id").references(() => products.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  customerEmail: varchar("customer_email").notNull(),
  customerName: varchar("customer_name").notNull(),
  customerPhone: varchar("customer_phone"),
  customerAddress: jsonb("customer_address").notNull(),
  coverageDetails: jsonb("coverage_details").notNull(),
  premium: decimal("premium", { precision: 10, scale: 2 }).notNull(),
  deductible: decimal("deductible", { precision: 10, scale: 2 }),
  status: policyStatusEnum("status").default("issued"),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  renewalDate: timestamp("renewal_date"),
  autoRenew: boolean("auto_renew").default(false),
  paymentMethod: varchar("payment_method"),
  resellerId: varchar("reseller_id").references(() => users.id),
  issuedBy: varchar("issued_by").references(() => users.id),
  documentsGenerated: boolean("documents_generated").default(false),
  signatureRequired: boolean("signature_required").default(true),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Claims
export const claimStatusEnum = pgEnum("claim_status", [
  "open", "review", "awaiting_docs", "estimate", "decision", "approved", "denied", "payout", "closed"
]);

export const claimTypeEnum = pgEnum("claim_type", [
  "collision", "comprehensive", "liability", "theft", "vandalism", "weather", "fire", "other"
]);

export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimNumber: varchar("claim_number").unique().notNull(),
  policyId: varchar("policy_id").references(() => policies.id),
  claimantName: varchar("claimant_name").notNull(),
  claimantEmail: varchar("claimant_email"),
  claimantPhone: varchar("claimant_phone"),
  type: claimTypeEnum("type").notNull(),
  status: claimStatusEnum("status").default("open"),
  dateOfLoss: timestamp("date_of_loss").notNull(),
  description: text("description").notNull(),
  estimatedAmount: decimal("estimated_amount", { precision: 10, scale: 2 }),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  deductibleAmount: decimal("deductible_amount", { precision: 10, scale: 2 }),
  payoutAmount: decimal("payout_amount", { precision: 10, scale: 2 }),
  adjusterId: varchar("adjuster_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  closedAt: timestamp("closed_at"),
  documents: jsonb("documents").default([]),
  notes: jsonb("notes").default([]),
  auditTrail: jsonb("audit_trail").default([]),
  fnolData: jsonb("fnol_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", "processing", "succeeded", "failed", "cancelled", "refunded"
]);

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  policyId: varchar("policy_id").references(() => policies.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  status: paymentStatusEnum("status").default("pending"),
  provider: varchar("provider").default("helcim"),
  providerTransactionId: varchar("provider_transaction_id"),
  providerResponse: jsonb("provider_response"),
  paymentMethod: varchar("payment_method"),
  customerEmail: varchar("customer_email"),
  description: text("description"),
  metadata: jsonb("metadata"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents
export const documentTypeEnum = pgEnum("document_type", [
  "policy_contract", "disclosure", "receipt", "id_card", "claim_document", "certificate"
]);

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  policyId: varchar("policy_id").references(() => policies.id),
  claimId: varchar("claim_id").references(() => claims.id),
  type: documentTypeEnum("type").notNull(),
  name: varchar("name").notNull(),
  filename: varchar("filename").notNull(),
  mimeType: varchar("mime_type"),
  fileSize: integer("file_size"),
  storageUrl: varchar("storage_url").notNull(),
  isPublic: boolean("is_public").default(false),
  generatedBy: varchar("generated_by"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics Events
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  eventType: varchar("event_type").notNull(), // page_view, quote_created, checkout_started, etc.
  entityType: varchar("entity_type"), // policy, claim, quote, etc.
  entityId: varchar("entity_id"),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  properties: jsonb("properties").default({}),
  utmData: jsonb("utm_data"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_analytics_events_type").on(table.eventType),
  index("idx_analytics_events_tenant").on(table.tenantId),
  index("idx_analytics_events_created").on(table.createdAt),
]);

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  provider: varchar("provider").notNull(), // helcim, docusign, etc.
  eventType: varchar("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  headers: jsonb("headers"),
  signature: varchar("signature"),
  verified: boolean("verified").default(false),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_webhooks_provider").on(table.provider),
  index("idx_webhooks_processed").on(table.processed),
]);

// Resellers
export const resellers = pgTable("resellers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  businessName: varchar("business_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  address: jsonb("address"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2}).default("0"),
  markup: decimal("markup", { precision: 5, scale: 2}).default("0"),
  subdomain: varchar("subdomain").unique(),
  customDomain: varchar("custom_domain"),
  branding: jsonb("branding").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const tenantRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  products: many(products),
  rateTables: many(rateTables),
  quotes: many(quotes),
  policies: many(policies),
  payments: many(payments),
  documents: many(documents),
  analyticsEvents: many(analyticsEvents),
  webhooks: many(webhooks),
  resellers: many(resellers),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  uploadedRateTables: many(rateTables),
  assignedClaims: many(claims),
  issuedPolicies: many(policies),
  uploadedDocuments: many(documents),
  analyticsEvents: many(analyticsEvents),
  reseller: one(resellers, {
    fields: [users.id],
    references: [resellers.userId],
  }),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  rateTables: many(rateTables),
  quotes: many(quotes),
  policies: many(policies),
}));

export const quoteRelations = relations(quotes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [quotes.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [quotes.productId],
    references: [products.id],
  }),
  vehicle: one(vehicles, {
    fields: [quotes.vehicleId],
    references: [vehicles.id],
  }),
  reseller: one(users, {
    fields: [quotes.resellerId],
    references: [users.id],
  }),
  policies: many(policies),
  payments: many(payments),
}));

export const policyRelations = relations(policies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [policies.tenantId],
    references: [tenants.id],
  }),
  quote: one(quotes, {
    fields: [policies.quoteId],
    references: [quotes.id],
  }),
  product: one(products, {
    fields: [policies.productId],
    references: [products.id],
  }),
  vehicle: one(vehicles, {
    fields: [policies.vehicleId],
    references: [vehicles.id],
  }),
  reseller: one(users, {
    fields: [policies.resellerId],
    references: [users.id],
  }),
  issuedBy: one(users, {
    fields: [policies.issuedBy],
    references: [users.id],
  }),
  claims: many(claims),
  payments: many(payments),
  documents: many(documents),
}));

export const claimRelations = relations(claims, ({ one, many }) => ({
  policy: one(policies, {
    fields: [claims.policyId],
    references: [policies.id],
  }),
  adjuster: one(users, {
    fields: [claims.adjusterId],
    references: [users.id],
  }),
  documents: many(documents),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  tenantId: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRateTableSchema = createInsertSchema(rateTables).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
});

export const insertResellerSchema = createInsertSchema(resellers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type Product = typeof products.$inferSelect;
export type RateTable = typeof rateTables.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Policy = typeof policies.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type Reseller = typeof resellers.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertRateTable = z.infer<typeof insertRateTableSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type InsertReseller = z.infer<typeof insertResellerSchema>;
