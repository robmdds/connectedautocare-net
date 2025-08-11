import {
  users,
  tenants,
  products,
  rateTables,
  vehicles,
  quotes,
  policies,
  claims,
  payments,
  documents,
  analyticsEvents,
  webhooks,
  resellers,
  type User,
  type UpsertUser,
  type Tenant,
  type Product,
  type Quote,
  type Policy,
  type Claim,
  type Payment,
  type InsertTenant,
  type InsertProduct,
  type InsertQuote,
  type InsertPolicy,
  type InsertClaim,
  type InsertPayment,
  type InsertAnalyticsEvent,
  type InsertWebhook,
  type Vehicle,
  type InsertVehicle,
  type RateTable,
  type InsertRateTable,
  type Document,
  type InsertDocument,
  type Reseller,
  type InsertReseller,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tenant operations
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(tenantId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  
  // Rate table operations
  createRateTable(rateTable: InsertRateTable): Promise<RateTable>;
  getRateTables(tenantId: string, productId?: string): Promise<RateTable[]>;
  getActiveRateTable(productId: string): Promise<RateTable | undefined>;
  
  // Vehicle operations
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleByVin(vin: string): Promise<Vehicle | undefined>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  
  // Quote operations
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: string): Promise<Quote | undefined>;
  getQuoteByNumber(quoteNumber: string): Promise<Quote | undefined>;
  getQuotes(tenantId: string, filters?: any): Promise<Quote[]>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote>;
  
  // Policy operations
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  getPolicy(id: string): Promise<Policy | undefined>;
  getPolicyByNumber(policyNumber: string): Promise<Policy | undefined>;
  getPolicies(tenantId: string, filters?: any): Promise<Policy[]>;
  updatePolicy(id: string, policy: Partial<InsertPolicy>): Promise<Policy>;
  
  // Claim operations
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaim(id: string): Promise<Claim | undefined>;
  getClaimByNumber(claimNumber: string): Promise<Claim | undefined>;
  getClaims(tenantId?: string, filters?: any): Promise<Claim[]>;
  updateClaim(id: string, claim: Partial<InsertClaim>): Promise<Claim>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPayments(tenantId: string, filters?: any): Promise<Payment[]>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(entityType: string, entityId: string): Promise<Document[]>;
  
  // Analytics operations
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<void>;
  getAnalytics(tenantId: string, filters?: any): Promise<any>;
  
  // Webhook operations
  createWebhook(webhook: InsertWebhook): Promise<void>;
  getUnprocessedWebhooks(): Promise<any[]>;
  markWebhookProcessed(id: string, error?: string): Promise<void>;
  
  // Reseller operations
  createReseller(reseller: InsertReseller): Promise<Reseller>;
  getResellers(tenantId: string): Promise<Reseller[]>;
  getResellerBySubdomain(subdomain: string): Promise<Reseller | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Ensure new users are assigned to default tenant if no tenant specified
    if (!userData.tenantId) {
      const defaultTenant = await this.getTenantBySubdomain('default');
      if (defaultTenant) {
        userData.tenantId = defaultTenant.id;
      }
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tenant operations
  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant;
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProducts(tenantId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.tenantId, tenantId));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  // Rate table operations
  async createRateTable(rateTable: InsertRateTable): Promise<RateTable> {
    const [newRateTable] = await db.insert(rateTables).values(rateTable).returning();
    return newRateTable;
  }

  async getRateTables(tenantId: string, productId?: string): Promise<RateTable[]> {
    const conditions = [eq(rateTables.tenantId, tenantId)];
    if (productId) {
      conditions.push(eq(rateTables.productId, productId));
    }
    return db.select().from(rateTables).where(and(...conditions)).orderBy(desc(rateTables.createdAt));
  }

  async getAllRateTables(): Promise<RateTable[]> {
    return db.select().from(rateTables).orderBy(desc(rateTables.createdAt));
  }

  async getActiveRateTable(productId: string): Promise<RateTable | undefined> {
    const now = new Date();
    const [rateTable] = await db
      .select()
      .from(rateTables)
      .where(
        and(
          eq(rateTables.productId, productId),
          eq(rateTables.isActive, true),
          lte(rateTables.effectiveDate, now),
          sql`(${rateTables.expiryDate} IS NULL OR ${rateTables.expiryDate} > ${now})`
        )
      )
      .orderBy(desc(rateTables.effectiveDate))
      .limit(1);
    return rateTable;
  }

  // Vehicle operations
  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehicleByVin(vin: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.vin, vin));
    return vehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const [updated] = await db
      .update(vehicles)
      .set(vehicle)
      .where(eq(vehicles.id, id))
      .returning();
    return updated;
  }

  // Quote operations
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getQuoteByNumber(quoteNumber: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.quoteNumber, quoteNumber));
    return quote;
  }

  async getQuotes(tenantId: string, filters: any = {}): Promise<Quote[]> {
    const conditions = [eq(quotes.tenantId, tenantId)];
    
    if (filters.status) {
      conditions.push(eq(quotes.status, filters.status));
    }
    if (filters.customerEmail) {
      conditions.push(ilike(quotes.customerEmail, `%${filters.customerEmail}%`));
    }
    
    return db.select().from(quotes).where(and(...conditions)).orderBy(desc(quotes.createdAt));
  }

  async updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote> {
    const [updated] = await db
      .update(quotes)
      .set({ ...quote, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return updated;
  }

  // Policy operations
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [newPolicy] = await db.insert(policies).values(policy).returning();
    return newPolicy;
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy;
  }

  async getPolicyByNumber(policyNumber: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.policyNumber, policyNumber));
    return policy;
  }

  async getPolicies(tenantId: string, filters: any = {}): Promise<Policy[]> {
    const conditions = [eq(policies.tenantId, tenantId)];
    
    if (filters.status) {
      conditions.push(eq(policies.status, filters.status));
    }
    if (filters.customerEmail) {
      conditions.push(ilike(policies.customerEmail, `%${filters.customerEmail}%`));
    }
    
    return db.select().from(policies).where(and(...conditions)).orderBy(desc(policies.createdAt));
  }

  async updatePolicy(id: string, policy: Partial<InsertPolicy>): Promise<Policy> {
    const [updated] = await db
      .update(policies)
      .set({ ...policy, updatedAt: new Date() })
      .where(eq(policies.id, id))
      .returning();
    return updated;
  }

  // Claim operations
  async createClaim(claim: InsertClaim): Promise<Claim> {
    const [newClaim] = await db.insert(claims).values(claim).returning();
    return newClaim;
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim;
  }

  async getClaimByNumber(claimNumber: string): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.claimNumber, claimNumber));
    return claim;
  }

  async getClaims(tenantId?: string, filters: any = {}): Promise<Claim[]> {
    const conditions = [];
    
    if (tenantId) {
      // Join with policies to filter by tenant
      conditions.push(sql`${claims.policyId} IN (SELECT id FROM ${policies} WHERE tenant_id = ${tenantId})`);
    }
    
    if (filters.status) {
      conditions.push(eq(claims.status, filters.status));
    }
    if (filters.adjusterId) {
      conditions.push(eq(claims.adjusterId, filters.adjusterId));
    }
    
    return db.select().from(claims)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(claims.createdAt));
  }

  async updateClaim(id: string, claim: Partial<InsertClaim>): Promise<Claim> {
    const [updated] = await db
      .update(claims)
      .set({ ...claim, updatedAt: new Date() })
      .where(eq(claims.id, id))
      .returning();
    return updated;
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPayments(tenantId: string, filters: any = {}): Promise<Payment[]> {
    const conditions = [eq(payments.tenantId, tenantId)];
    
    if (filters.status) {
      conditions.push(eq(payments.status, filters.status));
    }
    
    return db.select().from(payments).where(and(...conditions)).orderBy(desc(payments.createdAt));
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set({ ...payment, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async getDocuments(entityType: string, entityId: string): Promise<Document[]> {
    const conditions = [];
    
    if (entityType === 'policy') {
      conditions.push(eq(documents.policyId, entityId));
    } else if (entityType === 'claim') {
      conditions.push(eq(documents.claimId, entityId));
    }
    
    return db.select().from(documents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(documents.createdAt));
  }

  // Analytics operations
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<void> {
    await db.insert(analyticsEvents).values(event);
  }

  async getAnalytics(tenantId: string, filters: any = {}): Promise<any> {
    // Get basic metrics
    const [policyCount] = await db
      .select({ count: count() })
      .from(policies)
      .where(eq(policies.tenantId, tenantId));

    const [claimCount] = await db
      .select({ count: count() })
      .from(claims)
      .where(sql`${claims.policyId} IN (SELECT id FROM ${policies} WHERE tenant_id = ${tenantId})`);

    const [totalPremium] = await db
      .select({ total: sql<number>`COALESCE(SUM(${policies.premium}), 0)` })
      .from(policies)
      .where(and(eq(policies.tenantId, tenantId), eq(policies.status, 'active')));

    return {
      activePolicies: policyCount.count,
      openClaims: claimCount.count,
      monthlyPremium: totalPremium.total,
    };
  }

  // Webhook operations
  async createWebhook(webhook: InsertWebhook): Promise<void> {
    await db.insert(webhooks).values(webhook);
  }

  async getUnprocessedWebhooks(): Promise<any[]> {
    return db.select().from(webhooks).where(eq(webhooks.processed, false));
  }

  async markWebhookProcessed(id: string, error?: string): Promise<void> {
    await db
      .update(webhooks)
      .set({ 
        processed: true,
        processingError: error || null
      })
      .where(eq(webhooks.id, id));
  }

  // Reseller operations
  async createReseller(reseller: InsertReseller): Promise<Reseller> {
    const [newReseller] = await db.insert(resellers).values(reseller).returning();
    return newReseller;
  }

  async getResellers(tenantId: string): Promise<Reseller[]> {
    return db.select().from(resellers).where(eq(resellers.tenantId, tenantId));
  }

  async getResellerBySubdomain(subdomain: string): Promise<Reseller | undefined> {
    const [reseller] = await db.select().from(resellers).where(eq(resellers.subdomain, subdomain));
    return reseller;
  }
}

export const storage = new DatabaseStorage();
