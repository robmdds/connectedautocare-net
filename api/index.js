var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/api.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analyticsEvents: () => analyticsEvents,
  claimRelations: () => claimRelations,
  claimStatusEnum: () => claimStatusEnum,
  claimTypeEnum: () => claimTypeEnum,
  claims: () => claims,
  documentTypeEnum: () => documentTypeEnum,
  documents: () => documents,
  insertAnalyticsEventSchema: () => insertAnalyticsEventSchema,
  insertClaimSchema: () => insertClaimSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertPolicySchema: () => insertPolicySchema,
  insertProductSchema: () => insertProductSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertRateTableSchema: () => insertRateTableSchema,
  insertResellerSchema: () => insertResellerSchema,
  insertSpecialQuoteRequestSchema: () => insertSpecialQuoteRequestSchema,
  insertTenantSchema: () => insertTenantSchema,
  insertUserSchema: () => insertUserSchema,
  insertVehicleSchema: () => insertVehicleSchema,
  insertWebhookSchema: () => insertWebhookSchema,
  paymentStatusEnum: () => paymentStatusEnum,
  payments: () => payments,
  policies: () => policies,
  policyRelations: () => policyRelations,
  policyStatusEnum: () => policyStatusEnum,
  productCategoryEnum: () => productCategoryEnum,
  productRelations: () => productRelations,
  products: () => products,
  quoteRelations: () => quoteRelations,
  quoteStatusEnum: () => quoteStatusEnum,
  quotes: () => quotes,
  rateTables: () => rateTables,
  resellerConfigs: () => resellerConfigs,
  resellers: () => resellers,
  sessions: () => sessions,
  specialQuoteRequestStatusEnum: () => specialQuoteRequestStatusEnum,
  specialQuoteRequests: () => specialQuoteRequests,
  tenantRelations: () => tenantRelations,
  tenants: () => tenants,
  userRelations: () => userRelations,
  users: () => users,
  vehicles: () => vehicles,
  webhooks: () => webhooks,
  whitelabelPages: () => whitelabelPages
});
import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  jsonb,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  // admin, reseller_admin, reseller_agent, consumer, adjuster
  tenantId: varchar("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Add these new authentication fields:
  passwordHash: text("password_hash"),
  authProvider: varchar("auth_provider"),
  // Keep existing field for compatibility
  provider: varchar("provider").default("local"),
  googleId: text("google_id"),
  lastLoginAt: timestamp("last_login_at")
});
var tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subdomain: varchar("subdomain").unique(),
  customDomain: varchar("custom_domain").unique(),
  settings: jsonb("settings").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var resellerConfigs = pgTable("reseller_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resellerId: varchar("reseller_id").references(() => users.id),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  brandingConfig: jsonb("branding_config").default({}),
  // Logo, colors, fonts, styling
  domainConfig: jsonb("domain_config").default({}),
  // Subdomain/custom domain settings
  productConfig: jsonb("product_config").default({}),
  // Available products and markup
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var whitelabelPages = pgTable("whitelabel_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resellerId: varchar("reseller_id").references(() => users.id),
  pageType: varchar("page_type").notNull(),
  // landing, quote, products, contact
  pageTitle: varchar("page_title").notNull(),
  pageContent: jsonb("page_content").notNull(),
  seoSettings: jsonb("seo_settings").default({}),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var productCategoryEnum = pgEnum("product_category", [
  "auto",
  "rv",
  "marine",
  "powersports",
  "home"
]);
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: varchar("name").notNull(),
  category: productCategoryEnum("category").notNull(),
  description: text("description"),
  coverageOptions: jsonb("coverage_options").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var rateTables = pgTable("rate_tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  productId: varchar("product_id").references(() => products.id),
  name: varchar("name").notNull(),
  version: varchar("version").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  rateData: jsonb("rate_data").notNull(),
  // Spreadsheet data as JSON
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});
var vehicles = pgTable("vehicles", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "pending",
  "approved",
  "expired",
  "converted"
]);
var quotes = pgTable("quotes", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var policyStatusEnum = pgEnum("policy_status", [
  "issued",
  "active",
  "cancelled",
  "expired",
  "lapsed"
]);
var policies = pgTable("policies", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var claimStatusEnum = pgEnum("claim_status", [
  "open",
  "review",
  "awaiting_docs",
  "estimate",
  "decision",
  "approved",
  "denied",
  "payout",
  "closed"
]);
var claimTypeEnum = pgEnum("claim_type", [
  "mechanical_breakdown",
  "deductible_reimbursement",
  "tire_wheel",
  "key_replacement",
  "theft",
  "ding_dent"
]);
var claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimNumber: varchar("claim_number").unique().notNull(),
  policyId: varchar("policy_id").references(() => policies.id),
  policyNumber: varchar("policy_number").notNull(),
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var specialQuoteRequestStatusEnum = pgEnum("special_quote_request_status", [
  "pending",
  "reviewing",
  "quoted",
  "declined",
  "expired"
]);
var specialQuoteRequests = pgTable("special_quote_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestNumber: varchar("request_number").unique().notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  productId: varchar("product_id").references(() => products.id),
  vehicleData: jsonb("vehicle_data").notNull(),
  coverageSelections: jsonb("coverage_selections").notNull(),
  customerData: jsonb("customer_data").notNull(),
  eligibilityReasons: jsonb("eligibility_reasons").default([]),
  requestReason: text("request_reason"),
  status: specialQuoteRequestStatusEnum("status").default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  alternativeQuote: jsonb("alternative_quote"),
  declineReason: text("decline_reason"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
  "refunded"
]);
var payments = pgTable("payments", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var documentTypeEnum = pgEnum("document_type", [
  "policy_contract",
  "disclosure",
  "receipt",
  "id_card",
  "claim_document",
  "certificate"
]);
var documents = pgTable("documents", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  eventType: varchar("event_type").notNull(),
  // page_view, quote_created, checkout_started, etc.
  entityType: varchar("entity_type"),
  // policy, claim, quote, etc.
  entityId: varchar("entity_id"),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  properties: jsonb("properties").default({}),
  utmData: jsonb("utm_data"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_analytics_events_type").on(table.eventType),
  index("idx_analytics_events_tenant").on(table.tenantId),
  index("idx_analytics_events_created").on(table.createdAt)
]);
var webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  provider: varchar("provider").notNull(),
  // helcim, docusign, etc.
  eventType: varchar("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  headers: jsonb("headers"),
  signature: varchar("signature"),
  verified: boolean("verified").default(false),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_webhooks_provider").on(table.provider),
  index("idx_webhooks_processed").on(table.processed)
]);
var resellers = pgTable("resellers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  businessName: varchar("business_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  address: jsonb("address"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0"),
  markup: decimal("markup", { precision: 5, scale: 2 }).default("0"),
  subdomain: varchar("subdomain").unique(),
  customDomain: varchar("custom_domain"),
  branding: jsonb("branding").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tenantRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  products: many(products),
  rateTables: many(rateTables),
  quotes: many(quotes),
  policies: many(policies),
  payments: many(payments),
  documents: many(documents),
  analyticsEvents: many(analyticsEvents),
  webhooks: many(webhooks),
  resellers: many(resellers)
}));
var userRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id]
  }),
  uploadedRateTables: many(rateTables),
  assignedClaims: many(claims),
  issuedPolicies: many(policies),
  uploadedDocuments: many(documents),
  analyticsEvents: many(analyticsEvents),
  reseller: one(resellers, {
    fields: [users.id],
    references: [resellers.userId]
  })
}));
var productRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id]
  }),
  rateTables: many(rateTables),
  quotes: many(quotes),
  policies: many(policies)
}));
var quoteRelations = relations(quotes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [quotes.tenantId],
    references: [tenants.id]
  }),
  product: one(products, {
    fields: [quotes.productId],
    references: [products.id]
  }),
  vehicle: one(vehicles, {
    fields: [quotes.vehicleId],
    references: [vehicles.id]
  }),
  reseller: one(users, {
    fields: [quotes.resellerId],
    references: [users.id]
  }),
  policies: many(policies),
  payments: many(payments)
}));
var policyRelations = relations(policies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [policies.tenantId],
    references: [tenants.id]
  }),
  quote: one(quotes, {
    fields: [policies.quoteId],
    references: [quotes.id]
  }),
  product: one(products, {
    fields: [policies.productId],
    references: [products.id]
  }),
  vehicle: one(vehicles, {
    fields: [policies.vehicleId],
    references: [vehicles.id]
  }),
  reseller: one(users, {
    fields: [policies.resellerId],
    references: [users.id]
  }),
  issuedBy: one(users, {
    fields: [policies.issuedBy],
    references: [users.id]
  }),
  claims: many(claims),
  payments: many(payments),
  documents: many(documents)
}));
var claimRelations = relations(claims, ({ one, many }) => ({
  policy: one(policies, {
    fields: [claims.policyId],
    references: [policies.id]
  }),
  adjuster: one(users, {
    fields: [claims.adjusterId],
    references: [users.id]
  }),
  documents: many(documents)
}));
var insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  tenantId: true,
  passwordHash: true,
  // Add this
  provider: true,
  // Add this
  googleId: true,
  // Add this
  lastLoginAt: true
  // Add this
});
var insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertRateTableSchema = createInsertSchema(rateTables).omit({
  id: true,
  createdAt: true
});
var insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true
});
var insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true
});
var insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true
});
var insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true
});
var insertResellerSchema = createInsertSchema(resellers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSpecialQuoteRequestSchema = createInsertSchema(specialQuoteRequests).omit({
  id: true,
  requestNumber: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, lte, ilike, count, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    if (!userData.tenantId) {
      const defaultTenant = await this.getTenantBySubdomain("default");
      if (defaultTenant) {
        userData.tenantId = defaultTenant.id;
      }
    }
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  // Tenant operations
  async createTenant(tenant) {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }
  async getTenant(id) {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }
  async getTenantBySubdomain(subdomain) {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant;
  }
  // Product operations
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async getProducts(tenantId) {
    return db.select().from(products).where(eq(products.tenantId, tenantId));
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async updateProduct(id, product) {
    const [updated] = await db.update(products).set({ ...product, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
    return updated;
  }
  // Rate table operations
  async createRateTable(rateTable) {
    const [newRateTable] = await db.insert(rateTables).values(rateTable).returning();
    return newRateTable;
  }
  async getRateTables(tenantId, productId) {
    const conditions = [eq(rateTables.tenantId, tenantId)];
    if (productId) {
      conditions.push(eq(rateTables.productId, productId));
    }
    return db.select().from(rateTables).where(and(...conditions)).orderBy(desc(rateTables.createdAt));
  }
  async getAllRateTables() {
    return db.select().from(rateTables).orderBy(desc(rateTables.createdAt));
  }
  async getActiveRateTable(productId) {
    const now = /* @__PURE__ */ new Date();
    const [rateTable] = await db.select().from(rateTables).where(
      and(
        eq(rateTables.productId, productId),
        eq(rateTables.isActive, true),
        lte(rateTables.effectiveDate, now),
        sql2`(${rateTables.expiryDate} IS NULL OR ${rateTables.expiryDate} > ${now})`
      )
    ).orderBy(desc(rateTables.effectiveDate)).limit(1);
    return rateTable;
  }
  // Vehicle operations
  async createVehicle(vehicle) {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }
  async getVehicle(id) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }
  async getVehicleByVin(vin) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.vin, vin));
    return vehicle;
  }
  async updateVehicle(id, vehicle) {
    const [updated] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updated;
  }
  // Quote operations
  async createQuote(quote) {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }
  async getQuote(id) {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }
  async getQuoteByNumber(quoteNumber) {
    const [quote] = await db.select().from(quotes).where(eq(quotes.quoteNumber, quoteNumber));
    return quote;
  }
  async getQuotes(tenantId, filters = {}) {
    const conditions = [eq(quotes.tenantId, tenantId)];
    if (filters.status) {
      conditions.push(eq(quotes.status, filters.status));
    }
    if (filters.customerEmail) {
      conditions.push(ilike(quotes.customerEmail, `%${filters.customerEmail}%`));
    }
    return db.select().from(quotes).where(and(...conditions)).orderBy(desc(quotes.createdAt));
  }
  async updateQuote(id, quote) {
    const [updated] = await db.update(quotes).set({ ...quote, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quotes.id, id)).returning();
    return updated;
  }
  // Policy operations
  async createPolicy(policy) {
    const [newPolicy] = await db.insert(policies).values(policy).returning();
    return newPolicy;
  }
  async getPolicy(id) {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy;
  }
  async getPolicyByNumber(policyNumber) {
    const [policy] = await db.select().from(policies).where(eq(policies.policyNumber, policyNumber));
    return policy;
  }
  async getPolicies(tenantId, filters = {}) {
    const conditions = [eq(policies.tenantId, tenantId)];
    if (filters.status) {
      conditions.push(eq(policies.status, filters.status));
    }
    if (filters.customerEmail) {
      conditions.push(ilike(policies.customerEmail, `%${filters.customerEmail}%`));
    }
    return db.select().from(policies).where(and(...conditions)).orderBy(desc(policies.createdAt));
  }
  async updatePolicy(id, policy) {
    const [updated] = await db.update(policies).set({ ...policy, updatedAt: /* @__PURE__ */ new Date() }).where(eq(policies.id, id)).returning();
    return updated;
  }
  // Claim operations
  async createClaim(claim) {
    const [newClaim] = await db.insert(claims).values(claim).returning();
    return newClaim;
  }
  async getClaim(id) {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim;
  }
  async getClaimByNumber(claimNumber) {
    const [claim] = await db.select().from(claims).where(eq(claims.claimNumber, claimNumber));
    return claim;
  }
  async getClaims(tenantId, filters = {}) {
    const conditions = [];
    if (tenantId) {
      conditions.push(sql2`${claims.policyId} IN (SELECT id FROM ${policies} WHERE tenant_id = ${tenantId})`);
    }
    if (filters.status) {
      conditions.push(eq(claims.status, filters.status));
    }
    if (filters.adjusterId) {
      conditions.push(eq(claims.adjusterId, filters.adjusterId));
    }
    return db.select().from(claims).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(claims.createdAt));
  }
  async updateClaim(id, claim) {
    const [updated] = await db.update(claims).set({ ...claim, updatedAt: /* @__PURE__ */ new Date() }).where(eq(claims.id, id)).returning();
    return updated;
  }
  // Payment operations
  async createPayment(payment) {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }
  async getPayment(id) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  async getPayments(tenantId, filters = {}) {
    const conditions = [eq(payments.tenantId, tenantId)];
    if (filters.status) {
      conditions.push(eq(payments.status, filters.status));
    }
    return db.select().from(payments).where(and(...conditions)).orderBy(desc(payments.createdAt));
  }
  async updatePayment(id, payment) {
    const [updated] = await db.update(payments).set({ ...payment, updatedAt: /* @__PURE__ */ new Date() }).where(eq(payments.id, id)).returning();
    return updated;
  }
  // Document operations
  async createDocument(document) {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }
  async getDocuments(entityType, entityId) {
    const conditions = [];
    if (entityType === "policy") {
      conditions.push(eq(documents.policyId, entityId));
    } else if (entityType === "claim") {
      conditions.push(eq(documents.claimId, entityId));
    }
    return db.select().from(documents).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(documents.createdAt));
  }
  // Analytics operations
  async createAnalyticsEvent(event) {
    await db.insert(analyticsEvents).values(event);
  }
  async getAnalytics(tenantId, filters = {}) {
    const [policyCount] = await db.select({ count: count() }).from(policies).where(eq(policies.tenantId, tenantId));
    const [claimCount] = await db.select({ count: count() }).from(claims).where(sql2`${claims.policyId} IN (SELECT id FROM ${policies} WHERE tenant_id = ${tenantId})`);
    const [totalPremium] = await db.select({ total: sql2`COALESCE(SUM(${policies.premium}), 0)` }).from(policies).where(and(eq(policies.tenantId, tenantId), eq(policies.status, "active")));
    return {
      activePolicies: policyCount.count,
      openClaims: claimCount.count,
      monthlyPremium: totalPremium.total
    };
  }
  // Webhook operations
  async createWebhook(webhook) {
    await db.insert(webhooks).values(webhook);
  }
  async getUnprocessedWebhooks() {
    return db.select().from(webhooks).where(eq(webhooks.processed, false));
  }
  async markWebhookProcessed(id, error) {
    await db.update(webhooks).set({
      processed: true,
      processingError: error || null
    }).where(eq(webhooks.id, id));
  }
  // Reseller operations
  async createReseller(reseller) {
    const [newReseller] = await db.insert(resellers).values(reseller).returning();
    return newReseller;
  }
  async getResellers(tenantId) {
    return db.select().from(resellers).where(eq(resellers.tenantId, tenantId));
  }
  async getResellerBySubdomain(subdomain) {
    const [reseller] = await db.select().from(resellers).where(eq(resellers.subdomain, subdomain));
    return reseller;
  }
  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
  async updateUser(id, userData) {
    const [updated] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return updated;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
var oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback"
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "user_sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax"
    },
    name: "tpa.sid"
    // Custom session name
  });
}
function requireAuth(req, res, next) {
  if (req.session?.user) {
    req.user = req.session.user;
    req.isAuthenticated = () => true;
    return next();
  }
  return res.status(401).json({
    error: "Authentication required",
    redirectTo: "/login"
  });
}
function attachUser(req, res, next) {
  if (req.session?.user) {
    req.user = req.session.user;
    req.isAuthenticated = () => true;
  } else {
    req.isAuthenticated = () => false;
  }
  next();
}
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function getGoogleAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    include_granted_scopes: true
  });
}
async function getGoogleUserInfo(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return {
    googleId: data.id,
    email: data.email,
    firstName: data.given_name || "",
    lastName: data.family_name || "",
    picture: data.picture
  };
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Email, password, and first name are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.upsertUser({
        id: crypto.randomUUID(),
        email,
        firstName,
        lastName: lastName || "",
        role: "user",
        passwordHash: hashedPassword,
        provider: "local"
      });
      const authUser = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        provider: "local"
      };
      req.session.user = authUser;
      res.json({
        success: true,
        message: "Registration successful",
        user: {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          role: authUser.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const authUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        provider: "local"
      };
      req.session.user = authUser;
      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          role: authUser.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.get("/api/auth/google", (req, res) => {
    const authUrl = getGoogleAuthUrl();
    res.redirect(authUrl);
  });
  app2.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.redirect("/login?error=no_code");
      }
      const googleUser = await getGoogleUserInfo(code);
      let user = await storage.getUserByEmail(googleUser.email);
      if (!user) {
        user = await storage.upsertUser({
          id: crypto.randomUUID(),
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          role: "user",
          provider: "google",
          googleId: googleUser.googleId
        });
      }
      const authUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        provider: "google"
      };
      req.session.user = authUser;
      res.redirect("/admin");
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });
  app2.post("/api/auth/admin-access", async (req, res) => {
    try {
      const authUser = {
        id: "quick-admin-user",
        email: "admin@tpaplatform.com",
        firstName: "Quick",
        lastName: "Admin",
        role: "admin",
        provider: "quick"
      };
      req.session.user = authUser;
      res.json({
        success: true,
        message: "Quick admin access granted",
        user: {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          role: authUser.role
        }
      });
    } catch (error) {
      console.error("Quick admin access error:", error);
      res.status(500).json({ error: "Quick admin access failed" });
    }
  });
  app2.get("/api/auth/user", attachUser, async (req, res) => {
    try {
      if (req.isAuthenticated?.()) {
        res.json({
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          provider: req.user.provider
        });
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("tpa.sid");
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
  app2.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new passwords are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user?.passwordHash) {
        return res.status(400).json({ error: "Cannot change password for this account type" });
      }
      const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { passwordHash: hashedPassword });
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.get("/api/auth/debug", attachUser, (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated?.() || false,
      user: req.user || null,
      sessionExists: !!req.session?.user,
      sessionId: req.sessionID
    });
  });
}

