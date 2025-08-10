import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { HelcimService } from "./services/helcimService";
import { VinDecodeService } from "./services/vinDecodeService";
import { RatingEngineService } from "./services/ratingEngineService";
import { PolicyService } from "./services/policyService";
import { ClaimsService } from "./services/claimsService";
import { AnalyticsService } from "./services/analyticsService";
import { AIAssistantService } from "./services/aiAssistantService";
import { insertQuoteSchema, insertPolicySchema, insertClaimSchema, insertAnalyticsEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  const helcimService = new HelcimService();
  const vinDecodeService = new VinDecodeService();
  const ratingEngineService = new RatingEngineService();
  const policyService = new PolicyService();
  const claimsService = new ClaimsService();
  const analyticsService = new AnalyticsService();
  const aiAssistantService = new AIAssistantService();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // VIN Decode API
  app.post('/api/vehicles/decode', async (req, res) => {
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

  // Quote Generation API
  app.post('/api/quotes', async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      
      // Generate quote number
      const quoteNumber = `QTE-${Date.now()}`;
      
      // Get rating from rating engine
      const ratingResult = await ratingEngineService.calculatePremium(quoteData);
      
      const quote = await storage.createQuote({
        ...quoteData,
        quoteNumber,
        basePremium: ratingResult.basePremium.toString(),
        taxes: ratingResult.taxes.toString(),
        fees: ratingResult.fees.toString(),
        totalPremium: ratingResult.totalPremium.toString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Track analytics event
      await analyticsService.trackEvent({
        tenantId: quote.tenantId!,
        eventType: 'quote_created',
        entityType: 'quote',
        entityId: quote.id,
        properties: {
          productCategory: quoteData.productId,
          premium: ratingResult.totalPremium,
        },
      });

      res.json(quote);
    } catch (error) {
      console.error("Quote creation error:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });

  app.get('/api/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }

      const quotes = await storage.getQuotes(user.tenantId, req.query);
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  // Policy Management API
  app.post('/api/policies', isAuthenticated, async (req: any, res) => {
    try {
      const policyData = insertPolicySchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      const policy = await policyService.issuePolicy({
        ...policyData,
        issuedBy: userId,
      });

      res.json(policy);
    } catch (error) {
      console.error("Policy creation error:", error);
      res.status(500).json({ error: "Failed to create policy" });
    }
  });

  app.get('/api/policies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }

      const policies = await storage.getPolicies(user.tenantId, req.query);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  app.get('/api/policies/:id', isAuthenticated, async (req, res) => {
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

  // Claims Management API
  app.post('/api/claims', isAuthenticated, async (req: any, res) => {
    try {
      const claimData = insertClaimSchema.parse(req.body);
      
      const claim = await claimsService.createClaim(claimData);
      res.json(claim);
    } catch (error) {
      console.error("Claim creation error:", error);
      res.status(500).json({ error: "Failed to create claim" });
    }
  });

  app.get('/api/claims', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const claims = await storage.getClaims(user?.tenantId, req.query);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  app.put('/api/claims/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const claimUpdate = req.body;
      
      const claim = await claimsService.updateClaim(req.params.id, claimUpdate, userId);
      res.json(claim);
    } catch (error) {
      console.error("Claim update error:", error);
      res.status(500).json({ error: "Failed to update claim" });
    }
  });

  // Payment Integration (Helcim)
  app.post('/api/payments/intent', async (req, res) => {
    try {
      const { amount, currency = 'USD', quoteId } = req.body;
      
      if (!amount || !quoteId) {
        return res.status(400).json({ error: "Amount and quoteId are required" });
      }

      const paymentIntent = await helcimService.createPaymentIntent(amount, currency, {
        quoteId,
        description: 'Insurance Policy Premium',
      });

      res.json(paymentIntent);
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Helcim Webhook Handler
  app.post('/api/webhooks/helcim', async (req, res) => {
    try {
      const webhook = await helcimService.processWebhook(req.body, req.headers);
      
      if (webhook.eventType === 'payment.succeeded' && webhook.metadata?.quoteId) {
        // Auto-issue policy on successful payment
        const quote = await storage.getQuote(webhook.metadata.quoteId);
        if (quote) {
          await policyService.issueFromQuote(quote.id, {
            paymentId: webhook.paymentId,
            paymentMethod: 'helcim_card',
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Analytics API
  app.get('/api/analytics/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }

      const analytics = await analyticsService.getDashboardMetrics(user.tenantId);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post('/api/analytics/events', async (req, res) => {
    try {
      const eventData = insertAnalyticsEventSchema.parse(req.body);
      await analyticsService.trackEvent(eventData);
      res.json({ success: true });
    } catch (error) {
      console.error("Analytics event error:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  // AI Assistant API
  app.post('/api/ai/chat', isAuthenticated, async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await aiAssistantService.processMessage(message, context);
      res.json(response);
    } catch (error) {
      console.error("AI assistant error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  // Product Management API
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }

      const products = await storage.getProducts(user.tenantId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Rate Table Management API
  app.get('/api/rate-tables', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }

      const rateTables = await storage.getRateTables(user.tenantId, req.query.productId);
      res.json(rateTables);
    } catch (error) {
      console.error("Error fetching rate tables:", error);
      res.status(500).json({ error: "Failed to fetch rate tables" });
    }
  });

  // Document API
  app.get('/api/documents/:entityType/:entityId', isAuthenticated, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const documents = await storage.getDocuments(entityType, entityId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Reseller API
  app.get('/api/resellers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(400).json({ error: "User not associated with tenant" });
      }

      const resellers = await storage.getResellers(user.tenantId);
      res.json(resellers);
    } catch (error) {
      console.error("Error fetching resellers:", error);
      res.status(500).json({ error: "Failed to fetch resellers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
