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
import { HeroVscRatingService, HERO_VSC_PRODUCTS } from "./services/heroVscService";
import { ConnectedAutoCareRatingService, CONNECTED_AUTO_CARE_PRODUCTS } from "./services/connectedAutoCareService";
import { SpecialQuoteRequestService } from "./services/specialQuoteRequestService";
import { insertQuoteSchema, insertPolicySchema, insertClaimSchema, insertAnalyticsEventSchema, insertSpecialQuoteRequestSchema } from "@shared/schema";
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
  const heroVscService = new HeroVscRatingService();
  const cacService = new ConnectedAutoCareRatingService();
  const specialQuoteRequestService = new SpecialQuoteRequestService();

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

  // VIN Decode API (alternative endpoint for frontend compatibility)
  app.post('/api/vehicles/decode-vin', async (req, res) => {
    try {
      const { vin } = req.body;
      if (!vin) {
        return res.status(400).json({ error: "VIN is required" });
      }

      console.log('VIN decode request:', vin);
      const vehicleData = await vinDecodeService.decodeVin(vin);
      console.log('VIN decode result:', vehicleData);
      
      res.json({ 
        success: true,
        vehicle: vehicleData 
      });
    } catch (error: any) {
      console.error("VIN decode error:", error);
      res.status(400).json({ 
        success: false,
        error: error.message || "Failed to decode VIN" 
      });
    }
  });

  // Hero VSC Products API
  app.get('/api/hero-vsc/products', async (req, res) => {
    try {
      const products = heroVscService.getHeroVscProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching Hero VSC products:", error);
      res.status(500).json({ error: "Failed to fetch Hero VSC products" });
    }
  });

  app.get('/api/hero-vsc/products/:productId', async (req, res) => {
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

  // Hero VSC Quote Generation API
  app.post('/api/hero-vsc/quotes', async (req, res) => {
    try {
      const { productId, coverageSelections, vehicleData, customerData } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // Validate coverage selections
      const validation = heroVscService.validateHeroVscCoverage(productId, coverageSelections);
      if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid coverage selections", details: validation.errors });
      }

      // Generate quote number
      const quoteNumber = `HERO-${Date.now()}`;
      
      // Get Hero VSC rating
      const ratingResult = await heroVscService.calculateHeroVscPremium(
        productId, 
        coverageSelections, 
        vehicleData, 
        customerData
      );

      // Get the actual product ID from Hero VSC product data
      const heroProduct = heroVscService.getHeroVscProduct(productId);
      const actualProductId = heroProduct?.id || productId;

      // Create quote using Hero VSC data
      const quote = await storage.createQuote({
        tenantId: 'hero-vsc', // Hero VSC tenant
        productId: actualProductId,
        quoteNumber,
        customerEmail: customerData?.email,
        customerName: customerData?.name,
        customerPhone: customerData?.phone,
        customerAddress: customerData?.address,
        vehicleId: vehicleData?.id,
        coverageSelections: coverageSelections,
        basePremium: ratingResult.basePremium.toString(),
        taxes: ratingResult.taxes.toString(),
        fees: ratingResult.fees.toString(),
        totalPremium: ratingResult.totalPremium.toString(),
        ratingData: ratingResult.factors,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Track analytics event
      await analyticsService.trackEvent({
        tenantId: 'hero-vsc',
        eventType: 'hero_vsc_quote_created',
        entityType: 'quote',
        entityId: quote.id,
        properties: {
          productId: productId,
          productName: ratingResult.productDetails.name,
          premium: ratingResult.totalPremium,
          coverageSelections: coverageSelections,
        },
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

  // Quote Generation API (Legacy)
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

  // Special Quote Requests API
  app.post('/api/special-quote-requests', async (req, res) => {
    try {
      const requestData = req.body;
      
      // Basic validation
      if (!requestData.productId || !requestData.vehicleData || !requestData.customerData) {
        return res.status(400).json({ error: "Missing required fields: productId, vehicleData, customerData" });
      }

      const specialRequest = await specialQuoteRequestService.createSpecialQuoteRequest({
        tenantId: 'default-tenant', // For now using default tenant
        productId: requestData.productId,
        vehicleData: requestData.vehicleData,
        coverageSelections: requestData.coverageSelections || {},
        customerData: requestData.customerData,
        eligibilityReasons: requestData.eligibilityReasons || [],
        requestReason: requestData.requestReason || 'Customer requested special review'
      });

      res.json({
        message: "Special quote request submitted successfully. Our team will review your request and contact you within 24 hours.",
        requestNumber: specialRequest.requestNumber,
        requestId: specialRequest.id
      });
    } catch (error) {
      console.error('Special quote request error:', error);
      res.status(500).json({ error: 'Failed to submit special quote request' });
    }
  });

  app.get('/api/special-quote-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admin only for now
      if (user?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }

      const requests = await specialQuoteRequestService.getAllSpecialQuoteRequests(user.tenantId);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching special quote requests:', error);
      res.status(500).json({ error: 'Failed to fetch special quote requests' });
    }
  });

  app.get('/api/special-quote-requests/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admin only for now
      if (user?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }

      const summary = await specialQuoteRequestService.getRequestsSummary(user.tenantId);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching special quote requests summary:', error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  });

  app.put('/api/special-quote-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes, alternativeQuote, declineReason } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admin only for now
      if (user?.role !== 'admin') {
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
      console.error('Error updating special quote request:', error);
      res.status(500).json({ error: 'Failed to update special quote request' });
    }
  });

  // Connected Auto Care Product Listing API
  app.get('/api/connected-auto-care/products', async (req, res) => {
    try {
      const products = cacService.getConnectedAutoCareProducts();
      res.json({ products });
    } catch (error) {
      console.error('Connected Auto Care products fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Connected Auto Care products' });
    }
  });

  // Get valid coverage options for Connected Auto Care based on vehicle data
  app.post('/api/connected-auto-care/coverage-options', async (req, res) => {
    try {
      const { productId, vehicleData } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      if (!vehicleData) {
        return res.status(400).json({ error: 'Vehicle data is required' });
      }
      
      const options = cacService.getValidCoverageOptions(productId, vehicleData);
      
      res.json({
        success: true,
        productId,
        vehicleData,
        coverageOptions: options
      });
      
    } catch (error) {
      console.error('Error getting coverage options:', error);
      res.status(500).json({ error: 'Failed to get coverage options' });
    }
  });

  // Connected Auto Care Quote Generation API
  app.post('/api/connected-auto-care/quotes', async (req, res) => {
    try {
      const { productId, coverageSelections, vehicleData, customerData } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // Validate coverage selections
      const validation = cacService.validateConnectedAutoCareCoverage(productId, coverageSelections);
      if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid coverage selections", details: validation.errors });
      }

      // Generate quote number
      const quoteNumber = `CAC-${Date.now()}`;
      
      // Get Connected Auto Care rating
      const ratingResult = await cacService.calculateConnectedAutoCarePremium(
        productId, 
        coverageSelections, 
        vehicleData, 
        customerData
      );

      // Check if vehicle is ineligible - return proper message instead of error
      if (ratingResult.status === 'ineligible') {
        return res.json({
          quote: {
            id: ratingResult.id,
            status: 'ineligible',
            eligibilityReasons: ratingResult.eligibilityReasons,
            allowSpecialQuote: ratingResult.allowSpecialQuote,
            productId: productId,
            vehicleData: vehicleData,
            coverageSelections: coverageSelections,
            customerData: customerData,
            totalPremium: 0,
            createdAt: ratingResult.createdAt
          },
          message: 'This vehicle does not qualify for coverage',
          eligibilityReasons: ratingResult.eligibilityReasons,
          allowSpecialQuote: ratingResult.allowSpecialQuote
        });
      }

      // Get the actual product ID from Connected Auto Care product data
      const cacProduct = cacService.getConnectedAutoCareProduct(productId);
      const actualProductId = cacProduct?.id || productId;

      // Create quote using Connected Auto Care data
      const quote = await storage.createQuote({
        tenantId: 'connected-auto-care', // Connected Auto Care tenant
        productId: actualProductId,
        quoteNumber,
        customerEmail: customerData?.email,
        customerName: customerData?.name,
        customerPhone: customerData?.phone,
        customerAddress: customerData?.address,
        vehicleId: vehicleData?.id,
        coverageSelections: coverageSelections,
        basePremium: ratingResult.basePremium.toString(),
        taxes: ratingResult.taxes.toString(),
        fees: ratingResult.fees.toString(),
        totalPremium: ratingResult.totalPremium.toString(),
        ratingData: ratingResult.factors,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Track analytics event
      await analyticsService.trackEvent({
        tenantId: 'connected-auto-care',
        eventType: 'cac_quote_created',
        entityType: 'quote',
        entityId: quote.id,
        properties: {
          productId: productId,
          productName: ratingResult.productDetails.name,
          premium: ratingResult.totalPremium,
          coverageSelections: coverageSelections,
        },
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

  // Special quote request endpoint
  app.post('/api/special-quote-requests', async (req, res) => {
    try {
      const {
        productId,
        vehicleData,
        coverageSelections,
        customerData,
        eligibilityReasons,
        requestReason
      } = req.body;

      // Create special quote request record
      const specialQuoteRequest = {
        id: Math.random().toString(36).substr(2, 9),
        productId,
        vehicleData,
        coverageSelections,
        customerData,
        eligibilityReasons,
        requestReason,
        status: 'pending_admin_review',
        createdAt: new Date().toISOString(),
        requestedBy: customerData.email || 'unknown'
      };

      // In a real application, this would be saved to a database
      // For now, just log it for admin review
      console.log('=== SPECIAL QUOTE REQUEST ===');
      console.log('Request ID:', specialQuoteRequest.id);
      console.log('Product:', productId);
      console.log('Vehicle:', `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
      console.log('Mileage:', vehicleData.mileage);
      console.log('Customer:', customerData.email);
      console.log('Eligibility Issues:', eligibilityReasons);
      console.log('Request Reason:', requestReason);
      console.log('=============================');

      // Track analytics event
      await analyticsService.trackEvent({
        tenantId: 'connected-auto-care',
        eventType: 'special_quote_requested',
        entityType: 'special_quote_request',
        entityId: specialQuoteRequest.id,
        properties: {
          productId: productId,
          vehicleYear: vehicleData.year,
          vehicleMake: vehicleData.make,
          vehicleModel: vehicleData.model,
          currentMileage: vehicleData.mileage,
          eligibilityReasons: eligibilityReasons,
          requestReason: requestReason
        },
      });

      res.json({
        success: true,
        requestId: specialQuoteRequest.id,
        message: 'Special quote request submitted successfully. An admin will review and contact you within 24 hours.'
      });
    } catch (error) {
      console.error('Error submitting special quote request:', error);
      res.status(500).json({
        error: 'Failed to submit special quote request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin API endpoints
  app.get('/api/admin/system-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // For now, return basic stats
      const stats = {
        activeUsers: 1,
        systemStatus: 'operational',
        databaseStatus: 'connected',
        apiStatus: 'healthy'
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      res.status(500).json({ error: 'Failed to fetch system stats' });
    }
  });

  app.get('/api/admin/rate-tables', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Get all rate tables for admin view
      const rateTables = await storage.getAllRateTables();
      
      res.json(rateTables);
    } catch (error) {
      console.error('Error fetching admin rate tables:', error);
      res.status(500).json({ error: 'Failed to fetch rate tables' });
    }
  });

  app.post('/api/admin/rate-tables/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // TODO: Implement file upload and processing
      res.status(501).json({ error: 'Rate table upload not yet implemented' });
    } catch (error) {
      console.error('Error uploading rate table:', error);
      res.status(500).json({ error: 'Failed to upload rate table' });
    }
  });

  app.get('/api/admin/coverage-options', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Get coverage options from both product services
      const heroOptions = Object.keys(HERO_VSC_PRODUCTS).map(productId => ({
        provider: 'hero-vsc',
        productId,
        product: HERO_VSC_PRODUCTS[productId]
      }));
      
      const cacOptions = Object.keys(CONNECTED_AUTO_CARE_PRODUCTS).map(productId => ({
        provider: 'connected-auto-care', 
        productId,
        product: CONNECTED_AUTO_CARE_PRODUCTS[productId]
      }));
      
      res.json({
        providers: [
          {
            id: 'hero-vsc',
            name: 'Hero VSC',
            products: heroOptions
          },
          {
            id: 'connected-auto-care',
            name: 'Connected Auto Care',
            products: cacOptions
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching coverage options:', error);
      res.status(500).json({ error: 'Failed to fetch coverage options' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