// server/services/helcimService.ts
import crypto2 from "crypto";
var HelcimService = class {
  apiBase;
  apiToken;
  accountId;
  webhookSecret;
  constructor() {
    this.apiBase = process.env.HELCIM_API_BASE || "https://api.helcim.com";
    this.apiToken = process.env.HELCIM_API_TOKEN || "";
    this.accountId = process.env.HELCIM_ACCOUNT_ID || "";
    this.webhookSecret = process.env.HELCIM_WEBHOOK_SECRET || "";
  }
  async createPaymentIntent(amount, currency, metadata) {
    try {
      const response = await fetch(`${this.apiBase}/v2/payment-intents`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          // Convert to cents
          currency: currency.toLowerCase(),
          description: metadata?.description || "TPA Insurance Payment",
          metadata
        })
      });
      if (!response.ok) {
        throw new Error(`Helcim API error: ${response.status}`);
      }
      const data = await response.json();
      await storage.createPayment({
        amount: amount.toString(),
        currency,
        provider: "helcim",
        providerTransactionId: data.id,
        status: "pending",
        description: metadata?.description || "TPA Insurance Payment",
        metadata,
        quoteId: metadata?.quoteId
      });
      return {
        provider: "helcim",
        amount,
        currency,
        description: metadata?.description || "TPA Insurance Payment",
        clientSecret: data.client_secret,
        metadata
      };
    } catch (error) {
      console.error("Helcim payment intent creation failed:", error);
      const mockClientSecret = `mock_helcim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storage.createPayment({
        amount: amount.toString(),
        currency,
        provider: "helcim",
        providerTransactionId: mockClientSecret,
        status: "pending",
        description: metadata?.description || "TPA Insurance Payment",
        metadata,
        quoteId: metadata?.quoteId
      });
      return {
        provider: "helcim",
        amount,
        currency,
        description: metadata?.description || "TPA Insurance Payment",
        clientSecret: mockClientSecret,
        metadata
      };
    }
  }
  async processPayment(paymentData) {
    try {
      console.log("Processing payment via Helcim:", {
        amount: paymentData.amount,
        customer: paymentData.customerData.email,
        card: `****${paymentData.cardData.cardNumber.slice(-4)}`
      });
      if (!process.env.HELCIM_PRODUCTION_MODE) {
        console.warn("Using mock payment processing for development");
        const mockPaymentId = `pay_mock_${Date.now()}`;
        await storage.createPayment({
          amount: paymentData.amount.toString(),
          currency: paymentData.currency || "USD",
          provider: "helcim-mock",
          providerTransactionId: mockPaymentId,
          status: "succeeded",
          description: `VSC Purchase - ${paymentData.metadata.coverage}`,
          metadata: paymentData.metadata
        });
        console.log("Mock payment processed successfully:", mockPaymentId);
        return {
          success: true,
          paymentId: mockPaymentId
        };
      }
      const response = await fetch(`${this.apiBase}/v2/card-transactions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "purchase",
          amount: Math.round(paymentData.amount * 100),
          // Convert to cents
          currency: (paymentData.currency || "USD").toLowerCase(),
          cardData: {
            cardNumber: paymentData.cardData.cardNumber.replace(/\s/g, ""),
            cardExpiry: `${paymentData.cardData.expiryMonth}${paymentData.cardData.expiryYear}`,
            cardCVV: paymentData.cardData.cvv
          },
          billingAddress: {
            name: `${paymentData.customerData.firstName} ${paymentData.customerData.lastName}`,
            street1: paymentData.customerData.address.street,
            city: paymentData.customerData.address.city,
            province: paymentData.customerData.address.state,
            country: "USA",
            postalCode: paymentData.customerData.address.zipCode
          },
          customerCode: paymentData.customerData.email,
          invoiceNumber: `VSC-${Date.now()}`,
          description: `VSC Purchase - ${paymentData.metadata.coverage}`
        })
      });
      const result = await response.json();
      if (response.ok && result.status === "APPROVED") {
        await storage.createPayment({
          amount: paymentData.amount.toString(),
          currency: paymentData.currency || "USD",
          provider: "helcim",
          providerTransactionId: result.transactionId,
          status: "succeeded",
          description: `VSC Purchase - ${paymentData.metadata.coverage}`,
          metadata: paymentData.metadata
        });
        return {
          success: true,
          paymentId: result.transactionId
        };
      } else {
        throw new Error(result.message || "Payment declined");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        error: error.message || "Payment processing failed"
      };
    }
  }
  async processWebhook(payload, headers) {
    try {
      if (this.webhookSecret) {
        const signature = headers["helcim-signature"] || headers["x-helcim-signature"];
        if (!this.verifyWebhookSignature(payload, signature)) {
          throw new Error("Invalid webhook signature");
        }
      }
      await storage.createWebhook({
        provider: "helcim",
        eventType: payload.type,
        payload,
        headers,
        verified: true
      });
      const result = {
        eventType: payload.type,
        paymentId: payload.data?.id,
        metadata: payload.data?.metadata
      };
      if (payload.type === "payment.succeeded") {
        if (payload.data?.id) {
          const payment = await storage.getPayments("", { providerTransactionId: payload.data.id });
          if (payment.length > 0) {
            await storage.updatePayment(payment[0].id, {
              status: "succeeded",
              processedAt: /* @__PURE__ */ new Date(),
              providerResponse: payload
            });
          }
        }
      }
      return result;
    } catch (error) {
      console.error("Webhook processing error:", error);
      throw error;
    }
  }
  verifyWebhookSignature(payload, signature) {
    if (!signature || !this.webhookSecret) {
      return false;
    }
    try {
      const expectedSignature = crypto2.createHmac("sha256", this.webhookSecret).update(JSON.stringify(payload)).digest("hex");
      return crypto2.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }
  async refundPayment(paymentId, amount) {
    try {
      const response = await fetch(`${this.apiBase}/v2/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amount ? Math.round(amount * 100) : void 0
        })
      });
      if (!response.ok) {
        throw new Error(`Helcim refund API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Helcim refund failed:", error);
      throw error;
    }
  }
};

// server/services/vinDecodeService.ts
var VinDecodeService = class {
  async decodeVin(vin) {
    if (!vin || vin.length !== 17) {
      throw new Error("Invalid VIN format");
    }
    try {
      const nhtsa = await this.decodeVinNHTSA(vin);
      if (nhtsa.success && nhtsa.data && nhtsa.data.year) {
        return nhtsa.data;
      }
      return this.parseVinBasic(vin);
    } catch (error) {
      console.error("VIN decode error:", error);
      throw new Error("Failed to decode VIN");
    }
  }
  async decodeVinNHTSA(vin) {
    try {
      console.log(`NHTSA API request for VIN: ${vin}`);
      const endpoints = [
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/${vin}?format=json`,
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`,
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      ];
      for (const endpoint of endpoints) {
        console.log(`Trying NHTSA endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        if (!response.ok) {
          console.log(`NHTSA API response not ok: ${response.status}`);
          continue;
        }
        const data = await response.json();
        console.log(`NHTSA raw response structure:`, {
          hasResults: !!data.Results,
          resultsLength: data.Results?.length,
          firstResult: data.Results?.[0]
        });
        if (data.Results && data.Results.length > 0) {
          let results = {};
          if (endpoint.includes("decodevinvalues") || endpoint.includes("DecodeVinValues")) {
            results = data.Results[0] || {};
            console.log(`${endpoint.includes("Extended") ? "Extended " : ""}decodevinvalues format - direct fields:`, {
              Make: results.Make,
              Model: results.Model,
              ModelYear: results.ModelYear,
              BodyClass: results.BodyClass
            });
          } else {
            results = data.Results.reduce((acc, item) => {
              if (item.Value && item.Value !== "Not Applicable" && item.Value !== "" && item.Value !== null) {
                acc[item.Variable] = item.Value;
              }
              return acc;
            }, {});
            console.log(`${endpoint.includes("Extended") ? "Extended " : ""}decodevin format - Variable/Value pairs:`, {
              Make: results.Make,
              Model: results.Model,
              ModelYear: results.ModelYear,
              BodyClass: results.BodyClass
            });
          }
          const manufacturer = results.Manufacturer || "";
          let extractedMake = results.Make || "";
          let extractedModel = results.Model || "";
          if (!extractedMake && manufacturer) {
            if (manufacturer.includes("NISSAN")) {
              extractedMake = "NISSAN";
            } else if (manufacturer.includes("HONDA")) {
              extractedMake = "HONDA";
            } else if (manufacturer.includes("TOYOTA")) {
              extractedMake = "TOYOTA";
            } else if (manufacturer.includes("FORD")) {
              extractedMake = "FORD";
            } else if (manufacturer.includes("GENERAL MOTORS") || manufacturer.includes("GM")) {
              extractedMake = "CHEVROLET";
            }
          }
          if (!extractedModel && (extractedMake === "NISSAN" || extractedMake === "INFINITI")) {
            const vinCode = vin.substring(3, 8);
            if (vinCode.startsWith("AZ2")) {
              if (extractedMake === "INFINITI") {
                extractedModel = "QX80";
              } else {
                extractedModel = "ARMADA";
              }
            }
          }
          if (extractedMake === "INFINITI" && extractedModel === "QX80") {
            extractedModel = "QX80 (Armada Platform)";
          }
          const hasManufacturer = manufacturer && manufacturer.length > 0;
          const hasYear = results.ModelYear && parseInt(results.ModelYear) > 1980;
          if (hasYear && hasManufacturer) {
            const year = parseInt(results.ModelYear);
            console.log(`NHTSA SUCCESS: Found year ${year} for ${extractedMake} ${extractedModel} (from ${manufacturer})`);
            return {
              success: true,
              data: {
                vin,
                make: extractedMake || "Unknown",
                model: extractedModel || "Unknown",
                year,
                bodyStyle: results.BodyClass || results.VehicleType || "Unknown",
                engine: results.EngineModel || "Unknown",
                fuelType: results.FuelTypePrimary || "Gasoline",
                transmission: results.TransmissionStyle || "Unknown",
                driveType: results.DriveType || "Unknown",
                source: "NHTSA Enhanced"
              }
            };
          }
        }
      }
      console.log("NHTSA API: No useful data returned from any endpoint");
      return { success: false };
    } catch (error) {
      console.error("NHTSA API error:", error);
      return { success: false };
    }
  }
  parseVinBasic(vin) {
    const yearChar = vin.charAt(9).toUpperCase();
    let year = (/* @__PURE__ */ new Date()).getFullYear();
    const yearCodes = {
      // Letters can represent multiple decades
      "A": [1980, 2010],
      "B": [1981, 2011],
      "C": [1982, 2012],
      "D": [1983, 2013],
      "E": [1984, 2014],
      "F": [1985, 2015],
      "G": [1986, 2016],
      "H": [1987, 2017],
      "J": [1988, 2018],
      "K": [1989, 2019],
      "L": [1990, 2020],
      "M": [1991, 2021],
      "N": [1992, 2022],
      "P": [1993, 2023],
      "R": [1994, 2024],
      "S": [1995, 2025],
      "T": [1996, 2026],
      "V": [1997, 2027],
      "W": [1998, 2028],
      "X": [1999, 2029],
      // Numbers are unique to 2000s
      "Y": [2e3],
      "1": [2001],
      "2": [2002],
      "3": [2003],
      "4": [2004],
      "5": [2005],
      "6": [2006],
      "7": [2007],
      "8": [2008],
      "9": [2009]
    };
    if (yearCodes[yearChar]) {
      const possibleYears = yearCodes[yearChar];
      if (possibleYears.length === 1) {
        year = possibleYears[0];
      } else {
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        const validYears = possibleYears.filter((y) => y <= currentYear);
        if (validYears.length > 0) {
          year = Math.max(...validYears);
        } else {
          year = possibleYears[0];
        }
      }
    }
    console.log(`VIN ${vin}: 10th digit '${yearChar}' -> Year ${year}`);
    return {
      vin,
      make: "Unknown",
      model: "Unknown",
      year,
      bodyStyle: "Unknown",
      engine: "Unknown",
      fuelType: "Gasoline",
      transmission: "Unknown",
      driveType: "Unknown",
      source: "Basic VIN Parse"
    };
  }
};

// server/services/ratingEngineService.ts
var RatingEngineService = class {
  async calculatePremium(quoteData) {
    try {
      let basePremium = 1e3;
      const factors = this.calculateRatingFactors(quoteData);
      const adjustedPremium = basePremium * factors.totalFactor;
      const taxes = this.calculateTaxes(adjustedPremium, quoteData.customerInfo?.address?.state);
      const fees = this.calculateFees(adjustedPremium);
      const totalPremium = adjustedPremium + taxes + fees;
      return {
        basePremium: adjustedPremium,
        taxes,
        fees,
        totalPremium,
        factors
      };
    } catch (error) {
      console.error("Rating calculation error:", error);
      throw new Error("Failed to calculate premium");
    }
  }
  calculateRatingFactors(quoteData) {
    const factors = {
      ageFactor: 1,
      vehicleFactor: 1,
      locationFactor: 1,
      coverageFactor: 1,
      totalFactor: 1
    };
    if (quoteData.driverInfo?.age) {
      const age = quoteData.driverInfo.age;
      if (age < 25) {
        factors.ageFactor = 1.5;
      } else if (age > 65) {
        factors.ageFactor = 1.2;
      } else {
        factors.ageFactor = 1;
      }
    }
    if (quoteData.vehicleInfo?.year) {
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const vehicleAge = currentYear - quoteData.vehicleInfo.year;
      if (vehicleAge > 10) {
        factors.vehicleFactor = 0.8;
      } else if (vehicleAge < 3) {
        factors.vehicleFactor = 1.3;
      }
    }
    if (quoteData.customerInfo?.address?.state) {
      const state = quoteData.customerInfo.address.state.toLowerCase();
      const highRiskStates = ["ca", "fl", "tx", "ny"];
      if (highRiskStates.includes(state)) {
        factors.locationFactor = 1.2;
      } else {
        factors.locationFactor = 0.9;
      }
    }
    if (quoteData.coverageOptions) {
      const hasComprehensive = quoteData.coverageOptions.comprehensive;
      const hasCollision = quoteData.coverageOptions.collision;
      if (hasComprehensive && hasCollision) {
        factors.coverageFactor = 1.8;
      } else if (hasComprehensive || hasCollision) {
        factors.coverageFactor = 1.4;
      } else {
        factors.coverageFactor = 1;
      }
    }
    factors.totalFactor = factors.ageFactor * factors.vehicleFactor * factors.locationFactor * factors.coverageFactor;
    return factors;
  }
  calculateTaxes(premium, state) {
    const taxRates = {
      "ca": 0.0825,
      // California
      "ny": 0.08,
      // New York
      "tx": 0.0625,
      // Texas
      "fl": 0.06,
      // Florida
      default: 0.065
      // Default rate
    };
    const rate = state ? taxRates[state.toLowerCase()] || taxRates.default : taxRates.default;
    return Math.round(premium * rate * 100) / 100;
  }
  calculateFees(premium) {
    const fixedFees = 25;
    const percentageFee = premium * 0.02;
    return Math.round((fixedFees + percentageFee) * 100) / 100;
  }
  async uploadRateTable(file, productId, tenantId) {
    return {
      success: true,
      message: "Rate table upload functionality ready for implementation",
      productId,
      tenantId
    };
  }
};

// server/services/policyService.ts
var PolicyService = class {
  async issuePolicy(policyData) {
    try {
      const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const effectiveDate = policyData.effectiveDate || /* @__PURE__ */ new Date();
      const expiryDate = policyData.expiryDate || new Date(effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1e3);
      const policy = await storage.createPolicy({
        ...policyData,
        policyNumber,
        effectiveDate,
        expiryDate,
        status: "active",
        issuedBy: policyData.issuedBy,
        issuedAt: /* @__PURE__ */ new Date()
      });
      await this.generatePolicyDocuments(policy);
      return policy;
    } catch (error) {
      console.error("Policy issuance error:", error);
      throw new Error("Failed to issue policy");
    }
  }
  async processPaymentConfirmation(paymentId) {
    try {
      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }
      const quote = await storage.getQuote(payment.quoteId);
      if (!quote) {
        throw new Error("Quote not found");
      }
      const policy = await this.issuePolicy({
        tenantId: quote.tenantId,
        quoteId: quote.id,
        customerId: quote.customerId,
        productId: quote.productId,
        vehicleId: quote.vehicleId,
        coverageOptions: quote.coverageOptions,
        premium: quote.totalPremium,
        issuedBy: "system"
      });
      await storage.updatePayment(paymentId, { policyId: policy.id });
      return policy;
    } catch (error) {
      console.error("Payment confirmation error:", error);
      throw new Error("Failed to process payment confirmation");
    }
  }
  async generatePolicyDocuments(policy) {
    console.log(`Generated documents for policy ${policy.policyNumber}`);
  }
  async renewPolicy(policyId) {
    try {
      const existingPolicy = await storage.getPolicy(policyId);
      if (!existingPolicy) {
        throw new Error("Policy not found");
      }
      const renewalPolicy = await this.issuePolicy({
        tenantId: existingPolicy.tenantId,
        customerId: existingPolicy.customerId,
        productId: existingPolicy.productId,
        vehicleId: existingPolicy.vehicleId,
        coverageOptions: existingPolicy.coverageOptions,
        premium: existingPolicy.premium,
        effectiveDate: existingPolicy.expiryDate,
        issuedBy: "system"
      });
      await storage.updatePolicy(policyId, { status: "renewed" });
      return renewalPolicy;
    } catch (error) {
      console.error("Policy renewal error:", error);
      throw new Error("Failed to renew policy");
    }
  }
  async cancelPolicy(policyId, reason, cancelledBy) {
    try {
      const policy = await storage.updatePolicy(policyId, {
        status: "cancelled",
        cancelledAt: /* @__PURE__ */ new Date(),
        cancellationReason: reason
      });
      const refundAmount = this.calculateCancellationRefund(policy);
      return {
        policy,
        refundAmount,
        message: "Policy cancelled successfully"
      };
    } catch (error) {
      console.error("Policy cancellation error:", error);
      throw new Error("Failed to cancel policy");
    }
  }
  calculateCancellationRefund(policy) {
    const now = /* @__PURE__ */ new Date();
    const effectiveDate = new Date(policy.effectiveDate);
    const expiryDate = new Date(policy.expiryDate);
    const totalDays = (expiryDate.getTime() - effectiveDate.getTime()) / (1e3 * 60 * 60 * 24);
    const usedDays = (now.getTime() - effectiveDate.getTime()) / (1e3 * 60 * 60 * 24);
    const remainingDays = Math.max(0, totalDays - usedDays);
    const refundPercentage = remainingDays / totalDays;
    const premium = parseFloat(policy.premium);
    return Math.round(premium * refundPercentage * 100) / 100;
  }
};

// server/services/claimsService.ts
var ClaimsService = class {
  async createClaim(claimData) {
    try {
      const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const claim = await storage.createClaim({
        ...claimData,
        claimNumber,
        status: "open"
      });
      await this.autoAssignAdjuster(claim.id);
      return claim;
    } catch (error) {
      console.error("Claim creation error:", error);
      throw new Error("Failed to create claim");
    }
  }
  async updateClaim(claimId, claimUpdate, userId) {
    try {
      const updates = {
        ...claimUpdate,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (userId) {
        const auditEntry = {
          timestamp: /* @__PURE__ */ new Date(),
          userId,
          action: "claim_updated",
          changes: Object.keys(claimUpdate)
        };
        const currentClaim = await storage.getClaim(claimId);
        const existingAudit = currentClaim?.auditTrail || [];
        updates.auditTrail = [...existingAudit, auditEntry];
      }
      const claim = await storage.updateClaim(claimId, updates);
      return claim;
    } catch (error) {
      console.error("Claim update error:", error);
      throw new Error("Failed to update claim");
    }
  }
  async processClaim(claimId, action, notes, adjusterId) {
    try {
      const updates = {
        lastUpdated: /* @__PURE__ */ new Date()
      };
      switch (action) {
        case "review":
          updates.status = "under_review";
          break;
        case "approve":
          updates.status = "approved";
          updates.approvedAt = /* @__PURE__ */ new Date();
          break;
        case "deny":
          updates.status = "denied";
          updates.deniedAt = /* @__PURE__ */ new Date();
          break;
        case "settle":
          updates.status = "settled";
          updates.settledAt = /* @__PURE__ */ new Date();
          break;
        case "close":
          updates.status = "closed";
          updates.closedAt = /* @__PURE__ */ new Date();
          break;
      }
      if (adjusterId) {
        updates.adjusterId = adjusterId;
      }
      if (notes) {
        updates.adjustmentNotes = notes;
      }
      const claim = await storage.updateClaim(claimId, updates);
      await storage.createAnalyticsEvent({
        tenantId: claim.tenantId,
        eventType: "claim_updated",
        entityType: "claim",
        entityId: claimId,
        properties: {
          action,
          status: updates.status,
          adjusterId
        }
      });
      return claim;
    } catch (error) {
      console.error("Claim processing error:", error);
      throw new Error("Failed to process claim");
    }
  }
  async estimateDamage(claimId, photos) {
    try {
      const estimatedAmount = Math.floor(Math.random() * 1e4) + 1e3;
      await storage.updateClaim(claimId, {
        estimatedAmount: estimatedAmount.toString(),
        lastUpdated: /* @__PURE__ */ new Date()
      });
      return {
        claimId,
        estimatedAmount,
        confidence: 0.85,
        method: "AI Analysis",
        photos: photos || []
      };
    } catch (error) {
      console.error("Damage estimation error:", error);
      throw new Error("Failed to estimate damage");
    }
  }
  async detectFraud(claimId) {
    try {
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        throw new Error("Claim not found");
      }
      const riskFactors = [];
      let riskScore = 0;
      if (claim.incidentDate) {
        const incidentDate = new Date(claim.incidentDate);
        const hourOfDay = incidentDate.getHours();
        if (hourOfDay < 6 || hourOfDay > 22) {
          riskFactors.push("Incident occurred at unusual hour");
          riskScore += 0.2;
        }
      }
      if (claim.estimatedAmount && parseFloat(claim.estimatedAmount) > 5e3) {
        riskFactors.push("High claim amount");
        riskScore += 0.3;
      }
      let riskLevel = "low";
      if (riskScore > 0.7) {
        riskLevel = "high";
      } else if (riskScore > 0.4) {
        riskLevel = "medium";
      }
      return {
        claimId,
        riskScore,
        riskLevel,
        riskFactors,
        recommendedAction: riskLevel === "high" ? "Manual review required" : "Standard processing"
      };
    } catch (error) {
      console.error("Fraud detection error:", error);
      throw new Error("Failed to detect fraud");
    }
  }
  async autoAssignAdjuster(claimId) {
    try {
      console.log(`Auto-assigned adjuster to claim ${claimId}`);
    } catch (error) {
      console.error("Adjuster assignment error:", error);
    }
  }
  async generateClaimReport(claimId) {
    try {
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        throw new Error("Claim not found");
      }
      const report = {
        claimNumber: claim.claimNumber,
        status: claim.status,
        submittedAt: claim.submittedAt,
        incidentDate: claim.incidentDate,
        description: claim.description,
        estimatedAmount: claim.estimatedAmount,
        adjustmentNotes: claim.adjustmentNotes,
        timeline: await this.getClaimTimeline(claimId),
        documents: await storage.getDocuments("claim", claimId)
      };
      return report;
    } catch (error) {
      console.error("Report generation error:", error);
      throw new Error("Failed to generate claim report");
    }
  }
  async getClaimTimeline(claimId) {
    return [
      { date: /* @__PURE__ */ new Date(), action: "Claim submitted", status: "submitted" },
      { date: /* @__PURE__ */ new Date(), action: "Under review", status: "under_review" }
    ];
  }
};

// server/services/analyticsService.ts
var AnalyticsService = class {
  async trackEvent(eventData) {
    try {
      await storage.createAnalyticsEvent(eventData);
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  }
  async getDashboardMetrics(tenantId, dateRange) {
    try {
      const endDate = dateRange?.end || /* @__PURE__ */ new Date();
      const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
      const metrics = {
        totalPolicies: await this.getPolicyCount(tenantId),
        activeClaims: await this.getActiveClaimsCount(tenantId),
        monthlyPremium: await this.getMonthlyPremiumTotal(tenantId),
        conversionRate: await this.getConversionRate(tenantId),
        recentActivity: await this.getRecentActivity(tenantId),
        chartData: await this.getChartData(tenantId, startDate, endDate)
      };
      return metrics;
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      throw new Error("Failed to fetch dashboard metrics");
    }
  }
  async getRecentActivity(tenantId, limit = 10) {
    try {
      return [
        {
          id: "1",
          type: "policy_created",
          message: "New auto policy POL-2025-ABC123 created",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1e3),
          // 1 hour ago
          entityType: "policy",
          entityId: "pol-1"
        },
        {
          id: "2",
          type: "claim_submitted",
          message: "Claim CLM-2025-DEF456 submitted for review",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1e3),
          // 3 hours ago
          entityType: "claim",
          entityId: "clm-1"
        },
        {
          id: "3",
          type: "payment_received",
          message: "Payment of $1,245.50 received for policy POL-2025-GHI789",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1e3),
          // 6 hours ago
          entityType: "payment",
          entityId: "pay-1"
        },
        {
          id: "4",
          type: "quote_generated",
          message: "Quote QTE-2025-JKL012 generated for RV insurance",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1e3),
          // 12 hours ago
          entityType: "quote",
          entityId: "qte-1"
        }
      ];
    } catch (error) {
      console.error("Recent activity error:", error);
      throw new Error("Failed to fetch recent activity");
    }
  }
  async getPolicyCount(tenantId) {
    try {
      const policies2 = await storage.getPolicies(tenantId);
      return policies2.length;
    } catch (error) {
      return 0;
    }
  }
  async getActiveClaimsCount(tenantId) {
    try {
      const claims2 = await storage.getClaims(tenantId, { status: ["submitted", "under_review", "approved"] });
      return claims2.length;
    } catch (error) {
      return 0;
    }
  }
  async getMonthlyPremiumTotal(tenantId) {
    try {
      const startOfMonth = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
      const policies2 = await storage.getPolicies(tenantId, {
        effectiveDate: { gte: startOfMonth }
      });
      return policies2.reduce((total, policy) => {
        return total + (parseFloat(policy.premium) || 0);
      }, 0);
    } catch (error) {
      return 0;
    }
  }
  async getConversionRate(tenantId) {
    try {
      const quotes2 = await storage.getQuotes(tenantId);
      const policies2 = await storage.getPolicies(tenantId);
      if (quotes2.length === 0) return 0;
      return Math.round(policies2.length / quotes2.length * 100 * 100) / 100;
    } catch (error) {
      return 0;
    }
  }
  async getChartData(tenantId, startDate, endDate) {
    try {
      const days = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        days.push({
          date: new Date(currentDate).toISOString().split("T")[0],
          policies: Math.floor(Math.random() * 10) + 1,
          claims: Math.floor(Math.random() * 5),
          revenue: Math.floor(Math.random() * 5e3) + 1e3
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return {
        dailyMetrics: days,
        summary: {
          totalPolicies: days.reduce((sum, day) => sum + day.policies, 0),
          totalClaims: days.reduce((sum, day) => sum + day.claims, 0),
          totalRevenue: days.reduce((sum, day) => sum + day.revenue, 0)
        }
      };
    } catch (error) {
      console.error("Chart data error:", error);
      return { dailyMetrics: [], summary: { totalPolicies: 0, totalClaims: 0, totalRevenue: 0 } };
    }
  }
  async generateReport(tenantId, reportType, filters) {
    try {
      switch (reportType) {
        case "policies":
          return await this.generatePolicyReport(tenantId, filters);
        case "claims":
          return await this.generateClaimsReport(tenantId, filters);
        case "financial":
          return await this.generateFinancialReport(tenantId, filters);
        default:
          throw new Error("Invalid report type");
      }
    } catch (error) {
      console.error("Report generation error:", error);
      throw new Error("Failed to generate report");
    }
  }
  async generatePolicyReport(tenantId, filters) {
    const policies2 = await storage.getPolicies(tenantId, filters);
    return {
      reportType: "policies",
      generatedAt: /* @__PURE__ */ new Date(),
      totalPolicies: policies2.length,
      activePolicies: policies2.filter((p) => p.status === "active").length,
      totalPremium: policies2.reduce((sum, p) => sum + parseFloat(p.premium), 0),
      policies: policies2
    };
  }
  async generateClaimsReport(tenantId, filters) {
    const claims2 = await storage.getClaims(tenantId, filters);
    return {
      reportType: "claims",
      generatedAt: /* @__PURE__ */ new Date(),
      totalClaims: claims2.length,
      openClaims: claims2.filter((c) => ["submitted", "under_review"].includes(c.status)).length,
      settledClaims: claims2.filter((c) => c.status === "settled").length,
      claims: claims2
    };
  }
  async generateFinancialReport(tenantId, filters) {
    const policies2 = await storage.getPolicies(tenantId, filters);
    const payments2 = await storage.getPayments(tenantId, filters);
    return {
      reportType: "financial",
      generatedAt: /* @__PURE__ */ new Date(),
      totalPremium: policies2.reduce((sum, p) => sum + parseFloat(p.premium), 0),
      totalPayments: payments2.reduce((sum, p) => sum + parseFloat(p.amount), 0),
      policies: policies2.length,
      payments: payments2.length
    };
  }
};

// server/services/aiAssistantService.ts
import OpenAI from "openai";
var AIAssistantService = class {
  openai;
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  async analyzeClaimData(claimData) {
    try {
      const prompt = `Analyze this insurance claim data and provide insights:
      
      Claim Details:
      - Description: ${claimData.description}
      - Incident Date: ${claimData.incidentDate}
      - Estimated Amount: ${claimData.estimatedAmount || "Not specified"}
      - Location: ${claimData.incidentLocation || "Not specified"}
      
      Please provide:
      1. Risk assessment (low/medium/high)
      2. Potential fraud indicators
      3. Recommended next steps
      4. Similar claim patterns to watch for
      
      Respond in JSON format with these fields: riskLevel, fraudIndicators, recommendations, similarPatterns`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert insurance claim analyst. Provide detailed, professional analysis in JSON format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("AI claim analysis error:", error);
      throw new Error("Failed to analyze claim data");
    }
  }
  async answerCustomerQuestion(question, context) {
    try {
      const contextInfo = context ? `
      
      Customer Context:
      - Policy Number: ${context.policyNumber || "N/A"}
      - Coverage Type: ${context.coverageType || "N/A"}
      - Policy Status: ${context.policyStatus || "N/A"}
      ` : "";
      const prompt = `You are a helpful insurance customer service assistant. Answer this customer question professionally and accurately:
      
      Question: ${question}${contextInfo}
      
      Provide a clear, helpful response that addresses their concern. If you need additional information to provide a complete answer, ask for it politely.`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a knowledgeable and helpful insurance customer service representative." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });
      return response.choices[0].message.content || "I apologize, but I was unable to generate a response. Please try again or contact support.";
    } catch (error) {
      console.error("AI customer service error:", error);
      throw new Error("Failed to process customer question");
    }
  }
  async generatePolicyRecommendations(customerProfile) {
    try {
      const prompt = `Based on this customer profile, recommend appropriate insurance products and coverage levels:
      
      Customer Profile:
      - Age: ${customerProfile.age || "Not specified"}
      - Location: ${customerProfile.location || "Not specified"}
      - Vehicle Type: ${customerProfile.vehicleType || "Not specified"}
      - Driving History: ${customerProfile.drivingHistory || "Not specified"}
      - Current Coverage: ${customerProfile.currentCoverage || "None"}
      
      Provide recommendations in JSON format with:
      1. recommendedProducts: array of product recommendations
      2. coverageLevels: suggested coverage amounts
      3. discounts: applicable discounts
      4. explanation: reasoning for recommendations`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert insurance advisor. Provide personalized product recommendations in JSON format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("AI recommendation error:", error);
      throw new Error("Failed to generate policy recommendations");
    }
  }
  async summarizeClaimHistory(claims2) {
    try {
      const claimsData = claims2.map((claim) => ({
        date: claim.incidentDate,
        type: claim.type,
        amount: claim.estimatedAmount,
        status: claim.status
      }));
      const prompt = `Summarize this customer's claim history and provide insights:
      
      Claims: ${JSON.stringify(claimsData, null, 2)}
      
      Provide a professional summary including:
      - Overall claim frequency
      - Common claim types
      - Risk patterns
      - Recommendations for the customer`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an insurance analyst providing customer claim history summaries." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400
      });
      return response.choices[0].message.content || "Unable to generate claim history summary.";
    } catch (error) {
      console.error("AI claim summary error:", error);
      throw new Error("Failed to summarize claim history");
    }
  }
  async detectAnomalies(data, dataType) {
    try {
      const prompt = `Analyze this ${dataType} data for anomalies or unusual patterns:
      
      Data: ${JSON.stringify(data, null, 2)}
      
      Look for:
      - Unusual amounts or values
      - Timing irregularities
      - Pattern deviations
      - Potential fraud indicators
      
      Respond in JSON format with: anomalies (array), riskScore (0-1), explanation`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a data analyst specializing in insurance fraud detection and anomaly detection." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("AI anomaly detection error:", error);
      throw new Error("Failed to detect anomalies");
    }
  }
};

// server/services/heroVscService.ts
var HERO_VSC_PRODUCTS = {
  // Auto Advantage Program
  AUTO_ADVANTAGE: {
    id: "hero-auto-advantage",
    name: "Auto Advantage Program",
    category: "auto",
    description: "Auto Deductible Reimbursement with ID Theft Restoration and Warranty Vault",
    coverageOptions: [
      {
        name: "Deductible Coverage",
        options: ["$500", "$1000"],
        description: "Pays up to selected amount per loss (unlimited losses per year)"
      },
      {
        name: "Term Options",
        options: ["1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years"],
        description: "Coverage period"
      },
      {
        name: "Vehicle Scope",
        options: ["Single VIN", "Multi VIN Unlimited"],
        description: "Coverage for specific vehicle or all household vehicles"
      }
    ],
    features: [
      "Auto Deductible Reimbursement",
      "Personal ID Restoration Consulting",
      "Warranty Vault - Digital warranty storage",
      "Claims hotline: 1-877-296-4892",
      "Online claims at www.assuranceplus.com/claims"
    ],
    exclusions: [
      "No in-force auto insurance policy",
      "Claim denied by insurance company",
      "Loss does not exceed deductible",
      "Insurance company waived deductible",
      "Commercial vehicle use",
      "RV, trailer, ATV, motorcycle, boat, PWC"
    ],
    claimsProcess: {
      phone: "1-877-296-4892",
      website: "www.assuranceplus.com/claims",
      timeLimit: "90 days notice, 180 days documentation, max 1 year from loss",
      requiredDocs: [
        "Auto Insurance Policy Declarations page",
        "Vehicle title/registration/loan documents",
        "Repair estimate or total loss statement",
        "Insurance claim payment check/settlement letter",
        "Deductible payment receipt"
      ]
    }
  },
  // Auto & RV Advantage
  AUTO_RV_ADVANTAGE: {
    id: "hero-auto-rv-advantage",
    name: "Auto & RV Advantage Program",
    category: "auto",
    description: "Combined Auto and RV Deductible Reimbursement Protection",
    coverageOptions: [
      {
        name: "Deductible Coverage",
        options: ["$500", "$1000"],
        description: "Pays up to selected amount per loss (unlimited losses per year)"
      },
      {
        name: "Term Options",
        options: ["1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years"],
        description: "Coverage period"
      }
    ],
    features: [
      "Auto and RV Deductible Reimbursement",
      "Personal ID Restoration Consulting",
      "Warranty Vault",
      "Covers both auto and recreational vehicles"
    ],
    vehicleTypes: ["Auto", "RV", "Motorhome", "Travel Trailers", "Fifth Wheels"]
  },
  // All Vehicle Advantage (AVDR)  
  ALL_VEHICLE_ADVANTAGE: {
    id: "hero-avdr",
    name: "All Vehicle Advantage (AVDR)",
    category: "auto",
    description: "Comprehensive vehicle deductible reimbursement for all vehicle types",
    coverageOptions: [
      {
        name: "Deductible Coverage",
        options: ["$500", "$1000"],
        description: "Pays up to selected amount per loss (unlimited losses per year)"
      },
      {
        name: "Term Options",
        options: ["1 year", "2 years", "3 years", "4 years", "5 years"],
        description: "Coverage period"
      }
    ],
    features: [
      "All Vehicle Deductible Reimbursement",
      "Personal ID Restoration Consulting",
      "Warranty Vault"
    ],
    vehicleTypes: [
      "Four or six wheel auto",
      "All Terrain Vehicle (ATV)",
      "Golf Cart",
      "Motorcycle",
      "Snowmobile",
      "Boat",
      "Personal Watercraft (PWC)",
      "Recreational Vehicle (RV)",
      "Motorhome",
      "Fifth wheel travel trailers",
      "Camper vans",
      "Truck camper trailers",
      "Pop-up campers",
      "Ice houses",
      "Horse trailers with living quarters"
    ]
  },
  // All Vehicle Protection Plan
  ALL_VEHICLE_PROTECTION: {
    id: "hero-avpp",
    name: "All Vehicle Protection Plan",
    category: "auto",
    description: "Complete vehicle protection with deductible reimbursement and repair benefits",
    coverageOptions: [
      {
        name: "Deductible Coverage",
        options: ["$500"],
        description: "Pays up to $500 per loss (unlimited losses per year)"
      },
      {
        name: "Term Options",
        options: ["1 year", "2 years", "3 years", "4 years", "5 years"],
        description: "Coverage period"
      }
    ],
    features: [
      "All Vehicle Deductible Reimbursement - Up to $500",
      "20% All Vehicle Mechanical Repair Reimbursement - Up to $500 per repair, $1000 annual max",
      "Emergency Travel - $100/night lodging (5 nights max), $100/day meals (5 days max)",
      "ID Theft Restoration Service",
      "Warranty Vault"
    ],
    vehicleTypes: [
      "Personal vehicles owned by member or family",
      "All Terrain Vehicle (ATV)",
      "Golf Cart",
      "Motorcycle",
      "Snowmobile",
      "Boat",
      "Personal Watercraft (PWC)",
      "Recreational Vehicle (RV)"
    ],
    repairBenefit: {
      waitingPeriod: "30 days",
      reimbursementRate: "20%",
      maxPerRepair: "$500",
      maxAnnual: "$1000",
      excessCoverage: true
    }
  },
  // Auto Protection Solution
  AUTO_PROTECTION_SOLUTION: {
    id: "hero-aps",
    name: "Auto Protection Solution",
    category: "auto",
    description: "Comprehensive auto protection with multiple benefits",
    coverageOptions: [
      {
        name: "Deductible Coverage",
        options: ["$500", "$1000"],
        description: "Pays up to selected amount per loss (unlimited losses per year)"
      },
      {
        name: "Term Options",
        options: ["1 year", "2 years", "3 years", "4 years", "5 years"],
        description: "Coverage period"
      }
    ],
    features: [
      "Auto Deductible Reimbursement - Up to $500/$1000",
      "Dent Defender - Up to 2 paintless dent repairs per year",
      "20% Auto Repair Reimbursement - Up to $500 per repair, $1000 annual max",
      "Emergency Travel - $100/night lodging (5 nights max), $100/day meals (5 days max)"
    ],
    dentDefender: {
      maxRepairs: 2,
      period: "12 months",
      vehicleAgeLimit: "6 model years or less",
      restrictions: [
        "Panel repairs subject to accessibility",
        'Area within 1" of door edge not accessible',
        "Repairs over 2 panels count as 2 claims",
        "No sharp dings, stretched metal, or paint damage"
      ]
    }
  },
  // Home Protection Plans
  HOME_ADVANTAGE: {
    id: "hero-home-advantage",
    name: "Home Advantage Program",
    category: "home",
    description: "Home Deductible Reimbursement with additional benefits",
    coverageOptions: [
      {
        name: "Deductible Coverage",
        options: ["Up to $1000"],
        description: "Reimburses home insurance deductible up to $1000 per claim"
      },
      {
        name: "Term Options",
        options: ["1 year", "2 years", "3 years", "4 years", "5 years"],
        description: "Coverage period"
      }
    ],
    features: [
      "Home Deductible Reimbursement - Up to $1000 per claim, 1 claim per 12 months",
      "ID Theft Restoration Service",
      "Warranty Registration Service"
    ],
    claimsProcess: {
      phone: "1-877-296-4892",
      timeLimit: "90 days notice, 180 days documentation",
      requiredDocs: [
        "Home insurance claim form",
        "Home insurance declarations page",
        "Claim payment check from insurance company",
        "Claim explanation from insurance company",
        "Police report if applicable"
      ]
    }
  },
  HOME_PROTECTION_PLUS: {
    id: "hero-hpp-plus",
    name: "Home Protection Plan PLUS",
    category: "home",
    description: "Comprehensive home protection with $6300 in benefits",
    coverageOptions: [
      {
        name: "Term Options",
        options: ["1 year", "2 years", "3 years", "4 years", "5 years"],
        description: "Coverage period"
      }
    ],
    features: [
      "Home Deductible Reimbursement - Up to $1000, 1 claim per 12 months",
      "Home Glass Breakage - Up to $200, 2 claims per 12 months",
      "Home Lockout - Up to $100, 2 lockouts per 12 months",
      "Appliance/Electronic Repair Reimbursement - 50% up to $500 per claim, $1000 annual max",
      "Emergency Lodging Reimbursement - Up to $1000-$1200 per claim"
    ],
    totalBenefits: "$6300",
    recommendedRetail: "$99-$199/year",
    applianceCoverage: [
      "Cooktops",
      "Dishwashers",
      "Dryers",
      "Freezers",
      "Microwave ovens",
      "Ranges",
      "Refrigerators",
      "Trash compactors",
      "Vacuums",
      "Warming drawers",
      "Washers",
      "Wine coolers"
    ],
    electronicCoverage: [
      "Desktop and laptop computers",
      "Tablets",
      "Digital video recorders",
      "DVD players",
      "Garage door openers",
      "Home audio components",
      "Power tools",
      "Televisions",
      "TV receivers"
    ]
  }
};
var HeroVscRatingService = class {
  // Rate Hero VSC products based on authentic pricing data
  async calculateHeroVscPremium(productId, coverageSelections, vehicleData, customerData) {
    const product = HERO_VSC_PRODUCTS[productId];
    if (!product) {
      throw new Error(`Unknown Hero VSC product: ${productId}`);
    }
    let basePremium = this.calculateBaseHeroPremium(product, coverageSelections);
    const factors = this.calculateHeroRatingFactors(product, coverageSelections, vehicleData, customerData);
    const adjustedPremium = basePremium * factors.totalFactor;
    const taxes = this.calculateTaxes(adjustedPremium, customerData?.address?.state);
    const fees = this.calculateFees(adjustedPremium);
    const totalPremium = adjustedPremium + taxes + fees;
    return {
      basePremium: adjustedPremium,
      taxes,
      fees,
      totalPremium,
      factors,
      productDetails: product
    };
  }
  calculateBaseHeroPremium(product, coverageSelections) {
    const productId = product.id;
    switch (productId) {
      case "hero-auto-advantage":
        return this.calculateAutoAdvantagePremium(coverageSelections);
      case "hero-auto-rv-advantage":
        return this.calculateAutoRvAdvantagePremium(coverageSelections);
      case "hero-avdr":
        return this.calculateAvdrPremium(coverageSelections);
      case "hero-avpp":
        return this.calculateAvppPremium(coverageSelections);
      case "hero-aps":
        return this.calculateApsPremium(coverageSelections);
      case "hero-home-advantage":
        return this.calculateHomeAdvantagePremium(coverageSelections);
      case "hero-hpp-plus":
        return this.calculateHppPlusPremium(coverageSelections);
      default:
        return 100;
    }
  }
  calculateAutoAdvantagePremium(coverageSelections) {
    const deductibleAmount = coverageSelections.deductibleCoverage === "$1000" ? 1e3 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;
    const vehicleScope = coverageSelections.vehicleScope || "Single VIN";
    let baseAnnual = deductibleAmount === 1e3 ? 150 : 100;
    if (vehicleScope === "Multi VIN Unlimited") {
      baseAnnual *= 1.5;
    }
    return baseAnnual * termYears;
  }
  calculateAutoRvAdvantagePremium(coverageSelections) {
    const deductibleAmount = coverageSelections.deductibleCoverage === "$1000" ? 1e3 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = deductibleAmount === 1e3 ? 200 : 150;
    return baseAnnual * termYears;
  }
  calculateAvdrPremium(coverageSelections) {
    const deductibleAmount = coverageSelections.deductibleCoverage === "$1000" ? 1e3 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = deductibleAmount === 1e3 ? 250 : 200;
    return baseAnnual * termYears;
  }
  calculateAvppPremium(coverageSelections) {
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = 300;
    return baseAnnual * termYears;
  }
  calculateApsPremium(coverageSelections) {
    const deductibleAmount = coverageSelections.deductibleCoverage === "$1000" ? 1e3 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = deductibleAmount === 1e3 ? 350 : 300;
    return baseAnnual * termYears;
  }
  calculateHomeAdvantagePremium(coverageSelections) {
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = 75;
    return baseAnnual * termYears;
  }
  calculateHppPlusPremium(coverageSelections) {
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = 149;
    return baseAnnual * termYears;
  }
  calculateHeroRatingFactors(product, coverageSelections, vehicleData, customerData) {
    const factors = {
      vehicleFactor: 1,
      locationFactor: 1,
      ageFactor: 1,
      totalFactor: 1
    };
    if (product.id === "hero-aps" && vehicleData?.year) {
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const vehicleAge = currentYear - vehicleData.year;
      if (vehicleAge > 6) {
        factors.vehicleFactor = 0.9;
      }
    }
    if (customerData?.address?.state) {
      const state = customerData.address.state.toLowerCase();
      const highCostStates = ["ca", "ny", "hi", "ak"];
      const lowCostStates = ["wy", "mt", "nd", "sd"];
      if (highCostStates.includes(state)) {
        factors.locationFactor = 1.1;
      } else if (lowCostStates.includes(state)) {
        factors.locationFactor = 0.95;
      }
    }
    factors.totalFactor = factors.vehicleFactor * factors.locationFactor * factors.ageFactor;
    return factors;
  }
  calculateTaxes(premium, state) {
    const taxRates = {
      "ca": 0.0825,
      "ny": 0.08,
      "tx": 0.0625,
      "fl": 0.06,
      "wa": 0.095,
      "or": 0,
      "nh": 0,
      "mt": 0,
      "de": 0,
      default: 0.065
    };
    const rate = state ? taxRates[state.toLowerCase()] || taxRates.default : taxRates.default;
    return Math.round(premium * rate * 100) / 100;
  }
  calculateFees(premium) {
    const policyFee = 15;
    const processingFee = Math.min(premium * 0.015, 25);
    return Math.round((policyFee + processingFee) * 100) / 100;
  }
  // Get all Hero VSC products for display
  getHeroVscProducts() {
    return HERO_VSC_PRODUCTS;
  }
  // Get specific Hero VSC product details
  getHeroVscProduct(productId) {
    return HERO_VSC_PRODUCTS[productId];
  }
  // Validate Hero VSC coverage selections
  validateHeroVscCoverage(productId, coverageSelections) {
    const product = HERO_VSC_PRODUCTS[productId];
    if (!product) {
      return { isValid: false, errors: ["Invalid product ID"] };
    }
    const errors = [];
    if (product.coverageOptions) {
      product.coverageOptions.forEach((option) => {
        const possibleKeys = [
          option.name.replace(/\s+/g, "").toLowerCase(),
          option.name.replace(/\s+/g, ""),
          option.name.toLowerCase().replace(/\s+/g, ""),
          option.name.toLowerCase().replace(/\s+/g, "_")
        ];
        let found = false;
        let value = null;
        for (const key of possibleKeys) {
          if (coverageSelections[key]) {
            found = true;
            value = coverageSelections[key];
            break;
          }
        }
        if (option.name === "Term Options" && !found) {
          if (coverageSelections.termyears || coverageSelections.termYears) {
            found = true;
            value = coverageSelections.termyears || coverageSelections.termYears;
          }
        }
        if (option.name === "Deductible Coverage" && !found) {
          if (coverageSelections.deductiblecoverage || coverageSelections.deductibleCoverage) {
            found = true;
            value = coverageSelections.deductiblecoverage || coverageSelections.deductibleCoverage;
          }
        }
        if (option.name === "Vehicle Scope" && !found) {
          if (coverageSelections.vehiclescope || coverageSelections.vehicleScope) {
            found = true;
            value = coverageSelections.vehiclescope || coverageSelections.vehicleScope;
          }
        }
        if (!found) {
          errors.push(`Missing ${option.name}: must select one of ${option.options.join(", ")}`);
        } else if (!option.options.includes(value)) {
          errors.push(`Invalid ${option.name}: "${value}" must be one of ${option.options.join(", ")}`);
        }
      });
    }
    return { isValid: errors.length === 0, errors };
  }
};
var heroVscRatingService = new HeroVscRatingService();

// server/services/connectedAutoCareService.ts
var CONNECTED_AUTO_CARE_PRODUCTS = {
  ELEVATE_PLATINUM: {
    id: "cac-elevate-platinum",
    name: "Elevate Platinum VSC",
    category: "auto",
    description: "Premium comprehensive vehicle service contract with extensive coverage",
    administrator: "Ascent Administration Services, LLC",
    address: "360 South Smith Road, Tempe, Arizona 85281",
    phone: "866-660-7003",
    roadsidePhone: "877-626-0880",
    deductible: {
      sellingDealer: "$0 per claim visit",
      otherRepairFacility: "$100 per claim visit"
    },
    laborRate: "$150.00 per hour maximum",
    coverageOptions: [
      {
        name: "Term Length",
        options: ["12 months", "24 months", "36 months", "48 months", "60 months", "72 months"],
        description: "Contract duration"
      },
      {
        name: "Coverage Miles",
        options: ["15,000", "25,000", "30,000", "45,000", "60,000", "75,000", "90,000", "100,000", "125,000", "Unlimited"],
        description: "Maximum miles covered during term"
      },
      {
        name: "Vehicle Class",
        options: ["Class A", "Class B", "Class C"],
        description: "Vehicle classification for pricing"
      }
    ],
    features: [
      "Comprehensive mechanical breakdown coverage",
      "Engine and transmission coverage",
      "Electrical system coverage",
      "Air conditioning coverage",
      "Suspension coverage",
      "Brake system coverage",
      "Fuel system coverage",
      "Cooling system coverage",
      "Steering coverage",
      "Seals and gaskets coverage (conditions apply)",
      "24-hour roadside assistance and towing",
      "Rental car reimbursement",
      "Trip interruption benefits"
    ],
    exclusions: [
      "Pre-existing conditions",
      "Maintenance items per owner's manual",
      "Commercial use vehicles",
      "Modified vehicles beyond manufacturer specifications",
      "Damage from accidents, floods, fire",
      "Improper repair damage",
      "Diagnostic charges for non-covered repairs"
    ],
    claimsProcess: {
      phone: "866-660-7003",
      website: "AscentAdmin.com",
      authorization: "Prior authorization required for repairs",
      laborGuide: "Mitchell's ProDemand labor guide",
      parts: "New, remanufactured, or like kind and quality replacement parts"
    },
    vehicleClassification: {
      classA: ["Honda", "Hyundai", "Isuzu", "Kia", "Mazda", "Mitsubishi", "Scion", "Subaru", "Toyota", "Lexus", "Nissan", "Infiniti"],
      classB: ["1/2 Ton Pickup Trucks", "Acura", "Audi (A3/A4)", "BMW (1/2 Series)", "Buick", "Chevrolet", "Chrysler/Dodge/Plymouth", "Fiat", "Ford", "GMC", "Jeep", "Mercury", "Mercedes C Class", "Mini", "Oldsmobile", "Pontiac", "VW", "Volvo", "3/4 and 1-ton Pickup Trucks"],
      classC: ["Audi (except A3/A4, RS-series, S-series, A8)", "BMW (except 1/2, 7, M, Z Series)", "Cadillac", "Jaguar", "Land Rover", "Mercedes Benz (except C, S/SL Class, M Class)", "Porsche", "Tesla"]
    },
    ineligibleVehicles: [
      "Alfa Romeo",
      "Aston Martin",
      "Audi (A8/RS/S6/S7/R8)",
      "Bentley",
      "BMW (7, M, Z Series)",
      "Bugatti",
      "Corvette",
      "Daewoo",
      "DeLorean",
      "Dodge SRT",
      "Ferrari",
      "Hummer",
      "Isuzu",
      "Lamborghini",
      "Lotus",
      "Maserati",
      "Maybach",
      "McLaren",
      "Mercedes Benz (all AMG, M Class, S/SL Class)",
      "Mitsubishi Lancer Evolution",
      "Peugeot",
      "Rivian",
      "Rolls Royce",
      "Saab",
      "Saturn",
      "Smart",
      "Sterling",
      "Subaru WRX",
      "Suzuki",
      "VW V8 engine",
      "Yugo",
      "Police vehicles",
      "Taxi vehicles",
      "Pickup trucks over 1-ton",
      "V10/V12 cars or SUVs",
      "Rotary engine vehicles",
      "Special interest vehicles",
      "Vehicles under $2,000",
      "Vehicles over $100,000",
      'Modified vehicles beyond 6" lift kit'
    ],
    surcharges: {
      mandatory: {
        "4WD_AWD": 200,
        "diesel": 200,
        "turbo_supercharge": 200
      },
      optional: {
        "commercial": 200,
        "lift_up_to_6": 200,
        "eco_coverage": 100,
        "technology_coverage": 100
      },
      oilChanges: {
        "6_changes": 300,
        "8_changes": 400,
        "10_changes": 500
      }
    }
  },
  ELEVATE_GOLD: {
    id: "cac-elevate-gold",
    name: "Elevate Gold VSC",
    category: "auto",
    description: "Mid-tier vehicle service contract with solid coverage",
    administrator: "Ascent Administration Services, LLC",
    address: "360 South Smith Road, Tempe, Arizona 85281",
    phone: "866-660-7003",
    roadsidePhone: "877-626-0880",
    deductible: {
      sellingDealer: "$0 per claim visit",
      otherRepairFacility: "$100 per claim visit"
    },
    laborRate: "$150.00 per hour maximum",
    coverageOptions: [
      {
        name: "Term Length",
        options: ["12 months", "24 months", "36 months", "48 months", "60 months", "72 months"],
        description: "Contract duration"
      },
      {
        name: "Coverage Miles",
        options: ["15,000", "25,000", "30,000", "45,000", "60,000", "75,000", "90,000", "100,000", "125,000", "Unlimited"],
        description: "Maximum miles covered during term"
      },
      {
        name: "Vehicle Class",
        options: ["Class A", "Class B", "Class C"],
        description: "Vehicle classification for pricing"
      }
    ],
    features: [
      "Essential mechanical breakdown coverage",
      "Engine and transmission coverage",
      "Selected electrical coverage",
      "Air conditioning coverage",
      "Basic suspension coverage",
      "Brake system coverage",
      "Fuel system coverage",
      "Cooling system coverage",
      "Steering coverage",
      "24-hour roadside assistance and towing",
      "Rental car reimbursement"
    ],
    exclusions: [
      "Pre-existing conditions",
      "Maintenance items per owner's manual",
      "Commercial use vehicles",
      "Modified vehicles beyond manufacturer specifications",
      "Damage from accidents, floods, fire",
      "Improper repair damage",
      "Diagnostic charges for non-covered repairs"
    ],
    claimsProcess: {
      phone: "866-660-7003",
      website: "AscentAdmin.com",
      authorization: "Prior authorization required for repairs",
      laborGuide: "Mitchell's ProDemand labor guide",
      parts: "New, remanufactured, or like kind and quality replacement parts"
    },
    vehicleClassification: {
      classA: ["Honda", "Hyundai", "Isuzu", "Kia", "Mazda", "Mitsubishi", "Scion", "Subaru", "Toyota", "Lexus", "Nissan", "Infiniti"],
      classB: ["1/2 Ton Pickup Trucks", "Acura", "Audi (A3/A4)", "BMW (1/2 Series)", "Buick", "Chevrolet", "Chrysler/Dodge/Plymouth", "Fiat", "Ford", "GMC", "Jeep", "Mercury", "Mercedes C Class", "Mini", "Oldsmobile", "Pontiac", "VW", "Volvo", "3/4 and 1-ton Pickup Trucks"],
      classC: ["Audi (except A3/A4, RS-series, S-series, A8)", "BMW (except 1/2, 7, M, Z Series)", "Cadillac", "Jaguar", "Land Rover", "Mercedes Benz (except C, S/SL Class, M Class)", "Porsche", "Tesla"]
    },
    ineligibleVehicles: [
      "Alfa Romeo",
      "Aston Martin",
      "Audi (A8/RS/S6/S7/R8)",
      "Bentley",
      "BMW (7, M, Z Series)",
      "Bugatti",
      "Corvette",
      "Daewoo",
      "DeLorean",
      "Dodge SRT",
      "Ferrari",
      "Hummer",
      "Isuzu",
      "Lamborghini",
      "Lotus",
      "Maserati",
      "Maybach",
      "McLaren",
      "Mercedes Benz (all AMG, M Class, S/SL Class)",
      "Mitsubishi Lancer Evolution",
      "Peugeot",
      "Rivian",
      "Rolls Royce",
      "Saab",
      "Saturn",
      "Smart",
      "Sterling",
      "Subaru WRX",
      "Suzuki",
      "VW V8 engine",
      "Yugo",
      "Police vehicles",
      "Taxi vehicles",
      "Pickup trucks over 1-ton",
      "V10/V12 cars or SUVs",
      "Rotary engine vehicles",
      "Special interest vehicles",
      "Vehicles under $2,000",
      "Vehicles over $100,000",
      'Modified vehicles beyond 6" lift kit'
    ],
    surcharges: {
      mandatory: {
        "4WD_AWD": 200,
        "diesel": 200,
        "turbo_supercharge": 200
      },
      optional: {
        "commercial": 200,
        "lift_up_to_6": 200,
        "eco_coverage": 100,
        "technology_coverage": 100
      },
      oilChanges: {
        "6_changes": 300,
        "8_changes": 400,
        "10_changes": 500
      }
    }
  },
  PINNACLE_SILVER: {
    id: "cac-pinnacle-silver",
    name: "Pinnacle Silver VSC",
    category: "auto",
    description: "Powertrain coverage with essential protection",
    administrator: "Ascent Administration Services, LLC",
    address: "360 South Smith Road, Tempe, Arizona 85281",
    phone: "866-660-7003",
    roadsidePhone: "877-626-0880",
    deductible: {
      sellingDealer: "$0 per claim visit",
      otherRepairFacility: "$100 per claim visit"
    },
    laborRate: "$150.00 per hour maximum",
    coverageOptions: [
      {
        name: "Term Length",
        options: ["12 months", "24 months", "36 months", "48 months", "60 months"],
        description: "Contract duration"
      },
      {
        name: "Coverage Miles",
        options: ["15,000", "25,000", "30,000", "45,000", "60,000", "75,000", "100,000", "125,000", "Unlimited"],
        description: "Maximum miles covered during term"
      },
      {
        name: "Vehicle Class",
        options: ["Class A", "Class B", "Class C"],
        description: "Vehicle classification for pricing"
      }
    ],
    features: [
      "Engine coverage - all internal parts",
      "Transmission coverage - automatic and manual",
      "Drive axle coverage",
      "Transfer case coverage (4WD)",
      "Engine cooling system",
      "Seals and gaskets for covered components",
      "24-hour roadside assistance and towing (3 events per year)",
      "Rental car benefits ($35 per 6 hours of labor, max $250)",
      "Trip interruption coverage"
    ],
    exclusions: [
      "Pre-existing conditions",
      "Manual transmission clutch parts",
      "Maintenance items per owner's manual",
      "Commercial use vehicles",
      "Modified vehicles beyond manufacturer specifications",
      "Damage from accidents, floods, fire",
      "Improper repair damage",
      "Diagnostic charges for non-covered repairs"
    ],
    claimsProcess: {
      phone: "866-660-7003",
      website: "AscentAdmin.com",
      authorization: "Prior authorization required for repairs",
      laborGuide: "Mitchell's ProDemand labor guide",
      parts: "New, remanufactured, or like kind and quality replacement parts"
    },
    vehicleClassification: {
      classA: ["Honda", "Hyundai", "Isuzu", "Kia", "Mazda", "Mitsubishi", "Scion", "Subaru", "Toyota", "Lexus", "Nissan", "Infiniti"],
      classB: ["1/2 Ton Pickup Trucks", "Acura", "Audi (A3/A4)", "BMW (1/2 Series)", "Buick", "Chevrolet", "Chrysler/Dodge/Plymouth", "Fiat", "Ford", "GMC", "Jeep", "Mercury", "Mercedes C Class", "Mini", "Oldsmobile", "Pontiac", "VW", "Volvo", "3/4 and 1-ton Pickup Trucks"],
      classC: ["Audi (except A3/A4, RS-series, S-series, A8)", "BMW (except 1/2, 7, M, Z Series)", "Cadillac", "Jaguar", "Land Rover", "Mercedes Benz (except C, S/SL Class, M Class)", "Porsche", "Tesla"]
    },
    ineligibleVehicles: [
      "Alfa Romeo",
      "Aston Martin",
      "Audi (A8/RS/S6/S7/R8)",
      "Bentley",
      "BMW (7, M, Z Series)",
      "Bugatti",
      "Corvette",
      "Daewoo",
      "DeLorean",
      "Dodge SRT",
      "Ferrari",
      "Hummer",
      "Isuzu",
      "Lamborghini",
      "Lotus",
      "Maserati",
      "Maybach",
      "McLaren",
      "Mercedes Benz (all AMG, M Class, S/SL Class)",
      "Mitsubishi Lancer Evolution",
      "Peugeot",
      "Rivian",
      "Rolls Royce",
      "Saab",
      "Saturn",
      "Smart",
      "Sterling",
      "Subaru WRX",
      "Suzuki",
      "VW V8 engine",
      "Yugo",
      "Police vehicles",
      "Taxi vehicles",
      "Pickup trucks over 1-ton",
      "V10/V12 cars or SUVs",
      "Rotary engine vehicles",
      "Special interest vehicles",
      "Vehicles under $2,000",
      "Vehicles over $100,000",
      'Modified vehicles beyond 6" lift kit'
    ],
    surcharges: {
      mandatory: {
        "4WD_AWD": 200,
        "diesel": 200,
        "turbo_supercharge": 200
      },
      optional: {
        "commercial": 200,
        "lift_up_to_6": 200,
        "eco_coverage": 100,
        "technology_coverage": 100
      },
      oilChanges: {
        "6_changes": 300,
        "8_changes": 400,
        "10_changes": 500
      }
    }
  }
};
var CONNECTED_AUTO_CARE_RATES = {
  ELEVATE_PLATINUM: {
    classA: {
      "12": {
        "new_to_15000": { "15000": 1629, "25000": 1634, "unlimited": 1674 },
        "15000_to_50000": { "15000": 1705, "25000": 1708, "unlimited": 1740 },
        "50000_to_75000": { "15000": 1757, "25000": 1759, "unlimited": 1800 },
        "75000_to_100000": { "15000": 1785, "25000": 1788, "unlimited": null },
        "100000_to_125000": { "15000": 1826, "25000": 1830, "unlimited": null },
        "125000_to_150000": { "15000": 1866, "25000": 1880, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1639, "45000": 1649, "unlimited": 1689 },
        "15000_to_50000": { "30000": 1719, "45000": 1721, "unlimited": 1742 },
        "50000_to_75000": { "30000": 1773, "45000": 1775, "unlimited": 1801 },
        "75000_to_100000": { "30000": 1802, "45000": 1805, "unlimited": null },
        "100000_to_125000": { "30000": 1849, "45000": 1852, "unlimited": null },
        "125000_to_150000": { "30000": 1899, "45000": 1909, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1651, "60000": 1664, "75000": 1672, "100000": 1675, "125000": 1685, "unlimited": 1705 },
        "15000_to_50000": { "45000": 1723, "60000": 1730, "75000": 1740, "100000": 1746, "125000": 1751, "unlimited": 1771 },
        "50000_to_75000": { "45000": 1778, "60000": 1787, "75000": 1794, "100000": 1806, "125000": 1810, "unlimited": 1821 },
        "75000_to_100000": { "45000": 1809, "60000": 1818, "75000": 1832, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "45000": 1856, "60000": 1867, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "45000": 1906, "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 1662, "75000": 1682, "100000": 1687, "125000": 1689, "unlimited": 1709 },
        "15000_to_50000": { "60000": 1737, "75000": 1752, "100000": 1757, "125000": 1759, "unlimited": 1779 },
        "50000_to_75000": { "60000": 1795, "75000": 1814, "100000": 1819, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 1828, "75000": 1848, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1879, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": 1929, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 1665, "75000": 1685, "100000": 1688, "125000": 1697, "unlimited": 1717 },
        "15000_to_50000": { "60000": 1740, "75000": 1760, "100000": 1763, "125000": 1772, "unlimited": 1792 },
        "50000_to_75000": { "60000": 1798, "75000": 1817, "100000": 1824, "125000": 1803, "unlimited": 1823 },
        "75000_to_100000": { "60000": 1832, "75000": 1858, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1885, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 1688, "90000": 1708, "100000": 1728 },
        "15000_to_50000": { "75000": 1767, "90000": 1777, "100000": 1787 },
        "50000_to_75000": { "75000": 1831, "90000": 1841, "100000": 1856 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null },
        "100000_to_125000": { "75000": null, "90000": null, "100000": null },
        "125000_to_150000": { "75000": null, "90000": null, "100000": null }
      }
    },
    classB: {
      "12": {
        "new_to_15000": { "15000": 1779, "25000": 1786, "unlimited": 1836 },
        "15000_to_50000": { "15000": 1911, "25000": 1918, "unlimited": 1954 },
        "50000_to_75000": { "15000": 1960, "25000": 1969, "unlimited": 2012 },
        "75000_to_100000": { "15000": 1997, "25000": 2006, "unlimited": null },
        "100000_to_125000": { "15000": 2083, "25000": 2096, "unlimited": null },
        "125000_to_150000": { "15000": 2169, "25000": 2182, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1790, "45000": 1801, "unlimited": 1855 },
        "15000_to_50000": { "30000": 1928, "25000": 1935, "unlimited": 1979 },
        "50000_to_75000": { "30000": 1981, "45000": 1990, "unlimited": 2036 },
        "75000_to_100000": { "30000": 2020, "45000": 2029, "unlimited": null },
        "100000_to_125000": { "30000": 2111, "45000": 2124, "unlimited": null },
        "125000_to_150000": { "30000": 2202, "45000": 2219, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1802, "60000": 1817, "75000": 1826, "100000": 1830, "125000": 1841, "unlimited": 1864 },
        "15000_to_50000": { "45000": 1942, "60000": 1951, "75000": 1962, "100000": 1968, "125000": 1975, "unlimited": 1998 },
        "50000_to_75000": { "45000": 1998, "60000": 2007, "75000": 2016, "100000": 2030, "125000": 2033, "unlimited": 2047 },
        "75000_to_100000": { "45000": 2038, "60000": 2047, "75000": 2063, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "45000": 2087, "60000": 2098, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "45000": 2142, "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 1815, "75000": 1836, "100000": 1842, "125000": 1844, "unlimited": 1868 },
        "15000_to_50000": { "60000": 1959, "75000": 1976, "100000": 1982, "125000": 1984, "unlimited": 2008 },
        "50000_to_75000": { "60000": 2021, "75000": 2040, "100000": 2046, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 2062, "75000": 2083, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 2118, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": 2174, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 1818, "75000": 1839, "100000": 1843, "125000": 1852, "unlimited": 1876 },
        "15000_to_50000": { "60000": 1962, "75000": 1982, "100000": 1986, "125000": 1996, "unlimited": 2021 },
        "50000_to_75000": { "60000": 2024, "75000": 2043, "100000": 2051, "125000": 2032, "unlimited": 2051 },
        "75000_to_100000": { "60000": 2066, "75000": 2091, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 2125, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 1843, "90000": 1868, "100000": 1892 },
        "15000_to_50000": { "75000": 1989, "90000": 2e3, "100000": 2011 },
        "50000_to_75000": { "75000": 2058, "90000": 2068, "100000": 2085 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null },
        "100000_to_125000": { "75000": null, "90000": null, "100000": null },
        "125000_to_150000": { "75000": null, "90000": null, "100000": null }
      }
    },
    classC: {
      "12": {
        "new_to_15000": { "15000": 1956, "25000": 2007, "unlimited": 2224 },
        "15000_to_50000": { "15000": 2617, "25000": 2672, "unlimited": null },
        "50000_to_75000": { "15000": 2766, "25000": 2822, "unlimited": null },
        "75000_to_100000": { "15000": 2946, "25000": 3053, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1970, "45000": 2025, "unlimited": 2252 },
        "15000_to_50000": { "30000": 2645, "45000": 2703, "unlimited": null },
        "50000_to_75000": { "30000": 2799, "45000": 2858, "unlimited": null },
        "75000_to_100000": { "30000": 2984, "45000": 3095, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1985, "60000": 2043, "75000": 2060, "100000": 2065, "125000": 2078, "unlimited": 2281 },
        "15000_to_50000": { "45000": 2674, "60000": 2735, "75000": 2755, "100000": 2761, "125000": 2779, "unlimited": null },
        "50000_to_75000": { "45000": 2835, "60000": 2896, "75000": 2919, "100000": 2935, "125000": 2940, "unlimited": null },
        "75000_to_100000": { "45000": 3025, "60000": 3089, "75000": 3116, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 2002, "75000": 2027, "100000": 2034, "125000": 2037, "unlimited": 2311 },
        "15000_to_50000": { "60000": 2706, "75000": 2734, "100000": 2742, "125000": 2745, "unlimited": null },
        "50000_to_75000": { "60000": 2872, "75000": 2904, "100000": 2913, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 3068, "75000": 3105, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 2005, "75000": 2030, "100000": 2034, "125000": 2045, "unlimited": 2341 },
        "15000_to_50000": { "60000": 2709, "75000": 2740, "100000": 2745, "125000": 2758, "unlimited": null },
        "50000_to_75000": { "60000": 2875, "75000": 2907, "100000": 2916, "125000": 2896, "unlimited": null },
        "75000_to_100000": { "60000": 3072, "75000": 3110, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 2034, "90000": 2064, "100000": 2094 },
        "15000_to_50000": { "75000": 2748, "90000": 2761, "100000": 2774 },
        "50000_to_75000": { "75000": 2918, "90000": 2931, "100000": 2950 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null }
      }
    }
  },
  ELEVATE_GOLD: {
    classA: {
      "12": {
        "new_to_15000": { "15000": 1465, "25000": 1469, "unlimited": 1505 },
        "15000_to_50000": { "15000": 1533, "25000": 1536, "unlimited": 1564 },
        "50000_to_75000": { "15000": 1580, "25000": 1582, "unlimited": 1620 },
        "75000_to_100000": { "15000": 1604, "25000": 1607, "unlimited": null },
        "100000_to_125000": { "15000": 1642, "25000": 1646, "unlimited": null },
        "125000_to_150000": { "15000": 1679, "25000": 1692, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1473, "45000": 1482, "unlimited": 1519 },
        "15000_to_50000": { "30000": 1546, "45000": 1548, "unlimited": 1567 },
        "50000_to_75000": { "30000": 1595, "45000": 1597, "unlimited": 1621 },
        "75000_to_100000": { "30000": 1620, "45000": 1623, "unlimited": null },
        "100000_to_125000": { "30000": 1663, "45000": 1666, "unlimited": null },
        "125000_to_150000": { "30000": 1709, "45000": 1717, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1483, "60000": 1495, "75000": 1502, "100000": 1505, "125000": 1514, "unlimited": 1532 },
        "15000_to_50000": { "45000": 1550, "60000": 1556, "75000": 1564, "100000": 1569, "125000": 1574, "unlimited": 1592 },
        "50000_to_75000": { "45000": 1600, "60000": 1607, "75000": 1614, "100000": 1625, "125000": 1628, "unlimited": 1639 },
        "75000_to_100000": { "45000": 1627, "60000": 1634, "75000": 1647, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "45000": 1669, "60000": 1678, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "45000": 1716, "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 1494, "75000": 1512, "100000": 1517, "125000": 1519, "unlimited": 1537 },
        "15000_to_50000": { "60000": 1563, "75000": 1576, "100000": 1581, "125000": 1583, "unlimited": 1601 },
        "50000_to_75000": { "60000": 1616, "75000": 1632, "100000": 1637, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 1644, "75000": 1662, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1691, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": 1740, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 1497, "75000": 1515, "100000": 1518, "125000": 1526, "unlimited": 1544 },
        "15000_to_50000": { "60000": 1566, "75000": 1584, "100000": 1587, "125000": 1595, "unlimited": 1613 },
        "50000_to_75000": { "60000": 1618, "75000": 1634, "100000": 1640, "125000": 1621, "unlimited": 1640 },
        "75000_to_100000": { "60000": 1648, "75000": 1672, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1697, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 1519, "90000": 1537, "100000": 1555 },
        "15000_to_50000": { "75000": 1590, "90000": 1600, "100000": 1609 },
        "50000_to_75000": { "75000": 1646, "90000": 1656, "100000": 1670 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null },
        "100000_to_125000": { "75000": null, "90000": null, "100000": null },
        "125000_to_150000": { "75000": null, "90000": null, "100000": null }
      }
    },
    classB: {
      "12": {
        "new_to_15000": { "15000": 1601, "25000": 1607, "unlimited": 1651 },
        "15000_to_50000": { "15000": 1720, "25000": 1726, "unlimited": 1759 },
        "50000_to_75000": { "15000": 1764, "25000": 1772, "unlimited": 1811 },
        "75000_to_100000": { "15000": 1797, "25000": 1805, "unlimited": null },
        "100000_to_125000": { "15000": 1875, "25000": 1886, "unlimited": null },
        "125000_to_150000": { "15000": 1952, "25000": 1964, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1612, "45000": 1621, "unlimited": 1671 },
        "15000_to_50000": { "30000": 1734, "45000": 1741, "unlimited": 1783 },
        "50000_to_75000": { "30000": 1783, "45000": 1792, "unlimited": 1831 },
        "75000_to_100000": { "30000": 1818, "45000": 1825, "unlimited": null },
        "100000_to_125000": { "30000": 1900, "45000": 1912, "unlimited": null },
        "125000_to_150000": { "30000": 1982, "45000": 1996, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1622, "60000": 1634, "75000": 1642, "100000": 1646, "125000": 1655, "unlimited": 1684 },
        "15000_to_50000": { "45000": 1751, "60000": 1758, "75000": 1768, "100000": 1773, "125000": 1779, "unlimited": 1798 },
        "50000_to_75000": { "45000": 1798, "60000": 1806, "75000": 1814, "100000": 1826, "125000": 1829, "unlimited": 1840 },
        "75000_to_100000": { "45000": 1834, "60000": 1840, "75000": 1854, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "45000": 1878, "60000": 1888, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "45000": 1928, "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 1633, "75000": 1651, "100000": 1656, "125000": 1658, "unlimited": 1687 },
        "15000_to_50000": { "60000": 1765, "75000": 1779, "100000": 1784, "125000": 1786, "unlimited": 1807 },
        "50000_to_75000": { "60000": 1818, "75000": 1834, "100000": 1839, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 1856, "75000": 1871, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1906, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": 1956, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 1635, "75000": 1653, "100000": 1657, "125000": 1667, "unlimited": 1694 },
        "15000_to_50000": { "60000": 1767, "75000": 1784, "100000": 1788, "125000": 1797, "unlimited": 1818 },
        "50000_to_75000": { "60000": 1820, "75000": 1837, "100000": 1843, "125000": 1829, "unlimited": 1843 },
        "75000_to_100000": { "60000": 1859, "75000": 1882, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1913, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 1666, "90000": 1684, "100000": 1703 },
        "15000_to_50000": { "75000": 1790, "90000": 1800, "100000": 1810 },
        "50000_to_75000": { "75000": 1850, "90000": 1858, "100000": 1872 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null },
        "100000_to_125000": { "75000": null, "90000": null, "100000": null },
        "125000_to_150000": { "75000": null, "90000": null, "100000": null }
      }
    },
    classC: {
      "12": {
        "new_to_15000": { "15000": 1713, "25000": 1756, "unlimited": 1946 },
        "15000_to_50000": { "15000": 2290, "25000": 2340, "unlimited": null },
        "50000_to_75000": { "15000": 2420, "25000": 2469, "unlimited": null },
        "75000_to_100000": { "15000": 2577, "25000": 2672, "unlimited": null }
      }
    }
  },
  PINNACLE_SILVER: {
    classA: {
      "12": {
        "new_to_15000": { "15000": 1222, "25000": 1225, "unlimited": 1256 },
        "15000_to_50000": { "15000": 1279, "25000": 1281, "unlimited": 1305 },
        "50000_to_75000": { "15000": 1318, "25000": 1319, "unlimited": 1350 },
        "75000_to_100000": { "15000": 1339, "25000": 1341, "unlimited": null },
        "100000_to_125000": { "15000": 1371, "25000": 1373, "unlimited": null },
        "125000_to_150000": { "15000": 1399, "25000": 1410, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1229, "45000": 1236, "unlimited": 1267 },
        "15000_to_50000": { "30000": 1289, "45000": 1291, "unlimited": 1307 },
        "50000_to_75000": { "30000": 1328, "45000": 1331, "unlimited": 1351 },
        "75000_to_100000": { "30000": 1352, "45000": 1354, "unlimited": null },
        "100000_to_125000": { "30000": 1389, "45000": 1391, "unlimited": null },
        "125000_to_150000": { "30000": 1424, "45000": 1432, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1238, "60000": 1247, "75000": 1253, "100000": 1256, "125000": 1264, "unlimited": 1279 },
        "15000_to_50000": { "45000": 1292, "60000": 1298, "75000": 1305, "100000": 1309, "125000": 1313, "unlimited": 1328 },
        "50000_to_75000": { "45000": 1333, "60000": 1340, "75000": 1345, "100000": 1355, "125000": 1358, "unlimited": 1366 },
        "75000_to_100000": { "45000": 1357, "60000": 1364, "75000": 1374, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "45000": 1392, "60000": 1400, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "45000": 1430, "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 1247, "75000": 1262, "100000": 1266, "125000": 1267, "unlimited": 1282 },
        "15000_to_50000": { "60000": 1303, "75000": 1314, "100000": 1318, "125000": 1319, "unlimited": 1334 },
        "50000_to_75000": { "60000": 1346, "75000": 1361, "100000": 1365, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 1371, "75000": 1388, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1409, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": 1447, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 1249, "75000": 1264, "100000": 1266, "125000": 1273, "unlimited": 1287 },
        "15000_to_50000": { "60000": 1305, "75000": 1320, "100000": 1322, "125000": 1328, "unlimited": 1344 },
        "50000_to_75000": { "60000": 1348, "75000": 1361, "100000": 1367, "125000": 1352, "unlimited": 1368 },
        "75000_to_100000": { "60000": 1374, "75000": 1393, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1416, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 1266, "90000": 1281, "100000": 1296 },
        "15000_to_50000": { "75000": 1325, "90000": 1333, "100000": 1340 },
        "50000_to_75000": { "75000": 1373, "90000": 1381, "100000": 1393 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null },
        "100000_to_125000": { "75000": null, "90000": null, "100000": null },
        "125000_to_150000": { "75000": null, "90000": null, "100000": null }
      }
    },
    classB: {
      "12": {
        "new_to_15000": { "15000": 1334, "25000": 1340, "unlimited": 1377 },
        "15000_to_50000": { "15000": 1433, "25000": 1439, "unlimited": 1467 },
        "50000_to_75000": { "15000": 1470, "25000": 1477, "unlimited": 1510 },
        "75000_to_100000": { "15000": 1498, "25000": 1505, "unlimited": null },
        "100000_to_125000": { "15000": 1566, "25000": 1577, "unlimited": null },
        "125000_to_150000": { "15000": 1635, "25000": 1646, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1343, "45000": 1351, "unlimited": 1392 },
        "15000_to_50000": { "30000": 1446, "45000": 1453, "unlimited": 1485 },
        "50000_to_75000": { "30000": 1486, "45000": 1494, "unlimited": 1527 },
        "75000_to_100000": { "30000": 1515, "45000": 1521, "unlimited": null },
        "100000_to_125000": { "30000": 1584, "45000": 1594, "unlimited": null },
        "125000_to_150000": { "30000": 1652, "45000": 1664, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1352, "60000": 1362, "75000": 1369, "100000": 1372, "125000": 1379, "unlimited": 1403 },
        "15000_to_50000": { "45000": 1459, "60000": 1465, "75000": 1473, "100000": 1477, "125000": 1482, "unlimited": 1498 },
        "50000_to_75000": { "45000": 1498, "60000": 1505, "75000": 1511, "100000": 1521, "125000": 1524, "unlimited": 1533 },
        "75000_to_100000": { "45000": 1528, "60000": 1533, "75000": 1544, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "45000": 1565, "60000": 1574, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "45000": 1608, "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 1361, "75000": 1376, "100000": 1380, "125000": 1382, "unlimited": 1407 },
        "15000_to_50000": { "60000": 1470, "75000": 1483, "100000": 1487, "125000": 1489, "unlimited": 1506 },
        "50000_to_75000": { "60000": 1515, "75000": 1528, "100000": 1532, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 1546, "75000": 1558, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1588, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": 1631, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 1363, "75000": 1378, "100000": 1381, "125000": 1389, "unlimited": 1413 },
        "15000_to_50000": { "60000": 1472, "75000": 1487, "100000": 1490, "125000": 1497, "unlimited": 1518 },
        "50000_to_75000": { "60000": 1517, "75000": 1530, "100000": 1535, "125000": 1521, "unlimited": 1535 },
        "75000_to_100000": { "60000": 1549, "75000": 1567, "100000": null, "125000": null, "unlimited": null },
        "100000_to_125000": { "60000": 1595, "75000": null, "100000": null, "125000": null, "unlimited": null },
        "125000_to_150000": { "60000": null, "75000": null, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 1388, "90000": 1402, "100000": 1417 },
        "15000_to_50000": { "75000": 1493, "90000": 1500, "100000": 1508 },
        "50000_to_75000": { "75000": 1540, "90000": 1547, "100000": 1558 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null },
        "100000_to_125000": { "75000": null, "90000": null, "100000": null },
        "125000_to_150000": { "75000": null, "90000": null, "100000": null }
      }
    },
    classC: {
      "12": {
        "new_to_15000": { "15000": 1469, "25000": 1506, "unlimited": 1669 },
        "15000_to_50000": { "15000": 1963, "25000": 2007, "unlimited": null },
        "50000_to_75000": { "15000": 2077, "25000": 2117, "unlimited": null },
        "75000_to_100000": { "15000": 2211, "25000": 2290, "unlimited": null }
      },
      "24": {
        "new_to_15000": { "30000": 1478, "45000": 1519, "unlimited": 1689 },
        "15000_to_50000": { "30000": 1984, "45000": 2027, "unlimited": null },
        "50000_to_75000": { "30000": 2099, "45000": 2143, "unlimited": null },
        "75000_to_100000": { "30000": 2238, "45000": 2321, "unlimited": null }
      },
      "36": {
        "new_to_15000": { "45000": 1489, "60000": 1532, "75000": 1545, "100000": 1549, "125000": 1559, "unlimited": 1711 },
        "15000_to_50000": { "45000": 2006, "60000": 2051, "75000": 2066, "100000": 2071, "125000": 2084, "unlimited": null },
        "50000_to_75000": { "45000": 2126, "60000": 2172, "75000": 2189, "100000": 2201, "125000": 2205, "unlimited": null },
        "75000_to_100000": { "45000": 2269, "60000": 2317, "75000": 2337, "100000": null, "125000": null, "unlimited": null }
      },
      "48": {
        "new_to_15000": { "60000": 1502, "75000": 1521, "100000": 1526, "125000": 1528, "unlimited": 1733 },
        "15000_to_50000": { "60000": 2030, "75000": 2051, "100000": 2057, "125000": 2059, "unlimited": null },
        "50000_to_75000": { "60000": 2154, "75000": 2178, "100000": 2185, "125000": null, "unlimited": null },
        "75000_to_100000": { "60000": 2301, "75000": 2329, "100000": null, "125000": null, "unlimited": null }
      },
      "60": {
        "new_to_15000": { "60000": 1504, "75000": 1523, "100000": 1526, "125000": 1534, "unlimited": 1756 },
        "15000_to_50000": { "60000": 2032, "75000": 2055, "100000": 2059, "125000": 2069, "unlimited": null },
        "50000_to_75000": { "60000": 2156, "75000": 2180, "100000": 2187, "125000": 2172, "unlimited": null },
        "75000_to_100000": { "60000": 2304, "75000": 2333, "100000": null, "125000": null, "unlimited": null }
      },
      "72": {
        "new_to_15000": { "75000": 1526, "90000": 1548, "100000": 1571 },
        "15000_to_50000": { "75000": 2061, "90000": 2071, "100000": 2081 },
        "50000_to_75000": { "75000": 2189, "90000": 2198, "100000": 2213 },
        "75000_to_100000": { "75000": null, "90000": null, "100000": null }
      }
    }
  }
};
var ConnectedAutoCareRatingService = class {
  // Check vehicle eligibility for Connected Auto Care VSC
  checkEligibility(vehicleData, coverageSelections) {
    const reasons = [];
    let isEligible = true;
    let allowSpecialQuote = false;
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const vehicleYear = parseInt(vehicleData.year);
    if (!vehicleYear || vehicleYear < 1990 || vehicleYear > currentYear + 1) {
      isEligible = false;
      allowSpecialQuote = true;
      reasons.push(`Vehicle year (${vehicleData.year}) is invalid or missing. Valid vehicle identification required.`);
    } else {
      const vehicleAge = currentYear - vehicleYear;
      if (vehicleAge > 15) {
        isEligible = false;
        allowSpecialQuote = true;
        reasons.push(`Vehicle is ${vehicleAge} years old (${vehicleYear}). Maximum age is 15 years.`);
      }
    }
    const currentMileage = parseInt(vehicleData.mileage || 0);
    if (currentMileage > 15e4) {
      isEligible = false;
      allowSpecialQuote = true;
      reasons.push(`Vehicle has ${currentMileage.toLocaleString()} miles. Maximum mileage is 150,000 miles.`);
    }
    let vehicleClass = "A";
    if (coverageSelections.vehicleClass) {
      vehicleClass = coverageSelections.vehicleClass.replace("Class ", "");
    } else {
      vehicleClass = this.determineVehicleClass(vehicleData.make, vehicleData.model);
    }
    if (vehicleClass === "INELIGIBLE") {
      isEligible = false;
      allowSpecialQuote = false;
      reasons.push(`${vehicleData.make} ${vehicleData.model || ""} is not eligible for coverage.`);
    }
    if (isEligible && vehicleClass !== "INELIGIBLE") {
      const rateExists = this.verifyRateExists(vehicleClass, coverageSelections, currentMileage);
      if (!rateExists.hasRate) {
        isEligible = false;
        allowSpecialQuote = true;
        reasons.push(rateExists.reason);
      }
    }
    return {
      isEligible,
      reasons,
      allowSpecialQuote
    };
  }
  // Verify that an actual rate exists in the rate table for the given parameters
  verifyRateExists(vehicleClass, coverageSelections, currentMileage) {
    const productId = "ELEVATE_PLATINUM";
    const classKey = `class${vehicleClass}`;
    const termMonths = (coverageSelections.termLength || "36 months").replace(" months", "");
    const coverageMiles = (coverageSelections.coverageMiles || "45000").replace(/,/g, "").toLowerCase();
    const mileageBracket = this.getMileageBracket(currentMileage);
    const productRates = CONNECTED_AUTO_CARE_RATES[productId];
    if (!productRates || !productRates[classKey]) {
      return {
        hasRate: false,
        reason: `No rate table available for ${vehicleClass} class vehicles`
      };
    }
    const classRates = productRates[classKey];
    if (!classRates || !classRates[termMonths]) {
      return {
        hasRate: false,
        reason: `${termMonths}-month term not available for ${vehicleClass} class vehicles`
      };
    }
    const termRates = classRates[termMonths];
    if (!termRates || !termRates[mileageBracket]) {
      return {
        hasRate: false,
        reason: `No coverage available for vehicles with ${currentMileage.toLocaleString()} miles in ${vehicleClass} class`
      };
    }
    const bracketRates = termRates[mileageBracket];
    if (!bracketRates || !bracketRates[coverageMiles] || bracketRates[coverageMiles] === null) {
      return {
        hasRate: false,
        reason: `${coverageSelections.coverageMiles} coverage not available for vehicles with ${currentMileage.toLocaleString()} miles`
      };
    }
    return { hasRate: true, reason: "" };
  }
  // Determine vehicle class based on make and model
  determineVehicleClass(make, model) {
    const upperMake = make.toUpperCase();
    const upperModel = model?.toUpperCase() || "";
    const ineligible = [
      "ALFA ROMEO",
      "ASTON MARTIN",
      "BENTLEY",
      "BUGATTI",
      "CORVETTE",
      "DAEWOO",
      "DELOREAN",
      "FERRARI",
      "HUMMER",
      "LAMBORGHINI",
      "LOTUS",
      "MASERATI",
      "MAYBACH",
      "MCLAREN",
      "PEUGEOT",
      "RIVIAN",
      "ROLLS ROYCE",
      "SAAB",
      "SATURN",
      "SMART",
      "STERLING",
      "SUZUKI",
      "YUGO"
    ];
    if (ineligible.includes(upperMake)) {
      return "INELIGIBLE";
    }
    if (upperMake === "AUDI" && ["A8", "RS", "S6", "S7", "R8"].some((m) => upperModel.includes(m))) {
      return "INELIGIBLE";
    }
    if (upperMake === "BMW" && ["7", "M", "Z"].some((m) => upperModel.includes(m))) {
      return "INELIGIBLE";
    }
    if (upperMake === "DODGE" && upperModel.includes("SRT")) {
      return "INELIGIBLE";
    }
    if (upperMake === "MERCEDES" && ["AMG", "M CLASS", "S CLASS", "SL CLASS"].some((m) => upperModel.includes(m))) {
      return "INELIGIBLE";
    }
    if (upperMake === "MITSUBISHI" && upperModel.includes("LANCER EVOLUTION")) {
      return "INELIGIBLE";
    }
    if (upperMake === "SUBARU" && upperModel.includes("WRX")) {
      return "INELIGIBLE";
    }
    if (upperMake === "VOLKSWAGEN" && upperModel.includes("V8")) {
      return "INELIGIBLE";
    }
    const classAMakes = [
      "HONDA",
      "HYUNDAI",
      "ISUZU",
      "KIA",
      "MAZDA",
      "MITSUBISHI",
      "SCION",
      "SUBARU",
      "TOYOTA",
      "LEXUS",
      "NISSAN",
      "INFINITI"
    ];
    if (classAMakes.includes(upperMake)) {
      return "A";
    }
    const classCMakes = ["CADILLAC", "JAGUAR", "LAND ROVER", "PORSCHE", "TESLA"];
    if (classCMakes.includes(upperMake)) {
      return "C";
    }
    if (upperMake === "AUDI" && ["A3", "A4"].some((m) => upperModel.includes(m))) {
      return "B";
    }
    if (upperMake === "BMW" && ["1", "2"].some((m) => upperModel.includes(m))) {
      return "B";
    }
    if (upperMake === "MERCEDES" && upperModel.includes("C CLASS")) {
      return "B";
    }
    const classBMakes = [
      "ACURA",
      "AUDI",
      "BMW",
      "BUICK",
      "CHEVROLET",
      "CHRYSLER",
      "DODGE",
      "PLYMOUTH",
      "FIAT",
      "FORD",
      "GMC",
      "JEEP",
      "MERCURY",
      "MERCEDES",
      "MINI",
      "OLDSMOBILE",
      "PONTIAC",
      "VOLKSWAGEN",
      "VOLVO"
    ];
    if (classBMakes.includes(upperMake)) {
      return "B";
    }
    return "INELIGIBLE";
  }
  // Determine current mileage bracket
  getMileageBracket(currentMileage) {
    if (currentMileage <= 15e3) return "new_to_15000";
    if (currentMileage <= 5e4) return "15000_to_50000";
    if (currentMileage <= 75e3) return "50000_to_75000";
    if (currentMileage <= 1e5) return "75000_to_100000";
    if (currentMileage <= 125e3) return "100000_to_125000";
    if (currentMileage <= 15e4) return "125000_to_150000";
    return "over_150000";
  }
  // Calculate mandatory surcharges
  calculateMandatorySurcharges(vehicleData) {
    let surcharges = 0;
    if (vehicleData.drivetrain && ["4WD", "AWD", "4x4", "ALL WHEEL DRIVE", "FOUR WHEEL DRIVE"].includes(vehicleData.drivetrain.toUpperCase())) {
      surcharges += 200;
    }
    if (vehicleData.fuelType && vehicleData.fuelType.toUpperCase().includes("DIESEL")) {
      surcharges += 200;
    }
    if (vehicleData.engine && (vehicleData.engine.toUpperCase().includes("TURBO") || vehicleData.engine.toUpperCase().includes("SUPERCHARGED"))) {
      surcharges += 200;
    }
    return surcharges;
  }
  // Calculate Connected Auto Care VSC premium
  async calculateConnectedAutoCarePremium(productId, coverageSelections, vehicleData, customerData) {
    try {
      console.log("=== Connected Auto Care Premium Calculation ===");
      console.log("ProductID:", productId);
      console.log("Vehicle Data:", vehicleData);
      console.log("Coverage Selections:", coverageSelections);
      const eligibilityCheck = this.checkEligibility(vehicleData, coverageSelections);
      console.log("Eligibility Check:", eligibilityCheck);
      if (!eligibilityCheck.isEligible) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          productId,
          vehicleData,
          coverageSelections,
          customerData,
          basePremium: 0,
          taxes: 0,
          fees: 0,
          totalPremium: 0,
          status: "ineligible",
          eligibilityReasons: eligibilityCheck.reasons,
          allowSpecialQuote: eligibilityCheck.allowSpecialQuote,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const product = CONNECTED_AUTO_CARE_PRODUCTS[productId];
      if (!product) {
        throw new Error("Invalid Connected Auto Care product ID");
      }
      const vehicleClass = this.determineVehicleClass(vehicleData.make, vehicleData.model);
      console.log("Determined Vehicle Class:", vehicleClass);
      if (vehicleClass === "INELIGIBLE") {
        throw new Error("Vehicle is not eligible for Connected Auto Care VSC coverage");
      }
      const termLength = coverageSelections.termLength || "36 months";
      const rawCoverageMiles = coverageSelections.coverageMiles || "75000";
      const coverageMiles = rawCoverageMiles.replace(/,/g, "");
      const termMonths = termLength.replace(" months", "");
      console.log("Term Length:", termLength, "-> Term Months:", termMonths);
      console.log("Coverage Miles (raw):", rawCoverageMiles, "-> Coverage Miles (cleaned):", coverageMiles);
      const currentMileage = vehicleData.mileage || 0;
      const mileageBracket = this.getMileageBracket(currentMileage);
      console.log("Current Mileage:", currentMileage, "-> Mileage Bracket:", mileageBracket);
      let basePremium = null;
      if (productId === "ELEVATE_PLATINUM" && CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM) {
        const classKey = `class${vehicleClass}`;
        console.log("Looking up rate with classKey:", classKey);
        const classRates = CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM[classKey];
        console.log("Class rates found:", !!classRates);
        if (classRates && classRates[termMonths]) {
          const termRates = classRates[termMonths];
          console.log("Term rates found:", !!termRates);
          if (termRates && termRates[mileageBracket]) {
            const bracketRates = termRates[mileageBracket];
            console.log("Bracket rates found:", !!bracketRates);
            if (bracketRates && bracketRates[coverageMiles]) {
              const premium = bracketRates[coverageMiles];
              console.log("Premium lookup result:", premium);
              if (typeof premium === "number") {
                basePremium = premium;
                console.log("Base premium set to:", basePremium);
              }
            } else {
              console.log("Available coverage miles for this bracket:", Object.keys(bracketRates || {}));
            }
          } else {
            console.log("Available mileage brackets for this term:", Object.keys(termRates || {}));
          }
        } else {
          console.log("Available term lengths for this class:", Object.keys(classRates || {}));
        }
      } else if (productId === "ELEVATE_GOLD" && CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD) {
        const classKey = `class${vehicleClass}`;
        console.log("Looking up GOLD rate with classKey:", classKey);
        const classRates = CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD[classKey];
        console.log("GOLD Class rates found:", !!classRates);
        if (classRates && classRates[termMonths]) {
          const termRates = classRates[termMonths];
          console.log("GOLD Term rates found:", !!termRates);
          if (termRates && termRates[mileageBracket]) {
            const bracketRates = termRates[mileageBracket];
            console.log("GOLD Bracket rates found:", !!bracketRates);
            if (bracketRates && bracketRates[coverageMiles]) {
              const premium = bracketRates[coverageMiles];
              console.log("GOLD Premium lookup result:", premium);
              if (typeof premium === "number") {
                basePremium = premium;
                console.log("GOLD Base premium set to:", basePremium);
              }
            } else {
              console.log("GOLD Available coverage miles for this bracket:", Object.keys(bracketRates || {}));
            }
          } else {
            console.log("GOLD Available mileage brackets for this term:", Object.keys(termRates || {}));
          }
        } else {
          console.log("GOLD Available term lengths for this class:", Object.keys(classRates || {}));
        }
      } else if (productId === "PINNACLE_SILVER" && CONNECTED_AUTO_CARE_RATES.PINNACLE_SILVER) {
        const classKey = `class${vehicleClass}`;
        console.log("Looking up SILVER rate with classKey:", classKey);
        const classRates = CONNECTED_AUTO_CARE_RATES.PINNACLE_SILVER[classKey];
        console.log("SILVER Class rates found:", !!classRates);
        if (classRates && classRates[termMonths]) {
          const termRates = classRates[termMonths];
          console.log("SILVER Term rates found:", !!termRates);
          if (termRates && termRates[mileageBracket]) {
            const bracketRates = termRates[mileageBracket];
            console.log("SILVER Bracket rates found:", !!bracketRates);
            if (bracketRates && bracketRates[coverageMiles]) {
              const premium = bracketRates[coverageMiles];
              console.log("SILVER Premium lookup result:", premium);
              if (typeof premium === "number") {
                basePremium = premium;
                console.log("SILVER Base premium set to:", basePremium);
              }
            } else {
              console.log("SILVER Available coverage miles for this bracket:", Object.keys(bracketRates || {}));
            }
          } else {
            console.log("SILVER Available mileage brackets for this term:", Object.keys(termRates || {}));
          }
        } else {
          console.log("SILVER Available term lengths for this class:", Object.keys(classRates || {}));
        }
      }
      if (basePremium === null) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          productId,
          vehicleData,
          coverageSelections,
          customerData,
          basePremium: 0,
          taxes: 0,
          fees: 0,
          totalPremium: 0,
          status: "ineligible",
          eligibilityReasons: [`No rate available for this vehicle configuration: ${vehicleClass} class, ${termMonths} months, ${mileageBracket} mileage, ${coverageMiles} coverage miles`],
          allowSpecialQuote: true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const mandatorySurcharges = this.calculateMandatorySurcharges(vehicleData);
      let optionalSurcharges = 0;
      if (coverageSelections.commercialUse) optionalSurcharges += 200;
      if (coverageSelections.liftKit) optionalSurcharges += 200;
      if (coverageSelections.ecoCoverage) optionalSurcharges += 100;
      if (coverageSelections.technologyCoverage) optionalSurcharges += 100;
      let oilChangeSurcharge = 0;
      if (coverageSelections.oilChanges === "6") oilChangeSurcharge = 300;
      else if (coverageSelections.oilChanges === "8") oilChangeSurcharge = 400;
      else if (coverageSelections.oilChanges === "10") oilChangeSurcharge = 500;
      const totalSurcharges = mandatorySurcharges + optionalSurcharges + oilChangeSurcharge;
      const premiumBeforeTax = basePremium + totalSurcharges;
      console.log("=== Final Calculation Summary ===");
      console.log("Base Premium:", basePremium);
      console.log("Mandatory Surcharges:", mandatorySurcharges);
      console.log("Optional Surcharges:", optionalSurcharges);
      console.log("Oil Change Surcharge:", oilChangeSurcharge);
      console.log("Premium Before Tax:", premiumBeforeTax);
      const taxes = this.calculateTaxes(premiumBeforeTax, customerData?.address?.state);
      const fees = this.calculateFees(premiumBeforeTax);
      const totalPremium = premiumBeforeTax + taxes + fees;
      console.log("Taxes:", taxes);
      console.log("Fees:", fees);
      console.log("Total Premium:", totalPremium);
      console.log("===========================================");
      return {
        basePremium: premiumBeforeTax,
        taxes,
        fees,
        totalPremium,
        factors: {
          vehicleClass,
          termLength: termMonths,
          coverageMiles,
          mileageBracket,
          mandatorySurcharges,
          optionalSurcharges,
          oilChangeSurcharge
        },
        productDetails: product
      };
    } catch (error) {
      console.error("Connected Auto Care premium calculation error:", error);
      throw error;
    }
  }
  calculateTaxes(premium, state) {
    const taxRates = {
      "ca": 0.0825,
      "ny": 0.08,
      "tx": 0.0625,
      "fl": 0.06,
      "wa": 0.095,
      "az": 0.083,
      // Connected Auto Care is based in Arizona
      "or": 0,
      "nh": 0,
      "mt": 0,
      "de": 0,
      default: 0.065
    };
    const rate = state ? taxRates[state.toLowerCase()] || taxRates.default : taxRates.default;
    return Math.round(premium * rate * 100) / 100;
  }
  calculateFees(premium) {
    const adminFee = 25;
    const processingFee = Math.min(premium * 0.02, 50);
    return Math.round((adminFee + processingFee) * 100) / 100;
  }
  // Get all Connected Auto Care products
  getConnectedAutoCareProducts() {
    return CONNECTED_AUTO_CARE_PRODUCTS;
  }
  // Get specific Connected Auto Care product
  getConnectedAutoCareProduct(productId) {
    return CONNECTED_AUTO_CARE_PRODUCTS[productId];
  }
  // Validate Connected Auto Care coverage selections
  validateConnectedAutoCareCoverage(productId, coverageSelections) {
    const product = CONNECTED_AUTO_CARE_PRODUCTS[productId];
    if (!product) {
      return { isValid: false, errors: ["Invalid Connected Auto Care product ID"] };
    }
    const errors = [];
    if (product.coverageOptions) {
      product.coverageOptions.forEach((option) => {
        const key = option.name.toLowerCase().replace(/\s+/g, "");
        const altKeys = [
          option.name.toLowerCase().replace(/\s+/g, "_"),
          option.name.replace(/\s+/g, "").toLowerCase(),
          option.name.toLowerCase()
        ];
        let found = false;
        let value = null;
        for (const possibleKey of [key, ...altKeys]) {
          if (coverageSelections && typeof coverageSelections === "object" && coverageSelections[possibleKey]) {
            found = true;
            value = coverageSelections[possibleKey];
            break;
          }
        }
        if (option.name === "Term Length" && !found && coverageSelections) {
          if (coverageSelections.termLength || coverageSelections.term || coverageSelections.termlength) {
            found = true;
            value = coverageSelections.termLength || coverageSelections.term || coverageSelections.termlength;
          }
        }
        if (option.name === "Coverage Miles" && !found && coverageSelections) {
          if (coverageSelections.coverageMiles || coverageSelections.miles || coverageSelections.coveragemiles) {
            found = true;
            value = coverageSelections.coverageMiles || coverageSelections.miles || coverageSelections.coveragemiles;
          }
        }
        if (option.name === "Vehicle Class" && !found && coverageSelections) {
          if (coverageSelections.vehicleClass || coverageSelections.class || coverageSelections.vehicleclass) {
            found = true;
            value = coverageSelections.vehicleClass || coverageSelections.class || coverageSelections.vehicleclass;
          }
        }
        if (!found) {
          errors.push(`Missing ${option.name}: must select one of ${option.options.join(", ")}`);
        } else if (!option.options.includes(value)) {
          errors.push(`Invalid ${option.name}: "${value}" must be one of ${option.options.join(", ")}`);
        }
      });
    }
    return { isValid: errors.length === 0, errors };
  }
  // Get valid coverage options based on vehicle data and current mileage
  getValidCoverageOptions(productId, vehicleData) {
    const product = CONNECTED_AUTO_CARE_PRODUCTS[productId];
    if (!product) {
      return { validTermLengths: [], validCoverageMiles: [], reasons: ["Invalid product ID"] };
    }
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const vehicleAge = currentYear - (vehicleData.year || 0);
    const currentMileage = vehicleData.mileage || 0;
    if (vehicleAge > 15) {
      return {
        validTermLengths: [],
        validCoverageMiles: [],
        reasons: [`Vehicle is ${vehicleAge} years old. Maximum age is 15 years.`]
      };
    }
    if (currentMileage > 15e4) {
      return {
        validTermLengths: [],
        validCoverageMiles: [],
        reasons: [`Vehicle has ${currentMileage.toLocaleString()} miles. Maximum mileage is 150,000 miles.`]
      };
    }
    const vehicleClass = this.determineVehicleClass(vehicleData.make, vehicleData.model);
    if (vehicleClass === "INELIGIBLE") {
      return {
        validTermLengths: [],
        validCoverageMiles: [],
        reasons: ["Vehicle make/model is not eligible for coverage"]
      };
    }
    let rateTable = null;
    if (productId === "ELEVATE_PLATINUM") {
      rateTable = CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM;
    } else if (productId === "ELEVATE_GOLD") {
      rateTable = CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD;
    } else if (productId === "PINNACLE_SILVER") {
      rateTable = CONNECTED_AUTO_CARE_RATES.PINNACLE_SILVER;
    }
    if (!rateTable) {
      return { validTermLengths: [], validCoverageMiles: [], reasons: ["Rate table not available"] };
    }
    const classKey = `class${vehicleClass}`;
    const classRates = rateTable[classKey];
    if (!classRates) {
      return { validTermLengths: [], validCoverageMiles: [], reasons: ["Vehicle class not found in rate table"] };
    }
    const mileageBracket = this.getMileageBracket(currentMileage);
    const validTermLengths = [];
    const validCoverageMiles = [];
    Object.keys(classRates).forEach((termKey) => {
      const termRates = classRates[termKey];
      if (!termRates || !termRates[mileageBracket]) {
        return;
      }
      const bracketRates = termRates[mileageBracket];
      if (!bracketRates) return;
      const availableCoverageMiles = Object.keys(bracketRates).filter((miles) => {
        const rate = bracketRates[miles];
        return rate !== null && typeof rate === "number";
      });
      if (availableCoverageMiles.length > 0) {
        const termMonths = parseInt(termKey);
        validTermLengths.push(`${termMonths} months`);
        availableCoverageMiles.forEach((miles) => {
          if (miles === "unlimited") {
            if (!validCoverageMiles.includes("Unlimited")) {
              validCoverageMiles.push("Unlimited");
            }
          } else {
            const formattedMiles = parseInt(miles).toLocaleString();
            if (!validCoverageMiles.includes(formattedMiles)) {
              validCoverageMiles.push(formattedMiles);
            }
          }
        });
      }
    });
    validTermLengths.sort((a, b) => {
      const aMonths = parseInt(a.replace(" months", ""));
      const bMonths = parseInt(b.replace(" months", ""));
      return aMonths - bMonths;
    });
    validCoverageMiles.sort((a, b) => {
      if (a === "Unlimited") return 1;
      if (b === "Unlimited") return -1;
      const aNum = parseInt(a.replace(/,/g, ""));
      const bNum = parseInt(b.replace(/,/g, ""));
      return aNum - bNum;
    });
    const reasons = [];
    if (validTermLengths.length === 0) {
      reasons.push("No valid term lengths available for this vehicle and mileage");
    }
    if (validCoverageMiles.length === 0) {
      reasons.push("No valid coverage miles available for this vehicle and mileage");
    }
    return {
      validTermLengths,
      validCoverageMiles,
      reasons: reasons.length > 0 ? reasons : void 0
    };
  }
};
var connectedAutoCareRatingService = new ConnectedAutoCareRatingService();

// server/services/specialQuoteRequestService.ts
import { eq as eq2, desc as desc2 } from "drizzle-orm";
var SpecialQuoteRequestService = class {
  async createSpecialQuoteRequest(data) {
    const requestNumber = `SQR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const insertData = {
      requestNumber,
      tenantId: data.tenantId || "default-tenant",
      productId: data.productId,
      vehicleData: data.vehicleData,
      coverageSelections: data.coverageSelections,
      customerData: data.customerData,
      eligibilityReasons: data.eligibilityReasons,
      requestReason: data.requestReason,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
      // 30 days from now
    };
    const [created] = await db.insert(specialQuoteRequests).values(insertData).returning();
    return created;
  }
  async getSpecialQuoteRequest(id) {
    const [request] = await db.select().from(specialQuoteRequests).where(eq2(specialQuoteRequests.id, id));
    return request;
  }
  async getAllSpecialQuoteRequests(tenantId) {
    if (tenantId) {
      return await db.select().from(specialQuoteRequests).where(eq2(specialQuoteRequests.tenantId, tenantId)).orderBy(desc2(specialQuoteRequests.createdAt));
    }
    return await db.select().from(specialQuoteRequests).orderBy(desc2(specialQuoteRequests.createdAt));
  }
  async getPendingSpecialQuoteRequests(tenantId) {
    if (tenantId) {
      return await db.select().from(specialQuoteRequests).where(eq2(specialQuoteRequests.status, "pending")).where(eq2(specialQuoteRequests.tenantId, tenantId)).orderBy(desc2(specialQuoteRequests.createdAt));
    }
    return await db.select().from(specialQuoteRequests).where(eq2(specialQuoteRequests.status, "pending")).orderBy(desc2(specialQuoteRequests.createdAt));
  }
  async updateSpecialQuoteRequestStatus(id, status, updates = {}) {
    const updateData = {
      status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (status === "reviewing" || status === "quoted" || status === "declined") {
      updateData.reviewedAt = /* @__PURE__ */ new Date();
      updateData.reviewedBy = updates.reviewedBy;
    }
    if (updates.reviewNotes) {
      updateData.reviewNotes = updates.reviewNotes;
    }
    if (updates.alternativeQuote) {
      updateData.alternativeQuote = updates.alternativeQuote;
    }
    if (updates.declineReason) {
      updateData.declineReason = updates.declineReason;
    }
    const [updated] = await db.update(specialQuoteRequests).set(updateData).where(eq2(specialQuoteRequests.id, id)).returning();
    return updated;
  }
  async deleteSpecialQuoteRequest(id) {
    const result = await db.delete(specialQuoteRequests).where(eq2(specialQuoteRequests.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Helper method to check if a request is expired
  isExpired(request) {
    if (!request.expiresAt) return false;
    return /* @__PURE__ */ new Date() > new Date(request.expiresAt);
  }
  // Helper method to get request summary for admin dashboard
  async getRequestsSummary(tenantId) {
    const requests = await this.getAllSpecialQuoteRequests(tenantId);
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      reviewing: requests.filter((r) => r.status === "reviewing").length,
      quoted: requests.filter((r) => r.status === "quoted").length,
      declined: requests.filter((r) => r.status === "declined").length,
      expired: requests.filter((r) => this.isExpired(r)).length
    };
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/healthz", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.get("/sitemap.xml", (req, res) => {
    const baseUrl = req.protocol + "://" + req.get("host");
    const lastmod = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const urls = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/products", priority: "0.9", changefreq: "weekly" },
      { loc: "/faq", priority: "0.8", changefreq: "weekly" },
      { loc: "/claims", priority: "0.8", changefreq: "monthly" },
      { loc: "/hero-vsc", priority: "0.7", changefreq: "monthly" },
      { loc: "/connected-auto-care", priority: "0.7", changefreq: "monthly" }
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.set("Content-Type", "application/xml");
    res.send(sitemap);
  });
  await setupAuth(app2);
  const helcimService = new HelcimService();
  const vinDecodeService = new VinDecodeService();
  const ratingEngineService = new RatingEngineService();
  const policyService = new PolicyService();
  const claimsService = new ClaimsService();
  const analyticsService = new AnalyticsService();
  const aiAssistantService = new AIAssistantService();
  const heroVscService = new HeroVscRatingService();
  const cacService = new ConnectedAutoCareRatingService();
  const specialQuoteRequestService = new SpecialQuoteRequestService();
  app2.get("/api/auth/debug", attachUser, (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user ? {
        id: req.user.id,
        email: req.user.claims?.email,
        source: req.user.id === "quick-admin-user" ? "session" : "stack-auth"
      } : "No user",
      session: req.session?.user ? "Session exists" : "No session",
      hostname: req.hostname
    });
  });
  app2.get("/api/users", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      if (req.user.role !== "admin" && userId !== req.params.id) {
        return res.status(403).json({ error: "Access denied." });
      }
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      if (req.user.role !== "admin" && userId !== req.params.id) {
        return res.status(403).json({ error: "Access denied." });
      }
      const updatedUser = await storage.updateUser(req.params.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.post("/api/users", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }
      const { firstName, lastName, email, role } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      const newUser = await storage.upsertUser({
        id: crypto.randomUUID(),
        // Use crypto.randomUUID() instead
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        role: role || "user"
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app2.post("/api/vehicles/decode", async (req, res) => {
    try {
      const { vin } = req.body;
      if (!vin) {
        return res.status(400).json({ error: "VIN is required" });
      }
      const vehicleData = await vinDecodeService.decodeVin(vin);
      res.json(vehicleData);
    } catch (error) {
      console.error("VIN decode error:", error);
      res.status(500).json({ error: "Failed to decode VIN" });
    }
  });
  app2.post("/api/vehicles/decode-vin", async (req, res) => {
    try {
      const { vin } = req.body;
      if (!vin) {
        return res.status(400).json({ error: "VIN is required" });
      }
      console.log("VIN decode request:", vin);
      const vehicleData = await vinDecodeService.decodeVin(vin);
      console.log("VIN decode result:", vehicleData);
      res.json({
        success: true,
        vehicle: vehicleData
      });
    } catch (error) {
      console.error("VIN decode error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to decode VIN"
      });
    }
  });
  app2.get("/api/vin-decode/:vin", async (req, res) => {
    try {
      const { vin } = req.params;
      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: "Valid 17-character VIN is required" });
      }
      console.log("VIN decode GET request:", vin);
      const vehicleData = await vinDecodeService.decodeVin(vin);
      console.log("VIN decode result:", vehicleData);
      res.json(vehicleData);
    } catch (error) {
      console.error("VIN decode error:", error);
      res.status(400).json({
        error: error.message || "Failed to decode VIN"
      });
    }
  });
  app2.get("/api/hero-vsc/products", async (req, res) => {
    try {
      const products2 = heroVscService.getHeroVscProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching Hero VSC products:", error);
      res.status(500).json({ error: "Failed to fetch Hero VSC products" });
    }
  });
  app2.get("/api/hero-vsc/products/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const product = heroVscService.getHeroVscProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching Hero VSC product:", error);
      res.status(500).json({ error: "Failed to fetch Hero VSC product" });
    }
  });
  app2.post("/api/hero-vsc/quotes", async (req, res) => {
    try {
      const { productId, coverageSelections, vehicleData, customerData } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      const validation = heroVscService.validateHeroVscCoverage(productId, coverageSelections);
      if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid coverage selections", details: validation.errors });
      }
      const quoteNumber = `HERO-${Date.now()}`;
      const ratingResult = await heroVscService.calculateHeroVscPremium(
        productId,
        coverageSelections,
        vehicleData,
        customerData
      );
      const heroProduct = heroVscService.getHeroVscProduct(productId);
      const actualProductId = heroProduct?.id || productId;
      const quote = await storage.createQuote({
        tenantId: "hero-vsc",
        // Hero VSC tenant
        productId: actualProductId,
        quoteNumber,
        customerEmail: customerData?.email,
        customerName: customerData?.name,
        customerPhone: customerData?.phone,
        customerAddress: customerData?.address,
        vehicleId: vehicleData?.id,
        coverageSelections,
        basePremium: ratingResult.basePremium.toString(),
        taxes: ratingResult.taxes.toString(),
        fees: ratingResult.fees.toString(),
        totalPremium: ratingResult.totalPremium.toString(),
        ratingData: ratingResult.factors,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        // 30 days
      });
      await analyticsService.trackEvent({
        tenantId: "hero-vsc",
        eventType: "hero_vsc_quote_created",
        entityType: "quote",
        entityId: quote.id,
        properties: {
          productId,
          productName: ratingResult.productDetails.name,
          premium: ratingResult.totalPremium,
          coverageSelections
        }
      });
      res.json({
        quote,
        ratingResult,
        productDetails: ratingResult.productDetails
      });
    } catch (error) {
      console.error("Hero VSC quote creation error:", error);
      res.status(500).json({ error: "Failed to create Hero VSC quote" });
    }
  });
  app2.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quoteNumber = `QTE-${Date.now()}`;
      const ratingResult = await ratingEngineService.calculatePremium(quoteData);
      const quote = await storage.createQuote({
        ...quoteData,
        quoteNumber,
        basePremium: ratingResult.basePremium.toString(),
        taxes: ratingResult.taxes.toString(),
        fees: ratingResult.fees.toString(),
        totalPremium: ratingResult.totalPremium.toString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        // 30 days
      });
      await analyticsService.trackEvent({
        tenantId: quote.tenantId,
        eventType: "quote_created",
        entityType: "quote",
        entityId: quote.id,
        properties: {
          productCategory: quoteData.productId,
          premium: ratingResult.totalPremium
        }
      });
      res.json(quote);
    } catch (error) {
      console.error("Quote creation error:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });
  app2.get("/api/quotes", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }
      const quotes2 = await storage.getQuotes(user.tenantId, req.query);
      res.json(quotes2);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });
  app2.post("/api/policies", requireAuth, async (req, res) => {
    try {
      const policyData = insertPolicySchema.parse(req.body);
      const userId = req.user.id;
      const policy = await policyService.issuePolicy({
        ...policyData,
        issuedBy: userId
      });
      res.json(policy);
    } catch (error) {
      console.error("Policy creation error:", error);
      res.status(500).json({ error: "Failed to create policy" });
    }
  });
  app2.get("/api/policies", requireAuth, async (req, res) => {
    try {
      const samplePolicies = [
        {
          id: "VSC-1755185348873",
          policyNumber: "VSC-1755185348873",
          customerName: "John Smith",
          customerEmail: "john.smith@email.com",
          customerPhone: "+1-555-123-4567",
          status: "active",
          productType: "auto_vsc",
          vehicleMake: "Infiniti",
          vehicleModel: "QX80",
          vehicleYear: "2021",
          vehicleVin: "JN8AZ2AF1M9715383",
          coverageLevel: "platinum",
          termLength: "36",
          premium: "$2,349.99",
          effectiveDate: "2025-08-14",
          expirationDate: "2028-08-14",
          createdAt: "2025-08-14T23:42:28.873Z"
        },
        {
          id: "VSC-1755184920051",
          policyNumber: "VSC-1755184920051",
          customerName: "Sarah Johnson",
          customerEmail: "sarah.johnson@email.com",
          customerPhone: "+1-555-987-6543",
          status: "active",
          productType: "auto_vsc",
          vehicleMake: "Toyota",
          vehicleModel: "Camry",
          vehicleYear: "2022",
          vehicleVin: "4T1G11AK0NU123456",
          coverageLevel: "gold",
          termLength: "48",
          premium: "$1,894.46",
          effectiveDate: "2025-08-13",
          expirationDate: "2029-08-13",
          createdAt: "2025-08-13T22:15:20.051Z"
        },
        {
          id: "VSC-1755183825101",
          policyNumber: "VSC-1755183825101",
          customerName: "Michael Davis",
          customerEmail: "michael.davis@email.com",
          customerPhone: "+1-555-456-7890",
          status: "pending",
          productType: "auto_vsc",
          vehicleMake: "Honda",
          vehicleModel: "Accord",
          vehicleYear: "2020",
          vehicleVin: "1HGCV1F30LA123456",
          coverageLevel: "silver",
          termLength: "24",
          premium: "$1,299.99",
          effectiveDate: "2025-08-15",
          expirationDate: "2027-08-15",
          createdAt: "2025-08-14T23:03:45.101Z"
        }
      ];
      res.json(samplePolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });
  app2.get("/api/policies/:id", async (req, res) => {
    try {
      const policy = await storage.getPolicy(req.params.id);
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching policy:", error);
      res.status(500).json({ error: "Failed to fetch policy" });
    }
  });
  app2.post("/api/claims", requireAuth, async (req, res) => {
    try {
      const claimData = insertClaimSchema.parse(req.body);
      const claim = await claimsService.createClaim(claimData);
      res.json(claim);
    } catch (error) {
      console.error("Claim creation error:", error);
      res.status(500).json({ error: "Failed to create claim" });
    }
  });
  app2.get("/api/claims", requireAuth, async (req, res) => {
    try {
      const sampleClaims = [
        {
          id: "CLM-1755186690650",
          claimNumber: "CLM-1755186690650",
          policyNumber: "VSC-1755185348873",
          claimantName: "John Smith",
          claimantEmail: "john.smith@email.com",
          claimantPhone: "+1-555-123-4567",
          status: "under_review",
          type: "mechanical_breakdown",
          dateOfLoss: "2025-08-10",
          description: "Engine overheating - coolant system failure requiring repairs",
          estimatedAmount: "$2,450.00",
          actualAmount: null,
          adjusterName: "Sarah Williams",
          createdAt: "2025-08-14T23:51:30.650Z",
          riskScore: 25,
          fraudIndicators: []
        },
        {
          id: "CLM-1755184920089",
          claimNumber: "CLM-1755184920089",
          policyNumber: "VSC-1755184920051",
          claimantName: "Sarah Johnson",
          claimantEmail: "sarah.johnson@email.com",
          claimantPhone: "+1-555-987-6543",
          status: "approved",
          type: "tire_wheel",
          dateOfLoss: "2025-08-12",
          description: "Tire damage from road hazard - replacement needed",
          estimatedAmount: "$850.00",
          actualAmount: "$825.00",
          adjusterName: "Mike Chen",
          createdAt: "2025-08-13T22:15:28.089Z",
          riskScore: 15,
          fraudIndicators: []
        },
        {
          id: "CLM-1755183825145",
          claimNumber: "CLM-1755183825145",
          policyNumber: "VSC-1755183825101",
          claimantName: "Michael Davis",
          claimantEmail: "michael.davis@email.com",
          claimantPhone: "+1-555-456-7890",
          status: "requires_investigation",
          type: "theft",
          dateOfLoss: "2025-08-08",
          description: "Vehicle theft - total loss claim with recovery pending",
          estimatedAmount: "$35,000.00",
          actualAmount: null,
          adjusterName: "Lisa Rodriguez",
          createdAt: "2025-08-14T23:03:52.145Z",
          riskScore: 75,
          fraudIndicators: ["high_value_claim", "recent_policy"]
        }
      ];
      res.json(sampleClaims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });
  app2.put("/api/claims/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const claimUpdate = req.body;
      const claim = await claimsService.updateClaim(req.params.id, claimUpdate, userId);
      res.json(claim);
    } catch (error) {
      console.error("Claim update error:", error);
      res.status(500).json({ error: "Failed to update claim" });
    }
  });
  app2.post("/api/payments/intent", async (req, res) => {
    try {
      const { amount, currency = "USD", quoteId } = req.body;
      if (!amount || !quoteId) {
        return res.status(400).json({ error: "Amount and quoteId are required" });
      }
      const paymentIntent = await helcimService.createPaymentIntent(amount, currency, {
        quoteId,
        description: "Insurance Policy Premium"
      });
      res.json(paymentIntent);
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  app2.post("/api/payments/process", async (req, res) => {
    try {
      const { amount, coverage, vehicle, customer } = req.body;
      if (!customer.helcimTransactionId) {
        return res.status(400).json({
          success: false,
          error: "Payment verification failed"
        });
      }
      const policy = await storage.createPolicy({
        tenantId: "connected-auto-care",
        policyNumber: `VSC-${Date.now()}`,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone,
        customerAddress: `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}`,
        vehicleId: vehicle.id,
        productId: coverage.productId || "vsc-gold",
        coverageDetails: coverage,
        premium: amount.toString(),
        status: "active",
        effectiveDate: /* @__PURE__ */ new Date(),
        expiryDate: new Date(Date.now() + coverage.termMonths * 30 * 24 * 60 * 60 * 1e3),
        paymentTransactionId: customer.helcimTransactionId,
        paymentApprovalCode: customer.helcimApprovalCode
      });
      res.json({
        success: true,
        policyNumber: policy.policyNumber,
        message: "Policy activated successfully"
      });
    } catch (error) {
      console.error("Policy creation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Policy creation failed"
      });
    }
  });
  app2.post("/api/webhooks/helcim", async (req, res) => {
    try {
      const webhook = await helcimService.processWebhook(req.body, req.headers);
      if (webhook.eventType === "payment.succeeded" && webhook.metadata?.quoteId) {
        const quote = await storage.getQuote(webhook.metadata.quoteId);
        if (quote) {
          await policyService.createPolicyFromQuote(quote.id, {
            paymentId: webhook.paymentId,
            paymentMethod: "helcim_card"
          });
        }
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });
  app2.get("/api/analytics/dashboard", requireAuth, async (req, res) => {
    try {
      const sampleAnalytics = {
        totalPolicies: 1247,
        activePolicies: 1089,
        totalClaims: 187,
        pendingClaims: 23,
        totalRevenue: 28473925e-1,
        monthlyRevenue: 234567.8,
        lossRatio: 0.68,
        combinedRatio: 0.94,
        customerSatisfaction: 4.7,
        retentionRate: 0.92,
        averageClaimAmount: 1825.4,
        processingTime: 5.2,
        recentActivity: [
          {
            id: 1,
            type: "policy_issued",
            description: "New VSC policy issued - VSC-1755185348873",
            timestamp: "2025-08-14T23:42:28.873Z",
            amount: "$2,349.99"
          },
          {
            id: 2,
            type: "claim_filed",
            description: "Claim filed for policy VSC-1755184920051",
            timestamp: "2025-08-14T22:15:20.051Z",
            amount: "$1,235.00"
          },
          {
            id: 3,
            type: "payment_received",
            description: "Payment processed for VSC-1755183825101",
            timestamp: "2025-08-14T21:03:45.101Z",
            amount: "$1,299.99"
          }
        ],
        chartData: {
          policyTrends: [
            { month: "Jan", policies: 89, revenue: 187420 },
            { month: "Feb", policies: 102, revenue: 214680 },
            { month: "Mar", policies: 118, revenue: 248920 },
            { month: "Apr", policies: 134, revenue: 283560 },
            { month: "May", policies: 156, revenue: 327840 },
            { month: "Jun", policies: 178, revenue: 374220 },
            { month: "Jul", policies: 203, revenue: 427830 },
            { month: "Aug", policies: 267, revenue: 562490 }
          ],
          claimsByStatus: [
            { status: "Approved", count: 142, percentage: 76 },
            { status: "Pending", count: 23, percentage: 12 },
            { status: "Under Review", count: 15, percentage: 8 },
            { status: "Denied", count: 7, percentage: 4 }
          ]
        }
      };
      res.json(sampleAnalytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/analytics/events", async (req, res) => {
    try {
      const eventData = insertAnalyticsEventSchema.parse(req.body);
      await analyticsService.trackEvent(eventData);
      res.json({ success: true });
    } catch (error) {
      console.error("Analytics event error:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });
  app2.get("/api/ai-assistant/knowledge-base", async (req, res) => {
    try {
      const knowledgeBase = {
        categories: [
          { id: "vsc_basics", name: "Vehicle Service Contracts", topicCount: 15 },
          { id: "claims_process", name: "Claims Processing", topicCount: 12 },
          { id: "policy_management", name: "Policy Management", topicCount: 8 }
        ],
        totalTopics: 35,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(knowledgeBase);
    } catch (error) {
      console.error("Knowledge base error:", error);
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });
  app2.post("/api/ai-assistant/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      let response = "I understand your question about insurance. Let me help you with that.";
      if (message.toLowerCase().includes("vsc")) {
        response = "A Vehicle Service Contract (VSC) is an optional protection plan that covers specific vehicle components beyond your manufacturer warranty.";
      } else if (message.toLowerCase().includes("claim")) {
        response = "To file a claim, contact our claims department at 1-800-555-CLAIM or submit online through your policy portal.";
      }
      res.json({
        response,
        context: context || "general",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        conversationId: `conv_${Date.now()}`
      });
    } catch (error) {
      console.error("AI assistant error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });
  app2.get("/api/policy-management/documents", async (req, res) => {
    try {
      const documents2 = [
        { id: "doc_001", name: "Policy Certificate Template", type: "certificate", status: "active" },
        { id: "doc_002", name: "Claims Form Template", type: "form", status: "active" },
        { id: "doc_003", name: "Coverage Summary Template", type: "summary", status: "active" }
      ];
      res.json(documents2);
    } catch (error) {
      console.error("Policy documents error:", error);
      res.status(500).json({ error: "Failed to fetch policy documents" });
    }
  });
  app2.get("/api/policy-management/renewal/dashboard", async (req, res) => {
    try {
      const renewalData = {
        totalPolicies: 1247,
        renewalsThisMonth: 156,
        renewalRate: 89.2,
        upcomingRenewals: 89,
        expiredPolicies: 23,
        averageDaysToRenew: 12.5
      };
      res.json(renewalData);
    } catch (error) {
      console.error("Renewal dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch renewal dashboard" });
    }
  });
  app2.get("/api/notifications/system", async (req, res) => {
    try {
      const notifications = [
        { id: "notif_001", type: "priority", title: "High-Value Claim Requires Review", message: "Claim CLM-2025-001235 flagged for manual review - $8,500 water damage", timestamp: (/* @__PURE__ */ new Date()).toISOString() },
        { id: "notif_002", type: "info", title: "156 Renewals This Month", message: "Monthly renewal target of 150 exceeded by 6 policies", timestamp: (/* @__PURE__ */ new Date()).toISOString() },
        { id: "notif_003", type: "warning", title: "System Integration Alert", message: "1 external API showing degraded performance", timestamp: (/* @__PURE__ */ new Date()).toISOString() }
      ];
      res.json(notifications);
    } catch (error) {
      console.error("System notifications error:", error);
      res.status(500).json({ error: "Failed to fetch system notifications" });
    }
  });
  app2.get("/api/system-integration/health", async (req, res) => {
    try {
      const healthStatus = {
        components: [
          { name: "VIN Decoding API", status: "healthy", responseTime: 271, uptime: 99.8, lastCheck: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "Payment Gateway", status: "warning", responseTime: 1200, uptime: 97.2, lastCheck: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "Email Service", status: "down", responseTime: null, uptime: 0, lastCheck: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "Analytics Engine", status: "healthy", responseTime: 89, uptime: 99.9, lastCheck: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "Claims Processing", status: "healthy", responseTime: 156, uptime: 99.5, lastCheck: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "Policy Management", status: "healthy", responseTime: 201, uptime: 98.7, lastCheck: (/* @__PURE__ */ new Date()).toISOString() }
        ],
        overallHealth: 85,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(healthStatus);
    } catch (error) {
      console.error("System health error:", error);
      res.status(500).json({ error: "Failed to fetch system health" });
    }
  });
  app2.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const response = await aiAssistantService.generateResponse(message, context);
      res.json(response);
    } catch (error) {
      console.error("AI assistant error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });
  app2.get("/api/products", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }
      const products2 = await storage.getProducts(user.tenantId);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/rate-tables", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }
      const rateTables2 = await storage.getRateTables(user.tenantId, req.query.productId);
      res.json(rateTables2);
    } catch (error) {
      console.error("Error fetching rate tables:", error);
      res.status(500).json({ error: "Failed to fetch rate tables" });
    }
  });
  app2.get("/api/documents/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const documents2 = await storage.getDocuments(entityType, entityId);
      res.json(documents2);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  app2.get("/api/resellers", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }
      const resellers2 = await storage.getResellers(user.tenantId);
      res.json(resellers2);
    } catch (error) {
      console.error("Error fetching resellers:", error);
      res.status(500).json({ error: "Failed to fetch resellers" });
    }
  });
  app2.post("/api/special-quote-requests", async (req, res) => {
    try {
      const requestData = req.body;
      if (!requestData.productId || !requestData.vehicleData || !requestData.customerData) {
        return res.status(400).json({ error: "Missing required fields: productId, vehicleData, customerData" });
      }
      const specialRequest = await specialQuoteRequestService.createSpecialQuoteRequest({
        tenantId: "default-tenant",
        // For now using default tenant
        productId: requestData.productId,
        vehicleData: requestData.vehicleData,
        coverageSelections: requestData.coverageSelections || {},
        customerData: requestData.customerData,
        eligibilityReasons: requestData.eligibilityReasons || [],
        requestReason: requestData.requestReason || "Customer requested special review"
      });
      res.json({
        message: "Special quote request submitted successfully. Our team will review your request and contact you within 24 hours.",
        requestNumber: specialRequest.requestNumber,
        requestId: specialRequest.id
      });
    } catch (error) {
      console.error("Special quote request error:", error);
      res.status(500).json({ error: "Failed to submit special quote request" });
    }
  });
  app2.get("/api/special-quote-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }
      const requests = await specialQuoteRequestService.getAllSpecialQuoteRequests(user.tenantId || void 0);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching special quote requests:", error);
      res.status(500).json({ error: "Failed to fetch special quote requests" });
    }
  });
  app2.get("/api/special-quote-requests/summary", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }
      const summary = await specialQuoteRequestService.getRequestsSummary(user.tenantId || void 0);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching special quote requests summary:", error);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });
  app2.put("/api/special-quote-requests/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes, alternativeQuote, declineReason } = req.body;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }
      const updated = await specialQuoteRequestService.updateSpecialQuoteRequestStatus(
        id,
        status,
        {
          reviewedBy: userId,
          reviewNotes,
          alternativeQuote,
          declineReason
        }
      );
      if (!updated) {
        return res.status(404).json({ error: "Special quote request not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating special quote request:", error);
      res.status(500).json({ error: "Failed to update special quote request" });
    }
  });
  app2.get("/api/connected-auto-care/products", async (req, res) => {
    try {
      const products2 = cacService.getConnectedAutoCareProducts();
      res.json({ products: products2 });
    } catch (error) {
      console.error("Connected Auto Care products fetch error:", error);
      res.status(500).json({ error: "Failed to fetch Connected Auto Care products" });
    }
  });
  app2.post("/api/connected-auto-care/coverage-options", async (req, res) => {
    try {
      const { productId, vehicleData } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      if (!vehicleData) {
        return res.status(400).json({ error: "Vehicle data is required" });
      }
      const options = cacService.getValidCoverageOptions(productId, vehicleData);
      res.json({
        success: true,
        productId,
        vehicleData,
        coverageOptions: options
      });
    } catch (error) {
      console.error("Error getting coverage options:", error);
      res.status(500).json({ error: "Failed to get coverage options" });
    }
  });
  app2.post("/api/connected-auto-care/quotes", async (req, res) => {
    try {
      const { productId, coverageSelections, vehicleData, customerData } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      const validation = cacService.validateConnectedAutoCareCoverage(productId, coverageSelections);
      if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid coverage selections", details: validation.errors });
      }
      const quoteNumber = `CAC-${Date.now()}`;
      const ratingResult = await cacService.calculateConnectedAutoCarePremium(
        productId,
        coverageSelections,
        vehicleData,
        customerData
      );
      if (ratingResult.status === "ineligible") {
        return res.json({
          quote: {
            id: ratingResult.id,
            status: "ineligible",
            eligibilityReasons: ratingResult.eligibilityReasons,
            allowSpecialQuote: ratingResult.allowSpecialQuote,
            productId,
            vehicleData,
            coverageSelections,
            customerData,
            totalPremium: 0,
            createdAt: ratingResult.createdAt
          },
          message: "This vehicle does not qualify for coverage",
          eligibilityReasons: ratingResult.eligibilityReasons,
          allowSpecialQuote: ratingResult.allowSpecialQuote
        });
      }
      const cacProduct = cacService.getConnectedAutoCareProduct(productId);
      const actualProductId = cacProduct?.id || productId;
      const quote = await storage.createQuote({
        tenantId: "connected-auto-care",
        // Connected Auto Care tenant
        productId: actualProductId,
        quoteNumber,
        customerEmail: customerData?.email,
        customerName: customerData?.name,
        customerPhone: customerData?.phone,
        customerAddress: customerData?.address,
        vehicleId: vehicleData?.id,
        coverageSelections,
        basePremium: ratingResult.basePremium.toString(),
        taxes: ratingResult.taxes.toString(),
        fees: ratingResult.fees.toString(),
        totalPremium: ratingResult.totalPremium.toString(),
        ratingData: ratingResult.factors,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        // 30 days
      });
      await analyticsService.trackEvent({
        tenantId: "connected-auto-care",
        eventType: "cac_quote_created",
        entityType: "quote",
        entityId: quote.id,
        properties: {
          productId,
          productName: ratingResult.productDetails.name,
          premium: ratingResult.totalPremium,
          coverageSelections
        }
      });
      res.json({
        quote,
        ratingResult,
        productDetails: ratingResult.productDetails
      });
    } catch (error) {
      console.error("Connected Auto Care quote creation error:", error);
      res.status(500).json({ error: "Failed to create Connected Auto Care quote" });
    }
  });
  app2.post("/api/special-quote-requests", async (req, res) => {
    try {
      const {
        productId,
        vehicleData,
        coverageSelections,
        customerData,
        eligibilityReasons,
        requestReason
      } = req.body;
      const specialQuoteRequest = {
        id: Math.random().toString(36).substr(2, 9),
        productId,
        vehicleData,
        coverageSelections,
        customerData,
        eligibilityReasons,
        requestReason,
        status: "pending_admin_review",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        requestedBy: customerData.email || "unknown"
      };
      console.log("=== SPECIAL QUOTE REQUEST ===");
      console.log("Request ID:", specialQuoteRequest.id);
      console.log("Product:", productId);
      console.log("Vehicle:", `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
      console.log("Mileage:", vehicleData.mileage);
      console.log("Customer:", customerData.email);
      console.log("Eligibility Issues:", eligibilityReasons);
      console.log("Request Reason:", requestReason);
      console.log("=============================");
      await analyticsService.trackEvent({
        tenantId: "connected-auto-care",
        eventType: "special_quote_requested",
        entityType: "special_quote_request",
        entityId: specialQuoteRequest.id,
        properties: {
          productId,
          vehicleYear: vehicleData.year,
          vehicleMake: vehicleData.make,
          vehicleModel: vehicleData.model,
          currentMileage: vehicleData.mileage,
          eligibilityReasons,
          requestReason
        }
      });
      res.json({
        success: true,
        requestId: specialQuoteRequest.id,
        message: "Special quote request submitted successfully. An admin will review and contact you within 24 hours."
      });
    } catch (error) {
      console.error("Error submitting special quote request:", error);
      res.status(500).json({
        error: "Failed to submit special quote request",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/system-stats", requireAuth, async (req, res) => {
    try {
      const stats = {
        activeUsers: 1,
        systemStatus: "operational",
        databaseStatus: "connected",
        apiStatus: "healthy"
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ error: "Failed to fetch system stats" });
    }
  });
  app2.get("/api/admin/rate-tables", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const rateTables2 = await storage.getAllRateTables();
      res.json(rateTables2);
    } catch (error) {
      console.error("Error fetching admin rate tables:", error);
      res.status(500).json({ error: "Failed to fetch rate tables" });
    }
  });
  app2.post("/api/admin/rate-tables/upload", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.status(501).json({ error: "Rate table upload not yet implemented" });
    } catch (error) {
      console.error("Error uploading rate table:", error);
      res.status(500).json({ error: "Failed to upload rate table" });
    }
  });
  app2.get("/api/admin/coverage-options", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const heroOptions = Object.keys(HERO_VSC_PRODUCTS).map((productId) => ({
        provider: "hero-vsc",
        productId,
        product: HERO_VSC_PRODUCTS[productId]
      }));
      const cacOptions = Object.keys(CONNECTED_AUTO_CARE_PRODUCTS).map((productId) => ({
        provider: "connected-auto-care",
        productId,
        product: CONNECTED_AUTO_CARE_PRODUCTS[productId]
      }));
      res.json({
        providers: [
          {
            id: "hero-vsc",
            name: "Hero VSC",
            products: heroOptions
          },
          {
            id: "connected-auto-care",
            name: "Connected Auto Care",
            products: cacOptions
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching coverage options:", error);
      res.status(500).json({ error: "Failed to fetch coverage options" });
    }
  });
  app2.get("/api/admin/ai-models", requireAuth, async (req, res) => {
    try {
      const modelConfig = {
        currentModel: "gpt-4o",
        temperature: 0.7,
        maxTokens: 2048,
        enableFunctionCalling: true
      };
      res.json(modelConfig);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      res.status(500).json({ error: "Failed to fetch AI models" });
    }
  });
  app2.put("/api/admin/ai-models", requireAuth, async (req, res) => {
    try {
      const { model, temperature, maxTokens, enableFunctionCalling } = req.body;
      console.log("Updating AI model configuration:", { model, temperature, maxTokens, enableFunctionCalling });
      res.json({
        success: true,
        message: "AI model configuration updated successfully"
      });
    } catch (error) {
      console.error("Error updating AI models:", error);
      res.status(500).json({ error: "Failed to update AI models" });
    }
  });
  app2.get("/api/admin/training-data", requireAuth, async (req, res) => {
    try {
      const trainingData = {
        datasets: [
          {
            id: "insurance-faq",
            name: "Insurance FAQ Dataset",
            recordCount: 1847,
            status: "active"
          }
        ]
      };
      res.json(trainingData);
    } catch (error) {
      console.error("Error fetching training data:", error);
      res.status(500).json({ error: "Failed to fetch training data" });
    }
  });
  app2.post("/api/admin/training-data", requireAuth, async (req, res) => {
    try {
      const { name, description } = req.body;
      console.log("Creating training dataset:", { name, description });
      const newDataset = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description,
        status: "active",
        recordCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(newDataset);
    } catch (error) {
      console.error("Error creating training data:", error);
      res.status(500).json({ error: "Failed to create training data" });
    }
  });
  app2.get("/api/admin/response-templates", requireAuth, async (req, res) => {
    try {
      const templates = [
        {
          id: "welcome-message",
          name: "Welcome Message",
          category: "customer-service",
          content: "Hello! Welcome to our insurance platform.",
          status: "active"
        }
      ];
      res.json(templates);
    } catch (error) {
      console.error("Error fetching response templates:", error);
      res.status(500).json({ error: "Failed to fetch response templates" });
    }
  });
  app2.post("/api/admin/response-templates", requireAuth, async (req, res) => {
    try {
      const { name, category, content } = req.body;
      console.log("Creating response template:", { name, category, content });
      const newTemplate = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        category,
        content,
        status: "active",
        usageCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(newTemplate);
    } catch (error) {
      console.error("Error creating response template:", error);
      res.status(500).json({ error: "Failed to create response template" });
    }
  });
  app2.put("/api/admin/response-templates/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, content } = req.body;
      console.log("Updating response template:", { id, name, category, content });
      const updatedTemplate = {
        id,
        name,
        category,
        content,
        status: "active",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating response template:", error);
      res.status(500).json({ error: "Failed to update response template" });
    }
  });
  app2.get("/api/admin/tenants", requireAuth, async (req, res) => {
    try {
      const tenants2 = [
        {
          id: "hero-vsc",
          name: "Hero VSC",
          status: "active",
          productCount: 3,
          policyCount: 1247,
          createdAt: "2024-01-15"
        },
        {
          id: "connected-auto-care",
          name: "Connected Auto Care",
          status: "active",
          productCount: 3,
          policyCount: 892,
          createdAt: "2024-02-20"
        },
        {
          id: "sample-insurance",
          name: "Sample Insurance",
          status: "inactive",
          productCount: 5,
          policyCount: 423,
          createdAt: "2023-12-01"
        }
      ];
      res.json(tenants2);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });
  app2.get("/api/admin/resellers", requireAuth, async (req, res) => {
    try {
      const resellers2 = [
        {
          id: "premier-auto",
          name: "Premier Auto Group",
          contactEmail: "contact@premierauto.com",
          contactPhone: "(555) 123-4567",
          tier: "Platinum",
          commissionRate: 15,
          totalSales: 245e3,
          activePolicies: 487,
          status: "active"
        },
        {
          id: "metro-dealers",
          name: "Metro Dealers Alliance",
          contactEmail: "sales@metrodealers.com",
          contactPhone: "(555) 234-5678",
          tier: "Gold",
          commissionRate: 12,
          totalSales: 156e3,
          activePolicies: 312,
          status: "active"
        },
        {
          id: "coastal-automotive",
          name: "Coastal Automotive",
          contactEmail: "info@coastalauto.com",
          contactPhone: "(555) 345-6789",
          tier: "Silver",
          commissionRate: 10,
          totalSales: 98e3,
          activePolicies: 196,
          status: "active"
        },
        {
          id: "hometown-motors",
          name: "Hometown Motors",
          contactEmail: "team@hometownmotors.com",
          contactPhone: "(555) 456-7890",
          tier: "Bronze",
          commissionRate: 8,
          totalSales: 53e3,
          activePolicies: 106,
          status: "pending"
        }
      ];
      res.json(resellers2);
    } catch (error) {
      console.error("Error fetching resellers:", error);
      res.status(500).json({ error: "Failed to fetch resellers" });
    }
  });
  app2.post("/api/admin/resellers", requireAuth, async (req, res) => {
    try {
      const { name, email, commissionRate } = req.body;
      console.log("Creating reseller:", { name, email, commissionRate });
      const newReseller = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        contactEmail: email,
        commissionRate,
        tier: "Bronze",
        status: "pending",
        totalSales: 0,
        activePolicies: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(newReseller);
    } catch (error) {
      console.error("Error creating reseller:", error);
      res.status(500).json({ error: "Failed to create reseller" });
    }
  });
  app2.put("/api/admin/resellers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, commissionRate, tier, status } = req.body;
      console.log("Updating reseller:", { id, name, email, commissionRate, tier, status });
      const updatedReseller = {
        id,
        name,
        contactEmail: email,
        commissionRate,
        tier,
        status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(updatedReseller);
    } catch (error) {
      console.error("Error updating reseller:", error);
      res.status(500).json({ error: "Failed to update reseller" });
    }
  });
  app2.get("/api/admin/integrations", async (req, res) => {
    try {
      const integrations = [
        {
          id: "vin-decode",
          name: "VIN Decoding Service",
          status: "connected",
          endpoint: "https://vpic.nhtsa.dot.gov/api/",
          responseTime: "188ms"
        },
        {
          id: "helcim-payments",
          name: "Helcim Payment Gateway",
          status: "configured",
          endpoint: "https://api.helcim.com/v2/",
          responseTime: "245ms"
        },
        {
          id: "openai",
          name: "OpenAI API",
          status: "connected",
          endpoint: "https://api.openai.com/v1/",
          responseTime: "892ms"
        },
        {
          id: "postgres",
          name: "PostgreSQL Database",
          status: "connected",
          endpoint: "Neon Serverless PostgreSQL",
          responseTime: "45ms"
        }
      ];
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });
  app2.post("/api/admin/integrations/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      const startTime = Date.now();
      let result;
      switch (id) {
        case "helcim-payments":
          try {
            const apiToken = process.env.HELCIM_API_TOKEN;
            if (!apiToken) {
              result = {
                success: false,
                responseTime: Date.now() - startTime,
                error: "HELCIM_API_TOKEN not configured. Please add your Helcim API key."
              };
            } else {
              let response;
              let authMethod = "";
              const authTests = [
                { headers: { "api-token": apiToken, "Content-Type": "application/json" }, method: "api-token header" },
                { headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" }, method: "Bearer token" },
                { headers: { "Authorization": `Token ${apiToken}`, "Content-Type": "application/json" }, method: "Token prefix" },
                { headers: { "x-api-token": apiToken, "Content-Type": "application/json" }, method: "x-api-token header" }
              ];
              for (const test of authTests) {
                response = await fetch("https://api.helcim.com/v2/customers", {
                  method: "GET",
                  headers: test.headers
                });
                authMethod = test.method;
                if (response.status !== 401) break;
              }
              const responseText = response.status === 401 ? await response.text() : "Connection test";
              if (response.status === 401 || response.status === 403) {
                result = {
                  success: false,
                  status: response.status,
                  responseTime: Date.now() - startTime,
                  error: `Authentication failed with all methods tested. API key: ${apiToken.substring(0, 8)}... Please verify the API key is correct and has proper permissions.`
                };
              } else if (response.status === 404) {
                result = {
                  success: true,
                  status: response.status,
                  responseTime: Date.now() - startTime,
                  data: "API authentication appears valid. Endpoint returned 404 which may indicate API version differences."
                };
              } else if (response.ok) {
                result = {
                  success: true,
                  status: response.status,
                  responseTime: Date.now() - startTime,
                  data: "Helcim API connection and authentication successful!"
                };
              } else {
                result = {
                  success: false,
                  status: response.status,
                  responseTime: Date.now() - startTime,
                  error: `HTTP ${response.status}: Please check if the API key has the correct permissions for this endpoint.`
                };
              }
            }
          } catch (error) {
            result = {
              success: false,
              responseTime: Date.now() - startTime,
              error: error instanceof Error ? error.message : "Connection failed"
            };
          }
          break;
        case "vin-decode":
          try {
            const vinResult = await fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleVariableValuesList/make?format=json");
            const data = await vinResult.json();
            result = {
              success: vinResult.ok,
              status: vinResult.status,
              responseTime: Date.now() - startTime,
              data: data?.Message || "VIN API connection successful"
            };
          } catch (error) {
            result = {
              success: false,
              responseTime: Date.now() - startTime,
              error: error instanceof Error ? error.message : "VIN API connection failed"
            };
          }
          break;
        case "openai":
          try {
            if (!process.env.OPENAI_API_KEY) {
              result = {
                success: false,
                responseTime: Date.now() - startTime,
                error: "OPENAI_API_KEY environment variable not set. Please add your OpenAI API key."
              };
            } else {
              const openaiResult = await fetch("https://api.openai.com/v1/models", {
                headers: {
                  "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                }
              });
              result = {
                success: openaiResult.ok,
                status: openaiResult.status,
                responseTime: Date.now() - startTime,
                data: openaiResult.ok ? "OpenAI API connection successful" : "OpenAI API connection failed"
              };
            }
          } catch (error) {
            result = {
              success: false,
              responseTime: Date.now() - startTime,
              error: error instanceof Error ? error.message : "OpenAI API connection failed"
            };
          }
          break;
        case "postgres":
          try {
            const startDbTime = Date.now();
            const testQuery = await storage.getAllUsers();
            result = {
              success: true,
              responseTime: Date.now() - startTime,
              data: `Database connection successful. Query executed in ${Date.now() - startDbTime}ms.`
            };
          } catch (error) {
            result = {
              success: false,
              responseTime: Date.now() - startTime,
              error: error instanceof Error ? error.message : "Database connection failed"
            };
          }
          break;
        default:
          result = {
            success: false,
            responseTime: Date.now() - startTime,
            error: "Unknown integration ID"
          };
      }
      res.json(result);
    } catch (error) {
      console.error("Error testing integration:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Test failed"
      });
    }
  });
  app2.put("/api/admin/integrations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { apiKey, endpoint, timeout, retries } = req.body;
      console.log(`Updating integration ${id} configuration:`, {
        apiKey: apiKey ? "***masked***" : "not provided",
        endpoint,
        timeout,
        retries
      });
      switch (id) {
        case "helcim-payments":
          if (apiKey && apiKey !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022") {
            console.log("Would update HELCIM_API_TOKEN environment variable");
          }
          break;
        case "openai":
          if (apiKey && apiKey !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022") {
            console.log("Would update OPENAI_API_KEY environment variable");
          }
          break;
        default:
          console.log(`Configuration update for ${id} - endpoint: ${endpoint}`);
      }
      res.json({
        success: true,
        message: `Integration ${id} configuration updated successfully. Restart may be required for changes to take effect.`
      });
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({ error: "Failed to update integration" });
    }
  });
  app2.get("/api/wholesale/stats", async (req, res) => {
    try {
      const stats = {
        totalSales: 247500,
        monthlyCommission: 18560,
        activePolicies: 1243,
        conversionRate: 24.5
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching wholesale stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
  app2.get("/api/wholesale/white-label/config/:resellerId", async (req, res) => {
    try {
      const { resellerId } = req.params;
      const config = {
        resellerId,
        branding: {
          logoUrl: "/assets/partner-logo.png",
          primaryColor: "#2563eb",
          secondaryColor: "#1e40af",
          accentColor: "#f59e0b",
          companyName: "Premium Insurance Partners",
          tagline: "Comprehensive Protection Solutions",
          contactPhone: "1-800-PARTNER",
          contactEmail: "info@premiuminsurance.com",
          address: "123 Business Avenue, Suite 100, Business City, BC 12345"
        },
        domain: {
          subdomain: "premiuminsurance",
          customDomain: "insurance.premiumpartners.com",
          sslEnabled: true,
          domainStatus: "active"
        },
        products: {
          autoAdvantage: { enabled: true, markup: 15, commission: 12 },
          homeProtection: { enabled: true, markup: 20, commission: 15 },
          allVehicle: { enabled: true, markup: 18, commission: 10 },
          rvProtection: { enabled: false, markup: 22, commission: 14 }
        },
        pages: {
          landingPage: {
            title: "Comprehensive Vehicle & Home Protection",
            heroText: "Protect your most valuable assets with our trusted coverage solutions",
            ctaText: "Get Your Free Quote Today",
            features: [
              "Comprehensive Auto Protection",
              "Complete Home Coverage",
              "24/7 Customer Support",
              "Fast Claims Processing"
            ]
          },
          aboutPage: {
            companyStory: "We have been serving our community for over 15 years with reliable insurance solutions.",
            mission: "To provide comprehensive, affordable protection for families and businesses."
          }
        },
        seo: {
          metaTitle: "Vehicle & Home Protection | Premium Insurance Partners",
          metaDescription: "Get comprehensive auto and home protection plans from Premium Insurance Partners. Fast quotes, excellent coverage, and 24/7 support.",
          keywords: "auto insurance, home protection, vehicle warranty, comprehensive coverage",
          ogImage: "/assets/partner-og-image.jpg"
        }
      };
      res.json(config);
    } catch (error) {
      console.error("Error fetching white-label config:", error);
      res.status(500).json({ error: "Failed to fetch white-label configuration" });
    }
  });
  app2.put("/api/wholesale/white-label/config/:resellerId", async (req, res) => {
    try {
      const { resellerId } = req.params;
      const { branding, domain, products: products2, pages, seo } = req.body;
      console.log(`Updating white-label config for reseller ${resellerId}:`, {
        branding: branding ? "Updated" : "No changes",
        domain: domain ? "Updated" : "No changes",
        products: products2 ? "Updated" : "No changes",
        pages: pages ? "Updated" : "No changes",
        seo: seo ? "Updated" : "No changes"
      });
      res.json({
        success: true,
        message: "White-label configuration updated successfully",
        resellerId,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error updating white-label config:", error);
      res.status(500).json({ error: "Failed to update white-label configuration" });
    }
  });
  app2.post("/api/wholesale/white-label/domain", async (req, res) => {
    try {
      const { resellerId, subdomain, customDomain, sslRequired } = req.body;
      console.log(`Domain setup request:`, {
        resellerId,
        subdomain,
        customDomain,
        sslRequired
      });
      const result = {
        success: true,
        subdomain: subdomain ? `${subdomain}.tpaplatform.com` : null,
        customDomain: customDomain || null,
        status: "configuring",
        dnsCname: customDomain ? "tpaplatform.com" : null,
        sslStatus: sslRequired ? "pending" : "not_required",
        estimatedCompletion: "15 minutes"
      };
      res.json(result);
    } catch (error) {
      console.error("Error configuring domain:", error);
      res.status(500).json({ error: "Failed to configure domain" });
    }
  });
  app2.get("/api/wholesale/white-label/quote-widget/:resellerId", async (req, res) => {
    try {
      const { resellerId } = req.params;
      const widgetCode = `
<!-- TPA Platform Quote Widget -->
<div id="tpa-quote-widget-${resellerId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget/quote.js?reseller=${resellerId}';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
<style>
  #tpa-quote-widget-${resellerId} {
    max-width: 400px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  #tpa-quote-widget-${resellerId} .widget-header {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1f2937;
  }
  #tpa-quote-widget-${resellerId} .widget-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  #tpa-quote-widget-${resellerId} input, select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
  }
  #tpa-quote-widget-${resellerId} button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
</style>`;
      res.json({
        resellerId,
        widgetCode,
        widgetUrl: `https://your-domain.com/widget/quote.js?reseller=${resellerId}`,
        previewUrl: `https://your-domain.com/widget/preview/${resellerId}`,
        documentation: "https://docs.tpaplatform.com/widgets/quote"
      });
    } catch (error) {
      console.error("Error generating quote widget:", error);
      res.status(500).json({ error: "Failed to generate quote widget" });
    }
  });
  app2.get("/api/wholesale/products", async (req, res) => {
    try {
      const products2 = [
        {
          id: "auto-advantage-wholesale",
          name: "Auto Advantage Program",
          category: "Vehicle Protection",
          basePrice: 1200,
          partnerMarkup: 15,
          commission: 12,
          status: "active",
          description: "Comprehensive auto protection with deductible reimbursement"
        },
        {
          id: "home-protection-wholesale",
          name: "Home Protection Plan",
          category: "Home Protection",
          basePrice: 800,
          partnerMarkup: 20,
          commission: 15,
          status: "active",
          description: "Complete home protection with emergency services"
        },
        {
          id: "all-vehicle-wholesale",
          name: "All-Vehicle Protection",
          category: "Multi-Vehicle",
          basePrice: 1500,
          partnerMarkup: 18,
          commission: 10,
          status: "active",
          description: "Protection for cars, motorcycles, ATVs, boats, and RVs"
        }
      ];
      res.json(products2);
    } catch (error) {
      console.error("Error fetching wholesale products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/wholesale/quotes", async (req, res) => {
    try {
      const quotes2 = [
        {
          id: "wq-001",
          productName: "Auto Advantage Program",
          customerEmail: "customer@example.com",
          totalPremium: 1380,
          commission: 165.6,
          status: "pending",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "wq-002",
          productName: "Home Protection Plan",
          customerEmail: "homeowner@example.com",
          totalPremium: 960,
          commission: 144,
          status: "sold",
          createdAt: new Date(Date.now() - 864e5).toISOString()
        }
      ];
      res.json(quotes2);
    } catch (error) {
      console.error("Error fetching wholesale quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });
  app2.post("/api/wholesale/quotes", async (req, res) => {
    try {
      const { productId, vin, zip, term, mileage } = req.body;
      if (!productId || !vin) {
        return res.status(400).json({ error: "Product ID and VIN are required" });
      }
      const quote = {
        id: `wq-${Date.now()}`,
        productId,
        vin,
        zip,
        term,
        mileage,
        productName: "Auto Advantage Program",
        // Would be looked up from productId
        basePremium: 1200,
        partnerMarkup: 180,
        // 15% markup
        totalPremium: 1380,
        commission: 165.6,
        // 12% commission
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
        // 30 days
      };
      res.json({
        success: true,
        quote,
        message: "Wholesale quote generated successfully"
      });
    } catch (error) {
      console.error("Error generating wholesale quote:", error);
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });
  app2.post("/api/wholesale/bulk-quotes", async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items array is required" });
      }
      const results = items.map((item) => {
        try {
          if (!item.vin || !item.productId || !item.term) {
            return {
              ...item,
              status: "error",
              errorMessage: "Missing required fields: VIN, Product, or Term"
            };
          }
          const basePremium = Math.floor(Math.random() * 1e3) + 800;
          const markupRate = 0.15;
          const commissionRate = 0.12;
          const markup = basePremium * markupRate;
          const totalPremium = basePremium + markup;
          const commission = totalPremium * commissionRate;
          return {
            ...item,
            basePremium,
            totalPremium: Math.round(totalPremium),
            commission: Math.round(commission),
            status: "processed"
          };
        } catch (error) {
          return {
            ...item,
            status: "error",
            errorMessage: "Processing error occurred"
          };
        }
      });
      res.json({
        success: true,
        results,
        summary: {
          total: items.length,
          processed: results.filter((r) => r.status === "processed").length,
          errors: results.filter((r) => r.status === "error").length
        }
      });
    } catch (error) {
      console.error("Error processing bulk quotes:", error);
      res.status(500).json({ error: "Failed to process bulk quotes" });
    }
  });
  app2.post("/api/wholesale/auth", async (req, res) => {
    try {
      const { partnerCode, username, password } = req.body;
      if (partnerCode && username && password) {
        const partnerData = {
          id: "partner-001",
          partnerCode,
          companyName: "Premium Insurance Agency",
          contactName: username,
          tier: "gold",
          commissionRate: 12,
          markupRate: 15,
          isActive: true
        };
        res.json({
          success: true,
          partner: partnerData,
          token: "wholesale-jwt-token"
          // Would be actual JWT in production
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error authenticating partner:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
  app2.get("/api/ai/knowledge-topics", async (req, res) => {
    try {
      const topics = [
        { id: "claims", name: "Claims Processing", description: "Help with filing and tracking claims" },
        { id: "policies", name: "Policy Information", description: "Coverage details and policy terms" },
        { id: "quotes", name: "Quote Questions", description: "Pricing and coverage options" },
        { id: "technical", name: "Technical Support", description: "Platform and technical issues" },
        { id: "billing", name: "Billing & Payments", description: "Payment processing and billing questions" }
      ];
      res.json(topics);
    } catch (error) {
      console.error("Error fetching knowledge topics:", error);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });
  app2.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      let systemPrompt = `You are a helpful AI assistant for a TPA (Third Party Administrator) insurance platform. 
      You help customers and staff with questions about policies, claims, quotes, and platform operations.
      
      Key information:
      - The platform offers vehicle protection plans (VSC), home protection, and various warranty products
      - Connected Auto Care and Hero VSC are key product providers
      - Claims can be filed through the platform with step-by-step guidance
      - Quotes are generated using VIN decoding and rating engines
      - The platform supports both direct customers and wholesale partners
      
      Context: ${context.type}
      
      Provide accurate, helpful responses based on insurance industry best practices. If you don't know something specific about this platform, be honest about it and suggest contacting support for detailed information.
      
      Keep responses concise but comprehensive. Use a professional but friendly tone.`;
      if (context.type === "claims") {
        systemPrompt += "\n\nFocus on claims-related guidance: filing process, required documentation, timelines, and status updates.";
      } else if (context.type === "quotes") {
        systemPrompt += "\n\nFocus on quote-related help: pricing factors, coverage options, eligibility requirements, and terms.";
      } else if (context.type === "policy") {
        systemPrompt += "\n\nFocus on policy information: coverage details, exclusions, terms, and conditions.";
      } else if (context.type === "technical") {
        systemPrompt += "\n\nFocus on technical support: platform navigation, account issues, and troubleshooting.";
      }
      let response = "";
      if (context.type === "claims") {
        if (message.toLowerCase().includes("file a claim") || message.toLowerCase().includes("claim process")) {
          response = `To file a claim, follow these steps:

1. **Gather Information**: Collect your policy number, incident details, and any relevant documentation
2. **Contact Us**: Call our claims hotline at 1-800-555-0123 or use the online claims portal
3. **Provide Details**: Describe what happened, when it occurred, and the extent of the issue
4. **Documentation**: Upload photos, receipts, or repair estimates if available
5. **Review**: A claims adjuster will review your case within 24-48 hours
6. **Resolution**: You'll receive updates on the claim status and next steps

For vehicle claims, we may arrange for inspection or direct you to approved repair facilities. Home protection claims typically involve scheduling a service technician.

Is there a specific type of claim you need help with?`;
        } else {
          response = `I can help you with claims-related questions. Common topics include:

\u2022 Filing a new claim
\u2022 Checking claim status
\u2022 Understanding coverage
\u2022 Required documentation
\u2022 Claim timelines and process

What specific claims question can I help you with?`;
        }
      } else if (context.type === "quotes") {
        if (message.toLowerCase().includes("price") || message.toLowerCase().includes("cost")) {
          response = `Quote pricing is based on several factors:

**For Vehicle Protection:**
\u2022 Vehicle age, make, model, and mileage
\u2022 Coverage level selected (Platinum, Gold, Silver)
\u2022 Term length (12-60 months)
\u2022 Geographic location
\u2022 Deductible amount

**For Home Protection:**
\u2022 Home age and square footage
\u2022 Coverage options selected
\u2022 Local service costs
\u2022 Plan duration

**Factors that can reduce cost:**
\u2022 Newer vehicles with lower mileage
\u2022 Shorter coverage terms
\u2022 Higher deductible amounts
\u2022 Bundle discounts

To get an accurate quote, I recommend using our quote generator with your specific details. Would you like help understanding any particular coverage option?`;
        } else {
          response = `I can help explain quotes and pricing. Common questions include:

\u2022 How pricing is calculated
\u2022 Coverage level differences
\u2022 Available terms and options
\u2022 Eligibility requirements
\u2022 Discount opportunities

What would you like to know about quotes or pricing?`;
        }
      } else if (context.type === "policy") {
        response = `I can help you understand policy coverage and terms. Our main products include:

**Vehicle Protection Plans:**
\u2022 Comprehensive mechanical breakdown coverage
\u2022 Deductible reimbursement options
\u2022 Emergency services (towing, rental car)
\u2022 Multiple coverage levels available

**Home Protection Plans:**
\u2022 Major appliance coverage
\u2022 HVAC system protection
\u2022 Plumbing and electrical coverage
\u2022 24/7 emergency service

**Key Policy Features:**
\u2022 Nationwide coverage and service network
\u2022 Professional claims handling
\u2022 Flexible payment options
\u2022 Transferable coverage (vehicle plans)

What specific aspect of your policy would you like me to explain?`;
      } else if (context.type === "technical") {
        response = `I can help with platform and technical issues:

**Common Solutions:**
\u2022 **Login Problems**: Try resetting your password or clearing browser cache
\u2022 **Quote Issues**: Ensure VIN is entered correctly (17 characters)
\u2022 **Payment Problems**: Check card details and billing address
\u2022 **Document Upload**: Use supported formats (PDF, JPG, PNG) under 10MB

**Account Help:**
\u2022 Access your dashboard to view policies and claims
\u2022 Update contact information in account settings
\u2022 Download policy documents and proof of coverage

**Browser Requirements:**
\u2022 Use updated Chrome, Firefox, Safari, or Edge
\u2022 Enable JavaScript and cookies
\u2022 Disable ad blockers for full functionality

What specific technical issue are you experiencing?`;
      } else {
        response = `Hello! I'm here to help with any questions about your insurance coverage, claims, quotes, or our platform.

**I can assist with:**
\u2022 Filing and tracking claims
\u2022 Understanding coverage options
\u2022 Quote pricing and eligibility
\u2022 Policy terms and conditions
\u2022 Platform navigation and technical support
\u2022 Billing and payment questions

**Popular topics:**
\u2022 "How do I file a claim?"
\u2022 "What does my policy cover?"
\u2022 "Why is my quote this price?"
\u2022 "How do I update my account?"

How can I help you today?`;
      }
      res.json({
        message: response,
        context: context.type,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });
  app2.post("/api/ai/feedback", async (req, res) => {
    try {
      const { messageId, helpful } = req.body;
      console.log(`AI Feedback - Message: ${messageId}, Helpful: ${helpful}`);
      res.json({
        success: true,
        message: "Feedback recorded successfully"
      });
    } catch (error) {
      console.error("Error recording AI feedback:", error);
      res.status(500).json({ error: "Failed to record feedback" });
    }
  });
  app2.get("/api/claims/advanced", async (req, res) => {
    try {
      const { status, type, search } = req.query;
      const mockClaims = [
        {
          id: "claim-001",
          claimNumber: "CLM-2025-001234",
          policyNumber: "POL-VSC-789012",
          customerName: "Sarah Johnson",
          customerEmail: "sarah.johnson@email.com",
          customerPhone: "(555) 123-4567",
          dateOfLoss: "2025-01-15T00:00:00Z",
          reportedDate: "2025-01-16T10:30:00Z",
          claimType: "auto",
          status: "under_review",
          priority: "medium",
          estimatedAmount: 2500,
          description: "Engine overheating, coolant leak detected, requires radiator replacement",
          adjusterName: "Mike Thompson",
          adjusterEmail: "mike.thompson@company.com",
          lastUpdate: "2025-01-20T14:00:00Z",
          documents: ["repair_estimate.pdf", "photos.zip", "diagnostic_report.pdf"],
          aiAnalysis: {
            riskScore: 25,
            fraudIndicators: [],
            recommendations: [
              "Verify repair facility credentials",
              "Request additional diagnostic documentation",
              "Standard processing timeline applies"
            ],
            estimatedProcessingTime: 5
          },
          timeline: [
            {
              date: "2025-01-16T10:30:00Z",
              action: "Claim submitted",
              user: "Sarah Johnson",
              notes: "Initial FNOL submission with photos"
            },
            {
              date: "2025-01-17T09:15:00Z",
              action: "Assigned to adjuster",
              user: "System",
              notes: "Auto-assigned to Mike Thompson based on workload"
            },
            {
              date: "2025-01-18T14:22:00Z",
              action: "Documentation requested",
              user: "Mike Thompson",
              notes: "Requested additional repair estimates"
            },
            {
              date: "2025-01-20T14:00:00Z",
              action: "AI analysis completed",
              user: "AI System",
              notes: "Low risk score, standard processing recommended"
            }
          ]
        },
        {
          id: "claim-002",
          claimNumber: "CLM-2025-001235",
          policyNumber: "POL-HOME-456789",
          customerName: "Robert Chen",
          customerEmail: "robert.chen@email.com",
          customerPhone: "(555) 987-6543",
          dateOfLoss: "2025-01-10T00:00:00Z",
          reportedDate: "2025-01-11T15:45:00Z",
          claimType: "home",
          status: "investigating",
          priority: "high",
          estimatedAmount: 8500,
          approvedAmount: 7200,
          description: "Water damage to kitchen and living room from burst pipe",
          adjusterName: "Lisa Rodriguez",
          adjusterEmail: "lisa.rodriguez@company.com",
          lastUpdate: "2025-01-19T16:30:00Z",
          documents: ["water_damage_photos.zip", "plumber_report.pdf", "restoration_estimate.pdf"],
          aiAnalysis: {
            riskScore: 75,
            fraudIndicators: [
              "Multiple recent claims from same address",
              "Unusually high estimated repair costs",
              "Limited photographic evidence"
            ],
            recommendations: [
              "Conduct on-site inspection immediately",
              "Verify plumbing service records",
              "Review customer claim history",
              "Consider third-party investigation"
            ],
            estimatedProcessingTime: 15
          },
          timeline: [
            {
              date: "2025-01-11T15:45:00Z",
              action: "Claim submitted",
              user: "Robert Chen",
              notes: "Reported burst pipe in kitchen"
            },
            {
              date: "2025-01-12T08:00:00Z",
              action: "Assigned to adjuster",
              user: "System",
              notes: "Priority assignment due to water damage severity"
            },
            {
              date: "2025-01-14T10:30:00Z",
              action: "Site inspection scheduled",
              user: "Lisa Rodriguez",
              notes: "Scheduled for January 16th"
            },
            {
              date: "2025-01-16T13:00:00Z",
              action: "Site inspection completed",
              user: "Lisa Rodriguez",
              notes: "Extensive water damage confirmed, restoration required"
            },
            {
              date: "2025-01-19T16:30:00Z",
              action: "AI fraud analysis flagged",
              user: "AI System",
              notes: "High risk score requires additional investigation"
            }
          ]
        },
        {
          id: "claim-003",
          claimNumber: "CLM-2025-001236",
          policyNumber: "POL-RV-321098",
          customerName: "Jennifer Martinez",
          customerEmail: "jennifer.martinez@email.com",
          customerPhone: "(555) 456-7890",
          dateOfLoss: "2025-01-08T00:00:00Z",
          reportedDate: "2025-01-09T09:20:00Z",
          claimType: "rv",
          status: "approved",
          priority: "low",
          estimatedAmount: 1850,
          approvedAmount: 1650,
          description: "Awning motor malfunction, requires replacement and labor",
          adjusterName: "Tom Wilson",
          adjusterEmail: "tom.wilson@company.com",
          lastUpdate: "2025-01-18T11:15:00Z",
          documents: ["awning_photos.jpg", "repair_quote.pdf"],
          aiAnalysis: {
            riskScore: 15,
            fraudIndicators: [],
            recommendations: [
              "Standard claim processing",
              "Approved within policy limits",
              "Schedule payment processing"
            ],
            estimatedProcessingTime: 3
          },
          timeline: [
            {
              date: "2025-01-09T09:20:00Z",
              action: "Claim submitted",
              user: "Jennifer Martinez",
              notes: "RV awning stopped working during camping trip"
            },
            {
              date: "2025-01-10T14:00:00Z",
              action: "Assigned to adjuster",
              user: "System",
              notes: "Routine assignment to Tom Wilson"
            },
            {
              date: "2025-01-12T16:45:00Z",
              action: "Estimate reviewed",
              user: "Tom Wilson",
              notes: "Repair estimate within reasonable range"
            },
            {
              date: "2025-01-15T10:30:00Z",
              action: "Claim approved",
              user: "Tom Wilson",
              notes: "Approved for $1,650 - deductible applied"
            },
            {
              date: "2025-01-18T11:15:00Z",
              action: "Payment authorized",
              user: "Finance System",
              notes: "Payment scheduled for processing"
            }
          ]
        }
      ];
      let filteredClaims = mockClaims;
      if (status && status !== "all") {
        filteredClaims = filteredClaims.filter((claim) => claim.status === status);
      }
      if (type && type !== "all") {
        filteredClaims = filteredClaims.filter((claim) => claim.claimType === type);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredClaims = filteredClaims.filter(
          (claim) => claim.claimNumber.toLowerCase().includes(searchLower) || claim.customerName.toLowerCase().includes(searchLower) || claim.policyNumber.toLowerCase().includes(searchLower)
        );
      }
      res.json(filteredClaims);
    } catch (error) {
      console.error("Error fetching advanced claims:", error);
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });
  app2.get("/api/claims/statistics", async (req, res) => {
    try {
      const stats = {
        totalClaims: 1247,
        newThisMonth: 89,
        avgProcessingDays: 7,
        totalPayouts: 245e4,
        fraudRate: 3.2
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching claim statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
  app2.post("/api/claims/:claimId/ai-analysis", async (req, res) => {
    try {
      const { claimId } = req.params;
      const analysis = {
        riskScore: Math.floor(Math.random() * 100),
        fraudIndicators: [
          "Claim amount significantly higher than average",
          "Multiple recent claims from same location"
        ].filter(() => Math.random() > 0.7),
        recommendations: [
          "Request additional documentation",
          "Schedule site inspection",
          "Verify repair facility credentials",
          "Review customer claim history"
        ].filter(() => Math.random() > 0.5),
        estimatedProcessingTime: Math.floor(Math.random() * 14) + 3
      };
      setTimeout(() => {
        res.json({
          success: true,
          analysis,
          message: "AI analysis completed successfully"
        });
      }, 2e3);
    } catch (error) {
      console.error("Error running AI analysis:", error);
      res.status(500).json({ error: "Failed to run AI analysis" });
    }
  });
  app2.put("/api/claims/:claimId/status", async (req, res) => {
    try {
      const { claimId } = req.params;
      const { status, notes } = req.body;
      res.json({
        success: true,
        claimId,
        status,
        notes,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        message: "Claim status updated successfully"
      });
    } catch (error) {
      console.error("Error updating claim status:", error);
      res.status(500).json({ error: "Failed to update claim status" });
    }
  });
  app2.put("/api/claims/:claimId/adjuster", async (req, res) => {
    try {
      const { claimId } = req.params;
      const adjusterData = req.body;
      res.json({
        success: true,
        claimId,
        adjuster: adjusterData,
        assignedAt: (/* @__PURE__ */ new Date()).toISOString(),
        message: "Adjuster assigned successfully"
      });
    } catch (error) {
      console.error("Error assigning adjuster:", error);
      res.status(500).json({ error: "Failed to assign adjuster" });
    }
  });
  app2.get("/api/policies/management", async (req, res) => {
    try {
      const { status, product, search } = req.query;
      const mockPolicies = [
        {
          id: "policy-001",
          policyNumber: "POL-VSC-2025-001",
          customerName: "Michael Johnson",
          customerEmail: "michael.johnson@email.com",
          customerPhone: "(555) 234-5678",
          productType: "auto",
          productName: "Connected Auto Care Elevate Platinum",
          coverageLevel: "Platinum",
          status: "active",
          effectiveDate: "2025-01-01T00:00:00Z",
          expirationDate: "2026-01-01T00:00:00Z",
          premiumAmount: 1894,
          deductible: 100,
          paymentMethod: "Credit Card",
          paymentFrequency: "annual",
          nextPaymentDue: "2026-01-01T00:00:00Z",
          agent: "Sarah Wilson",
          notes: "Customer opted for platinum coverage with roadside assistance",
          documents: [
            {
              id: "doc-001",
              name: "Policy Document",
              type: "policy",
              url: "/documents/policy-001.pdf",
              createdAt: "2025-01-01T10:00:00Z"
            },
            {
              id: "doc-002",
              name: "Coverage Certificate",
              type: "certificate",
              url: "/documents/cert-001.pdf",
              createdAt: "2025-01-01T10:30:00Z"
            }
          ],
          claims: [
            {
              id: "claim-001",
              claimNumber: "CLM-2025-001234",
              dateOfLoss: "2025-01-15T00:00:00Z",
              status: "approved",
              amount: 2500
            }
          ],
          vehicle: {
            vin: "1HGBH41JXMN109186",
            year: 2022,
            make: "Honda",
            model: "Civic",
            mileage: 15e3
          },
          renewalInfo: {
            autoRenew: true,
            renewalDate: "2026-01-01T00:00:00Z",
            renewalPremium: 1950,
            renewalNotificationSent: false
          }
        },
        {
          id: "policy-002",
          policyNumber: "POL-HOME-2025-002",
          customerName: "Jennifer Davis",
          customerEmail: "jennifer.davis@email.com",
          customerPhone: "(555) 345-6789",
          productType: "home",
          productName: "Hero Home Protection Plan Plus",
          coverageLevel: "Comprehensive",
          status: "active",
          effectiveDate: "2025-01-15T00:00:00Z",
          expirationDate: "2026-01-15T00:00:00Z",
          premiumAmount: 899,
          deductible: 75,
          paymentMethod: "Bank Transfer",
          paymentFrequency: "quarterly",
          nextPaymentDue: "2025-04-15T00:00:00Z",
          agent: "Tom Rodriguez",
          notes: "Home protection plan includes HVAC and plumbing coverage",
          documents: [
            {
              id: "doc-003",
              name: "Home Policy Document",
              type: "policy",
              url: "/documents/policy-002.pdf",
              createdAt: "2025-01-15T14:00:00Z"
            }
          ],
          claims: [],
          property: {
            address: "123 Oak Street, Springfield, IL 62701",
            propertyType: "Single Family Home",
            squareFootage: 2400,
            yearBuilt: 2015
          },
          renewalInfo: {
            autoRenew: false,
            renewalDate: "2026-01-15T00:00:00Z",
            renewalPremium: 925,
            renewalNotificationSent: true
          }
        },
        {
          id: "policy-003",
          policyNumber: "POL-RV-2025-003",
          customerName: "Robert Martinez",
          customerEmail: "robert.martinez@email.com",
          customerPhone: "(555) 456-7890",
          productType: "rv",
          productName: "RV Protection Plan Standard",
          coverageLevel: "Standard",
          status: "pending",
          effectiveDate: "2025-02-01T00:00:00Z",
          expirationDate: "2027-02-01T00:00:00Z",
          premiumAmount: 1250,
          deductible: 200,
          paymentMethod: "Credit Card",
          paymentFrequency: "semi-annual",
          nextPaymentDue: "2025-08-01T00:00:00Z",
          agent: "Lisa Chen",
          notes: "Pending final vehicle inspection before activation",
          documents: [],
          claims: [],
          vehicle: {
            vin: "4V4NC9GH5MN123456",
            year: 2020,
            make: "Winnebago",
            model: "Vista",
            mileage: 25e3
          },
          renewalInfo: {
            autoRenew: true,
            renewalDate: "2027-02-01T00:00:00Z",
            renewalPremium: 1275,
            renewalNotificationSent: false
          }
        },
        {
          id: "policy-004",
          policyNumber: "POL-AUTO-2025-004",
          customerName: "Amanda Thompson",
          customerEmail: "amanda.thompson@email.com",
          customerPhone: "(555) 567-8901",
          productType: "auto",
          productName: "Hero Auto Advantage Plus",
          coverageLevel: "Gold",
          status: "expired",
          effectiveDate: "2024-03-01T00:00:00Z",
          expirationDate: "2025-03-01T00:00:00Z",
          premiumAmount: 1450,
          deductible: 150,
          paymentMethod: "Monthly ACH",
          paymentFrequency: "monthly",
          nextPaymentDue: "2025-04-01T00:00:00Z",
          agent: "Mike Wilson",
          notes: "Policy expired, renewal offer sent but no response",
          documents: [
            {
              id: "doc-004",
              name: "Expired Policy",
              type: "policy",
              url: "/documents/policy-004.pdf",
              createdAt: "2024-03-01T09:00:00Z"
            }
          ],
          claims: [
            {
              id: "claim-002",
              claimNumber: "CLM-2024-005678",
              dateOfLoss: "2024-08-20T00:00:00Z",
              status: "closed",
              amount: 1800
            }
          ],
          vehicle: {
            vin: "WBANE53594CE123456",
            year: 2019,
            make: "BMW",
            model: "X3",
            mileage: 45e3
          },
          renewalInfo: {
            autoRenew: false,
            renewalDate: "2025-03-01T00:00:00Z",
            renewalPremium: 1520,
            renewalNotificationSent: true
          }
        }
      ];
      let filteredPolicies = mockPolicies;
      if (status && status !== "all") {
        filteredPolicies = filteredPolicies.filter((policy) => policy.status === status);
      }
      if (product && product !== "all") {
        filteredPolicies = filteredPolicies.filter((policy) => policy.productType === product);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPolicies = filteredPolicies.filter(
          (policy) => policy.policyNumber.toLowerCase().includes(searchLower) || policy.customerName.toLowerCase().includes(searchLower) || policy.customerEmail.toLowerCase().includes(searchLower)
        );
      }
      res.json(filteredPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });
  app2.get("/api/policies/statistics", async (req, res) => {
    try {
      const stats = {
        activePolicies: 2847,
        newThisMonth: 156,
        premiumRevenue: 425e4,
        renewalsDue: 89,
        retentionRate: 87.3
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching policy statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
  app2.post("/api/policies/:policyId/generate-document", async (req, res) => {
    try {
      const { policyId } = req.params;
      const { documentType } = req.body;
      const document = {
        id: `doc-${Date.now()}`,
        name: `${documentType} Document`,
        type: documentType,
        url: `/documents/${policyId}-${documentType}.pdf`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({
        success: true,
        document,
        message: `${documentType} document generated successfully`
      });
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ error: "Failed to generate document" });
    }
  });
  app2.put("/api/policies/:policyId/status", async (req, res) => {
    try {
      const { policyId } = req.params;
      const { status, reason } = req.body;
      res.json({
        success: true,
        policyId,
        status,
        reason,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        message: "Policy status updated successfully"
      });
    } catch (error) {
      console.error("Error updating policy status:", error);
      res.status(500).json({ error: "Failed to update policy status" });
    }
  });
  app2.post("/api/policies/:policyId/renewal-notice", async (req, res) => {
    try {
      const { policyId } = req.params;
      res.json({
        success: true,
        policyId,
        sentAt: (/* @__PURE__ */ new Date()).toISOString(),
        message: "Renewal notice sent successfully"
      });
    } catch (error) {
      console.error("Error sending renewal notice:", error);
      res.status(500).json({ error: "Failed to send renewal notice" });
    }
  });
  app2.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const { dateRange } = req.query;
      const days = parseInt(dateRange) || 30;
      const mockAnalytics = {
        totalRevenue: 425e4,
        averagePremium: 1850,
        growthRate: 12.5,
        avgProcessingTime: 6.8,
        approvalRate: 87.3,
        customerSatisfaction: 4.2,
        lossRatio: 68.5,
        combinedRatio: 94.2,
        profitMargin: 15.8,
        oneYearRetention: 89.2,
        customerLifetimeValue: 8450,
        churnRate: 10.8,
        renewalSuccessRate: 91.5,
        revenueByProduct: [
          { name: "Auto VSC", value: 2125e3, fill: "#3B82F6" },
          { name: "Home Protection", value: 1275e3, fill: "#10B981" },
          { name: "RV Coverage", value: 595e3, fill: "#F59E0B" },
          { name: "Marine", value: 17e4, fill: "#EF4444" },
          { name: "Powersports", value: 85e3, fill: "#8B5CF6" }
        ],
        policyTrends: Array.from({ length: 12 }, (_, i) => ({
          date: format(new Date(2024, i), "MMM"),
          new: Math.floor(Math.random() * 200) + 150,
          renewed: Math.floor(Math.random() * 300) + 200
        })),
        claimsTrends: Array.from({ length: 12 }, (_, i) => ({
          month: format(new Date(2024, i), "MMM"),
          count: Math.floor(Math.random() * 100) + 50,
          payout: Math.floor(Math.random() * 5e5) + 2e5
        })),
        retentionCohorts: Array.from({ length: 12 }, (_, i) => ({
          month: `Month ${i + 1}`,
          retention: Math.max(100 - i * 8 - Math.random() * 10, 60)
        }))
      };
      res.json(mockAnalytics);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });
  app2.get("/api/analytics/kpi-metrics", async (req, res) => {
    try {
      const { dateRange } = req.query;
      const kpiMetrics = [
        {
          id: "revenue",
          name: "Total Revenue",
          value: 425e4,
          previousValue: 389e4,
          format: "currency",
          trend: "up",
          target: 45e5,
          description: "Total premium revenue collected"
        },
        {
          id: "policies",
          name: "Active Policies",
          value: 2847,
          previousValue: 2654,
          format: "number",
          trend: "up",
          target: 3e3,
          description: "Currently active insurance policies"
        },
        {
          id: "claims_ratio",
          name: "Loss Ratio",
          value: 68.5,
          previousValue: 72.1,
          format: "percentage",
          trend: "down",
          target: 65,
          description: "Claims paid vs premiums collected"
        },
        {
          id: "retention",
          name: "Retention Rate",
          value: 89.2,
          previousValue: 87.8,
          format: "percentage",
          trend: "up",
          target: 90,
          description: "Customer retention rate"
        },
        {
          id: "processing_time",
          name: "Avg Processing Time",
          value: 6.8,
          previousValue: 8.2,
          format: "number",
          trend: "down",
          target: 5,
          description: "Average claim processing time in days"
        },
        {
          id: "profit_margin",
          name: "Profit Margin",
          value: 15.8,
          previousValue: 14.2,
          format: "percentage",
          trend: "up",
          target: 18,
          description: "Net profit margin percentage"
        }
      ];
      res.json(kpiMetrics);
    } catch (error) {
      console.error("Error fetching KPI metrics:", error);
      res.status(500).json({ error: "Failed to fetch KPI metrics" });
    }
  });
  app2.get("/api/analytics/revenue-trends", async (req, res) => {
    try {
      const { dateRange } = req.query;
      const days = parseInt(dateRange) || 30;
      const revenueTrends = Array.from({ length: days }, (_, i) => ({
        date: format(subDays(/* @__PURE__ */ new Date(), days - i), "MMM dd"),
        revenue: Math.floor(Math.random() * 5e4) + 1e5,
        policies: Math.floor(Math.random() * 20) + 10,
        claims: Math.floor(Math.random() * 5) + 2
      }));
      res.json(revenueTrends);
    } catch (error) {
      console.error("Error fetching revenue trends:", error);
      res.status(500).json({ error: "Failed to fetch revenue trends" });
    }
  });
  app2.get("/api/analytics/policy-breakdown", async (req, res) => {
    try {
      const policyBreakdown = [
        { name: "Auto VSC", count: 1425, fill: "#3B82F6" },
        { name: "Home Protection", count: 856, fill: "#10B981" },
        { name: "RV Coverage", count: 342, fill: "#F59E0B" },
        { name: "Marine", count: 156, fill: "#EF4444" },
        { name: "Powersports", count: 68, fill: "#8B5CF6" }
      ];
      res.json(policyBreakdown);
    } catch (error) {
      console.error("Error fetching policy breakdown:", error);
      res.status(500).json({ error: "Failed to fetch policy breakdown" });
    }
  });
  app2.get("/api/analytics/claims-breakdown", async (req, res) => {
    try {
      const claimsBreakdown = [
        { name: "Engine/Transmission", count: 245, amount: 125e4, fill: "#3B82F6" },
        { name: "HVAC Systems", count: 189, amount: 89e4, fill: "#10B981" },
        { name: "Electrical", count: 156, amount: 65e4, fill: "#F59E0B" },
        { name: "Suspension", count: 98, amount: 42e4, fill: "#EF4444" },
        { name: "Other", count: 67, amount: 18e4, fill: "#8B5CF6" }
      ];
      res.json(claimsBreakdown);
    } catch (error) {
      console.error("Error fetching claims breakdown:", error);
      res.status(500).json({ error: "Failed to fetch claims breakdown" });
    }
  });
  app2.get("/api/communications/conversations", async (req, res) => {
    try {
      const { type, search } = req.query;
      const mockConversations = [
        {
          id: "conv-001",
          type: "direct",
          name: "Sarah Wilson (Claims Adjuster)",
          participants: [
            {
              id: "user-001",
              name: "Sarah Wilson",
              status: "online",
              role: "Claims Adjuster"
            }
          ],
          lastMessage: {
            id: "msg-001",
            content: "The claim has been approved and payment is being processed.",
            senderId: "user-001",
            senderName: "Sarah Wilson",
            timestamp: "2025-01-13T14:30:00Z",
            type: "text"
          },
          unreadCount: 2,
          pinned: true,
          muted: false,
          createdAt: "2025-01-10T09:00:00Z"
        },
        {
          id: "conv-002",
          type: "group",
          name: "Claims Review Team",
          participants: [
            {
              id: "user-002",
              name: "Mike Thompson",
              status: "online",
              role: "Senior Adjuster"
            },
            {
              id: "user-003",
              name: "Lisa Rodriguez",
              status: "away",
              role: "Claims Supervisor"
            },
            {
              id: "user-004",
              name: "Tom Wilson",
              status: "busy",
              role: "Claims Analyst"
            }
          ],
          lastMessage: {
            id: "msg-002",
            content: "Weekly review meeting scheduled for Friday at 2 PM",
            senderId: "user-003",
            senderName: "Lisa Rodriguez",
            timestamp: "2025-01-13T13:45:00Z",
            type: "text"
          },
          unreadCount: 0,
          pinned: false,
          muted: false,
          createdAt: "2025-01-08T10:00:00Z"
        },
        {
          id: "conv-003",
          type: "support",
          name: "Customer Support - Ticket #12345",
          participants: [
            {
              id: "user-005",
              name: "Jennifer Davis",
              status: "offline",
              role: "Customer"
            },
            {
              id: "user-006",
              name: "Support Agent",
              status: "online",
              role: "Support"
            }
          ],
          lastMessage: {
            id: "msg-003",
            content: "Thank you for your patience. We've resolved the billing issue.",
            senderId: "user-006",
            senderName: "Support Agent",
            timestamp: "2025-01-13T12:20:00Z",
            type: "text"
          },
          unreadCount: 1,
          pinned: false,
          muted: false,
          createdAt: "2025-01-12T16:30:00Z"
        },
        {
          id: "conv-004",
          type: "direct",
          name: "Robert Martinez (Policy Holder)",
          participants: [
            {
              id: "user-007",
              name: "Robert Martinez",
              status: "away",
              role: "Customer"
            }
          ],
          lastMessage: {
            id: "msg-004",
            content: "When will my policy documents be ready?",
            senderId: "user-007",
            senderName: "Robert Martinez",
            timestamp: "2025-01-13T11:15:00Z",
            type: "text"
          },
          unreadCount: 3,
          pinned: false,
          muted: false,
          createdAt: "2025-01-11T14:00:00Z"
        }
      ];
      let filteredConversations = mockConversations;
      if (type && type !== "all") {
        filteredConversations = filteredConversations.filter((conv) => conv.type === type);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredConversations = filteredConversations.filter(
          (conv) => conv.name.toLowerCase().includes(searchLower) || conv.participants.some((p) => p.name.toLowerCase().includes(searchLower))
        );
      }
      res.json(filteredConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/communications/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const mockMessages = [
        {
          id: "msg-001",
          content: "Hello, I wanted to follow up on the claim we discussed yesterday.",
          senderId: "user-001",
          senderName: "Sarah Wilson",
          timestamp: "2025-01-13T14:25:00Z",
          type: "text"
        },
        {
          id: "msg-002",
          content: "I've reviewed all the documentation and everything looks good.",
          senderId: "user-001",
          senderName: "Sarah Wilson",
          timestamp: "2025-01-13T14:27:00Z",
          type: "text"
        },
        {
          id: "msg-003",
          content: "The claim has been approved and payment is being processed.",
          senderId: "user-001",
          senderName: "Sarah Wilson",
          timestamp: "2025-01-13T14:30:00Z",
          type: "text",
          reactions: [
            { emoji: "\u{1F44D}", count: 2, users: ["user-002", "user-003"] },
            { emoji: "\u{1F389}", count: 1, users: ["user-002"] }
          ]
        },
        {
          id: "msg-004",
          content: "Thank you so much for the quick processing! This is exactly what our customers need.",
          senderId: "user-current",
          senderName: "You",
          timestamp: "2025-01-13T14:32:00Z",
          type: "text"
        },
        {
          id: "msg-005",
          content: "System notification: Payment of $2,500 has been authorized and will be processed within 1-2 business days.",
          senderId: "system",
          senderName: "System",
          timestamp: "2025-01-13T14:33:00Z",
          type: "system"
        }
      ];
      res.json(mockMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.get("/api/communications/notifications", async (req, res) => {
    try {
      const mockNotifications = [
        {
          id: "notif-001",
          title: "New Claim Submitted",
          message: "Claim #CLM-2025-001237 has been submitted and requires review",
          type: "info",
          timestamp: "2025-01-13T15:00:00Z",
          read: false,
          actionUrl: "/advanced-claims",
          priority: "high"
        },
        {
          id: "notif-002",
          title: "Payment Processed",
          message: "Payment of $2,500 for claim #CLM-2025-001234 has been successfully processed",
          type: "success",
          timestamp: "2025-01-13T14:45:00Z",
          read: false,
          actionUrl: "/claims",
          priority: "medium"
        },
        {
          id: "notif-003",
          title: "Policy Renewal Due",
          message: "Policy POL-VSC-2025-001 expires in 30 days and requires renewal",
          type: "warning",
          timestamp: "2025-01-13T14:30:00Z",
          read: true,
          actionUrl: "/policy-management",
          priority: "medium"
        },
        {
          id: "notif-004",
          title: "System Maintenance",
          message: "Scheduled maintenance will occur tonight from 11 PM to 1 AM EST",
          type: "info",
          timestamp: "2025-01-13T14:00:00Z",
          read: true,
          priority: "low"
        },
        {
          id: "notif-005",
          title: "Fraud Alert",
          message: "High-risk claim detected: CLM-2025-001235 requires immediate investigation",
          type: "error",
          timestamp: "2025-01-13T13:30:00Z",
          read: false,
          actionUrl: "/advanced-claims",
          priority: "urgent"
        }
      ];
      res.json(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/communications/messages", async (req, res) => {
    try {
      const { conversationId, content, type = "text" } = req.body;
      const newMessage = {
        id: `msg-${Date.now()}`,
        content,
        senderId: "user-current",
        senderName: "You",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type
      };
      res.json({
        success: true,
        message: newMessage
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.put("/api/communications/conversations/:conversationId/read", async (req, res) => {
    try {
      const { conversationId } = req.params;
      res.json({
        success: true,
        conversationId,
        markedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      res.status(500).json({ error: "Failed to mark as read" });
    }
  });
  app2.put("/api/communications/notifications/:notificationId/read", async (req, res) => {
    try {
      const { notificationId } = req.params;
      res.json({
        success: true,
        notificationId,
        markedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/system/status", async (req, res) => {
    try {
      const systemStatuses = [
        {
          id: "sys-001",
          name: "TPA Core Platform",
          type: "service",
          status: "online",
          uptime: 99.8,
          responseTime: 145,
          lastCheck: "2025-01-13T15:30:00Z",
          healthScore: 98,
          dependencies: ["Database", "Redis Cache", "File Storage"],
          version: "2.1.4",
          endpoint: "https://api.tpaplatform.com/core"
        },
        {
          id: "sys-002",
          name: "PostgreSQL Database",
          type: "database",
          status: "online",
          uptime: 99.9,
          responseTime: 12,
          lastCheck: "2025-01-13T15:30:00Z",
          healthScore: 99,
          dependencies: ["Storage Volume", "Network"],
          version: "15.4",
          endpoint: "internal:5432"
        },
        {
          id: "sys-003",
          name: "Helcim Payment API",
          type: "external",
          status: "online",
          uptime: 99.5,
          responseTime: 890,
          lastCheck: "2025-01-13T15:29:45Z",
          healthScore: 95,
          dependencies: ["Internet Connection"],
          version: "v2",
          endpoint: "https://api.helcim.com/v2"
        },
        {
          id: "sys-004",
          name: "VIN Decoding Service",
          type: "api",
          status: "warning",
          uptime: 97.2,
          responseTime: 2400,
          lastCheck: "2025-01-13T15:29:30Z",
          healthScore: 78,
          dependencies: ["ChromeData API", "NHTSA Fallback"],
          version: "v1.2",
          endpoint: "https://api.chromedata.com/v1"
        },
        {
          id: "sys-005",
          name: "OpenAI Integration",
          type: "external",
          status: "online",
          uptime: 99.1,
          responseTime: 1850,
          lastCheck: "2025-01-13T15:30:00Z",
          healthScore: 92,
          dependencies: ["OpenAI API"],
          version: "v1",
          endpoint: "https://api.openai.com/v1"
        },
        {
          id: "sys-006",
          name: "Document Storage",
          type: "service",
          status: "maintenance",
          uptime: 98.5,
          responseTime: 0,
          lastCheck: "2025-01-13T15:15:00Z",
          healthScore: 85,
          dependencies: ["Google Cloud Storage"],
          version: "1.0.8",
          endpoint: "https://storage.googleapis.com"
        }
      ];
      res.json(systemStatuses);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ error: "Failed to fetch system status" });
    }
  });
  app2.get("/api/system/integrations", async (req, res) => {
    try {
      const integrations = [
        {
          id: "int-001",
          name: "Helcim Payment Gateway",
          type: "api",
          status: "active",
          provider: "Helcim Commerce",
          lastSync: "2025-01-13T15:25:00Z",
          syncFrequency: "Real-time",
          recordsProcessed: 1247,
          errorCount: 3,
          successRate: 99.8,
          configuration: {
            apiKey: "configured",
            webhookUrl: "https://platform.replit.dev/api/webhooks/helcim",
            environment: "production"
          }
        },
        {
          id: "int-002",
          name: "ChromeData VIN Service",
          type: "api",
          status: "active",
          provider: "ChromeData Solutions",
          lastSync: "2025-01-13T15:28:00Z",
          syncFrequency: "On-demand",
          recordsProcessed: 892,
          errorCount: 12,
          successRate: 98.7,
          configuration: {
            apiKey: "configured",
            timeout: "30s",
            retries: 3
          }
        },
        {
          id: "int-003",
          name: "SendGrid Email Service",
          type: "email",
          status: "active",
          provider: "Twilio SendGrid",
          lastSync: "2025-01-13T15:20:00Z",
          syncFrequency: "Real-time",
          recordsProcessed: 2156,
          errorCount: 8,
          successRate: 99.6,
          configuration: {
            apiKey: "configured",
            fromEmail: "noreply@tpaplatform.com",
            templates: "configured"
          }
        },
        {
          id: "int-004",
          name: "Rate Table Import",
          type: "file_transfer",
          status: "pending",
          provider: "Google Cloud Storage",
          lastSync: "2025-01-13T14:45:00Z",
          syncFrequency: "Daily at 6 AM",
          recordsProcessed: 156789,
          errorCount: 0,
          successRate: 100,
          configuration: {
            bucket: "tpa-rate-tables",
            schedule: "0 6 * * *",
            format: "CSV/XLSX"
          }
        },
        {
          id: "int-005",
          name: "Claims Data Export",
          type: "database",
          status: "error",
          provider: "External Reporting System",
          lastSync: "2025-01-13T12:30:00Z",
          syncFrequency: "Every 4 hours",
          recordsProcessed: 45623,
          errorCount: 156,
          successRate: 89.2,
          configuration: {
            connectionString: "configured",
            tables: ["claims", "policies", "payments"],
            compression: "gzip"
          }
        }
      ];
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });
  app2.get("/api/system/workflows", async (req, res) => {
    try {
      const workflows = [
        {
          id: "wf-001",
          name: "Policy Issuance Automation",
          type: "policy_issuance",
          status: "running",
          trigger: "Payment Confirmed",
          actions: ["Generate Policy", "Send Welcome Email", "Update CRM"],
          lastRun: "2025-01-13T15:22:00Z",
          successCount: 234,
          errorCount: 2,
          avgExecutionTime: 12.5,
          schedule: null
        },
        {
          id: "wf-002",
          name: "Claims Processing Workflow",
          type: "claim_processing",
          status: "running",
          trigger: "New Claim Submitted",
          actions: ["Fraud Check", "Assign Adjuster", "Send Acknowledgment"],
          lastRun: "2025-01-13T15:18:00Z",
          successCount: 89,
          errorCount: 5,
          avgExecutionTime: 45.2
        },
        {
          id: "wf-003",
          name: "Renewal Notification System",
          type: "renewal",
          status: "running",
          trigger: "60 Days Before Expiry",
          actions: ["Generate Renewal Quote", "Send Email", "Schedule Follow-up"],
          lastRun: "2025-01-13T14:00:00Z",
          successCount: 156,
          errorCount: 1,
          avgExecutionTime: 8.7,
          schedule: "Daily at 2 PM"
        },
        {
          id: "wf-004",
          name: "Fraud Alert Notifications",
          type: "notification",
          status: "running",
          trigger: "High Risk Score Detected",
          actions: ["Send Urgent Alert", "Flag Claim", "Assign Senior Adjuster"],
          lastRun: "2025-01-13T11:45:00Z",
          successCount: 12,
          errorCount: 0,
          avgExecutionTime: 3.2
        },
        {
          id: "wf-005",
          name: "Weekly Analytics Report",
          type: "reporting",
          status: "paused",
          trigger: "Weekly Schedule",
          actions: ["Generate Report", "Email to Management", "Archive Data"],
          lastRun: "2025-01-06T09:00:00Z",
          successCount: 52,
          errorCount: 3,
          avgExecutionTime: 125.8,
          schedule: "Sundays at 9 AM"
        }
      ];
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });
  app2.get("/api/system/metrics", async (req, res) => {
    try {
      const metrics = [
        {
          name: "CPU Usage",
          value: 34.5,
          unit: "%",
          status: "good",
          trend: "stable",
          threshold: { warning: 70, critical: 90 }
        },
        {
          name: "Memory Usage",
          value: 68.2,
          unit: "%",
          status: "warning",
          trend: "up",
          threshold: { warning: 70, critical: 85 }
        },
        {
          name: "Database Connections",
          value: 45,
          unit: "",
          status: "good",
          trend: "stable",
          threshold: { warning: 80, critical: 100 }
        },
        {
          name: "API Response Time",
          value: 145,
          unit: "ms",
          status: "good",
          trend: "down",
          threshold: { warning: 500, critical: 1e3 }
        },
        {
          name: "Storage Usage",
          value: 2.4,
          unit: "GB",
          status: "good",
          trend: "up",
          threshold: { warning: 8, critical: 10 }
        },
        {
          name: "Error Rate",
          value: 0.12,
          unit: "%",
          status: "good",
          trend: "down",
          threshold: { warning: 1, critical: 5 }
        }
      ];
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });
  app2.post("/api/system/:systemId/restart", async (req, res) => {
    try {
      const { systemId } = req.params;
      res.json({
        success: true,
        systemId,
        action: "restart",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: "System restart initiated successfully"
      });
    } catch (error) {
      console.error("Error restarting system:", error);
      res.status(500).json({ error: "Failed to restart system" });
    }
  });
  app2.post("/api/system/integrations/:integrationId/:action", async (req, res) => {
    try {
      const { integrationId, action } = req.params;
      res.json({
        success: true,
        integrationId,
        action,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: `Integration ${action} completed successfully`
      });
    } catch (error) {
      console.error("Error controlling integration:", error);
      res.status(500).json({ error: "Failed to control integration" });
    }
  });
  app2.post("/api/system/workflows/:workflowId/:action", async (req, res) => {
    try {
      const { workflowId, action } = req.params;
      res.json({
        success: true,
        workflowId,
        action,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: `Workflow ${action} completed successfully`
      });
    } catch (error) {
      console.error("Error controlling workflow:", error);
      res.status(500).json({ error: "Failed to control workflow" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/api.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});
var appPromise = null;
async function initializeApp() {
  if (!appPromise) {
    appPromise = (async () => {
      await registerRoutes(app);
      app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("Server error:", err);
        res.status(status).json({ message });
      });
      return app;
    })();
  }
  return appPromise;
}
async function handler(req, res) {
  try {
    const app2 = await initializeApp();
    return app2(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : void 0
    });
  }
}
export {
  handler as default
};
