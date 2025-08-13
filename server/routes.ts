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
  // Health check endpoint for uptime monitoring
  app.get('/healthz', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Sitemap endpoint
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    const lastmod = new Date().toISOString().split('T')[0];
    
    const urls = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/products', priority: '0.9', changefreq: 'weekly' },
      { loc: '/faq', priority: '0.8', changefreq: 'weekly' },
      { loc: '/claims', priority: '0.8', changefreq: 'monthly' },
      { loc: '/hero-vsc', priority: '0.7', changefreq: 'monthly' },
      { loc: '/connected-auto-care', priority: '0.7', changefreq: 'monthly' },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

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

  // VIN Decode API (GET endpoint for frontend VIN widget)
  app.get('/api/vin/decode/:vin', async (req, res) => {
    try {
      const { vin } = req.params;
      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: "Valid 17-character VIN is required" });
      }

      console.log('VIN decode GET request:', vin);
      const vehicleData = await vinDecodeService.decodeVin(vin);
      console.log('VIN decode result:', vehicleData);
      
      res.json(vehicleData);
    } catch (error: any) {
      console.error("VIN decode error:", error);
      res.status(400).json({ 
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
      
      const claims = await storage.getClaims(user?.tenantId || undefined, req.query);
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
          await policyService.createPolicyFromQuote(quote.id, {
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

  // AI Assistant API (missing endpoints)
  app.get('/api/ai-assistant/knowledge-base', async (req, res) => {
    try {
      const knowledgeBase = {
        categories: [
          { id: 'vsc_basics', name: 'Vehicle Service Contracts', topicCount: 15 },
          { id: 'claims_process', name: 'Claims Processing', topicCount: 12 },
          { id: 'policy_management', name: 'Policy Management', topicCount: 8 }
        ],
        totalTopics: 35,
        lastUpdated: new Date().toISOString()
      };
      res.json(knowledgeBase);
    } catch (error) {
      console.error('Knowledge base error:', error);
      res.status(500).json({ error: 'Failed to fetch knowledge base' });
    }
  });

  app.post('/api/ai-assistant/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      let response = 'I understand your question about insurance. Let me help you with that.';
      if (message.toLowerCase().includes('vsc')) {
        response = 'A Vehicle Service Contract (VSC) is an optional protection plan that covers specific vehicle components beyond your manufacturer warranty.';
      } else if (message.toLowerCase().includes('claim')) {
        response = 'To file a claim, contact our claims department at 1-800-555-CLAIM or submit online through your policy portal.';
      }

      res.json({
        response,
        context: context || 'general',
        timestamp: new Date().toISOString(),
        conversationId: `conv_${Date.now()}`
      });
    } catch (error) {
      console.error('AI assistant error:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  });

  // Policy Management API (missing endpoints)
  app.get('/api/policy-management/documents', async (req, res) => {
    try {
      const documents = [
        { id: 'doc_001', name: 'Policy Certificate Template', type: 'certificate', status: 'active' },
        { id: 'doc_002', name: 'Claims Form Template', type: 'form', status: 'active' },
        { id: 'doc_003', name: 'Coverage Summary Template', type: 'summary', status: 'active' }
      ];
      res.json(documents);
    } catch (error) {
      console.error('Policy documents error:', error);
      res.status(500).json({ error: 'Failed to fetch policy documents' });
    }
  });

  app.get('/api/policy-management/renewal/dashboard', async (req, res) => {
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
      console.error('Renewal dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch renewal dashboard' });
    }
  });

  // Notifications System API (missing endpoints)
  app.get('/api/notifications/system', async (req, res) => {
    try {
      const notifications = [
        { id: 'notif_001', type: 'priority', title: 'High-Value Claim Requires Review', message: 'Claim CLM-2025-001235 flagged for manual review - $8,500 water damage', timestamp: new Date().toISOString() },
        { id: 'notif_002', type: 'info', title: '156 Renewals This Month', message: 'Monthly renewal target of 150 exceeded by 6 policies', timestamp: new Date().toISOString() },
        { id: 'notif_003', type: 'warning', title: 'System Integration Alert', message: '1 external API showing degraded performance', timestamp: new Date().toISOString() }
      ];
      res.json(notifications);
    } catch (error) {
      console.error('System notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch system notifications' });
    }
  });

  // System Integration Health API (missing endpoints)
  app.get('/api/system-integration/health', async (req, res) => {
    try {
      const healthStatus = {
        components: [
          { name: 'VIN Decoding API', status: 'healthy', responseTime: 271, uptime: 99.8, lastCheck: new Date().toISOString() },
          { name: 'Payment Gateway', status: 'warning', responseTime: 1200, uptime: 97.2, lastCheck: new Date().toISOString() },
          { name: 'Email Service', status: 'down', responseTime: null, uptime: 0, lastCheck: new Date().toISOString() },
          { name: 'Analytics Engine', status: 'healthy', responseTime: 89, uptime: 99.9, lastCheck: new Date().toISOString() },
          { name: 'Claims Processing', status: 'healthy', responseTime: 156, uptime: 99.5, lastCheck: new Date().toISOString() },
          { name: 'Policy Management', status: 'healthy', responseTime: 201, uptime: 98.7, lastCheck: new Date().toISOString() }
        ],
        overallHealth: 85,
        lastUpdated: new Date().toISOString()
      };
      res.json(healthStatus);
    } catch (error) {
      console.error('System health error:', error);
      res.status(500).json({ error: 'Failed to fetch system health' });
    }
  });

  // AI Assistant API
  app.post('/api/ai/chat', isAuthenticated, async (req, res) => {
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

      const requests = await specialQuoteRequestService.getAllSpecialQuoteRequests(user.tenantId || undefined);
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

      const summary = await specialQuoteRequestService.getRequestsSummary(user.tenantId || undefined);
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

  // Admin AI Models endpoints
  app.get('/api/admin/ai-models', isAuthenticated, async (req: any, res) => {
    try {
      // Return mock AI model configuration data
      const modelConfig = {
        currentModel: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2048,
        enableFunctionCalling: true
      };
      
      res.json(modelConfig);
    } catch (error) {
      console.error('Error fetching AI models:', error);
      res.status(500).json({ error: 'Failed to fetch AI models' });
    }
  });

  app.put('/api/admin/ai-models', isAuthenticated, async (req: any, res) => {
    try {
      const { model, temperature, maxTokens, enableFunctionCalling } = req.body;
      
      // In a real app, this would update the AI configuration
      console.log('Updating AI model configuration:', { model, temperature, maxTokens, enableFunctionCalling });
      
      res.json({ 
        success: true, 
        message: 'AI model configuration updated successfully' 
      });
    } catch (error) {
      console.error('Error updating AI models:', error);
      res.status(500).json({ error: 'Failed to update AI models' });
    }
  });

  // Admin Training Data endpoints
  app.get('/api/admin/training-data', isAuthenticated, async (req: any, res) => {
    try {
      // Return mock training data
      const trainingData = {
        datasets: [
          {
            id: 'insurance-faq',
            name: 'Insurance FAQ Dataset',
            recordCount: 1847,
            status: 'active'
          }
        ]
      };
      
      res.json(trainingData);
    } catch (error) {
      console.error('Error fetching training data:', error);
      res.status(500).json({ error: 'Failed to fetch training data' });
    }
  });

  app.post('/api/admin/training-data', isAuthenticated, async (req: any, res) => {
    try {
      const { name, description } = req.body;
      
      // In a real app, this would create a new training dataset
      console.log('Creating training dataset:', { name, description });
      
      const newDataset = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description,
        status: 'active',
        recordCount: 0,
        createdAt: new Date().toISOString()
      };
      
      res.json(newDataset);
    } catch (error) {
      console.error('Error creating training data:', error);
      res.status(500).json({ error: 'Failed to create training data' });
    }
  });

  // Admin Response Templates endpoints
  app.get('/api/admin/response-templates', isAuthenticated, async (req: any, res) => {
    try {
      // Return mock response templates data
      const templates = [
        {
          id: 'welcome-message',
          name: 'Welcome Message',
          category: 'customer-service',
          content: 'Hello! Welcome to our insurance platform.',
          status: 'active'
        }
      ];
      
      res.json(templates);
    } catch (error) {
      console.error('Error fetching response templates:', error);
      res.status(500).json({ error: 'Failed to fetch response templates' });
    }
  });

  app.post('/api/admin/response-templates', isAuthenticated, async (req: any, res) => {
    try {
      const { name, category, content } = req.body;
      
      // In a real app, this would create a new response template
      console.log('Creating response template:', { name, category, content });
      
      const newTemplate = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        category,
        content,
        status: 'active',
        usageCount: 0,
        createdAt: new Date().toISOString()
      };
      
      res.json(newTemplate);
    } catch (error) {
      console.error('Error creating response template:', error);
      res.status(500).json({ error: 'Failed to create response template' });
    }
  });

  app.put('/api/admin/response-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, category, content } = req.body;
      
      // In a real app, this would update the response template
      console.log('Updating response template:', { id, name, category, content });
      
      const updatedTemplate = {
        id,
        name,
        category,
        content,
        status: 'active',
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating response template:', error);
      res.status(500).json({ error: 'Failed to update response template' });
    }
  });

  // Admin Tenants endpoint
  app.get('/api/admin/tenants', isAuthenticated, async (req: any, res) => {
    try {
      // Return mock tenant data
      const tenants = [
        {
          id: 'hero-vsc',
          name: 'Hero VSC',
          status: 'active',
          productCount: 3,
          policyCount: 1247,
          createdAt: '2024-01-15'
        },
        {
          id: 'connected-auto-care',
          name: 'Connected Auto Care',
          status: 'active',
          productCount: 3,
          policyCount: 892,
          createdAt: '2024-02-20'
        },
        {
          id: 'sample-insurance',
          name: 'Sample Insurance',
          status: 'inactive',
          productCount: 5,
          policyCount: 423,
          createdAt: '2023-12-01'
        }
      ];
      
      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  });

  // Admin Resellers endpoint
  app.get('/api/admin/resellers', isAuthenticated, async (req: any, res) => {
    try {
      // Return mock reseller data
      const resellers = [
        {
          id: 'premier-auto',
          name: 'Premier Auto Group',
          contactEmail: 'contact@premierauto.com',
          contactPhone: '(555) 123-4567',
          tier: 'Platinum',
          commissionRate: 15,
          totalSales: 245000,
          activePolicies: 487,
          status: 'active'
        },
        {
          id: 'metro-dealers',
          name: 'Metro Dealers Alliance',
          contactEmail: 'sales@metrodealers.com',
          contactPhone: '(555) 234-5678',
          tier: 'Gold',
          commissionRate: 12,
          totalSales: 156000,
          activePolicies: 312,
          status: 'active'
        },
        {
          id: 'coastal-automotive',
          name: 'Coastal Automotive',
          contactEmail: 'info@coastalauto.com',
          contactPhone: '(555) 345-6789',
          tier: 'Silver',
          commissionRate: 10,
          totalSales: 98000,
          activePolicies: 196,
          status: 'active'
        },
        {
          id: 'hometown-motors',
          name: 'Hometown Motors',
          contactEmail: 'team@hometownmotors.com',
          contactPhone: '(555) 456-7890',
          tier: 'Bronze',
          commissionRate: 8,
          totalSales: 53000,
          activePolicies: 106,
          status: 'pending'
        }
      ];
      
      res.json(resellers);
    } catch (error) {
      console.error('Error fetching resellers:', error);
      res.status(500).json({ error: 'Failed to fetch resellers' });
    }
  });

  app.post('/api/admin/resellers', isAuthenticated, async (req: any, res) => {
    try {
      const { name, email, commissionRate } = req.body;
      
      // In a real app, this would create a new reseller
      console.log('Creating reseller:', { name, email, commissionRate });
      
      const newReseller = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        contactEmail: email,
        commissionRate,
        tier: 'Bronze',
        status: 'pending',
        totalSales: 0,
        activePolicies: 0,
        createdAt: new Date().toISOString()
      };
      
      res.json(newReseller);
    } catch (error) {
      console.error('Error creating reseller:', error);
      res.status(500).json({ error: 'Failed to create reseller' });
    }
  });

  app.put('/api/admin/resellers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, email, commissionRate, tier, status } = req.body;
      
      // In a real app, this would update the reseller
      console.log('Updating reseller:', { id, name, email, commissionRate, tier, status });
      
      const updatedReseller = {
        id,
        name,
        contactEmail: email,
        commissionRate,
        tier,
        status,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedReseller);
    } catch (error) {
      console.error('Error updating reseller:', error);
      res.status(500).json({ error: 'Failed to update reseller' });
    }
  });

  // Admin API Integrations endpoints
  app.get('/api/admin/integrations', async (req, res) => {
    try {
      const integrations = [
        {
          id: 'vin-decode',
          name: 'VIN Decoding Service',
          status: 'connected',
          endpoint: 'https://vpic.nhtsa.dot.gov/api/',
          responseTime: '188ms'
        },
        {
          id: 'helcim-payments', 
          name: 'Helcim Payment Gateway',
          status: 'configured',
          endpoint: 'https://api.helcim.com/v2/',
          responseTime: '245ms'
        },
        {
          id: 'openai',
          name: 'OpenAI API',
          status: 'connected',
          endpoint: 'https://api.openai.com/v1/',
          responseTime: '892ms'
        },
        {
          id: 'postgres',
          name: 'PostgreSQL Database',
          status: 'connected',
          endpoint: 'Neon Serverless PostgreSQL',
          responseTime: '45ms'
        }
      ];
      
      res.json(integrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      res.status(500).json({ error: 'Failed to fetch integrations' });
    }
  });

  // Test integration endpoint
  app.post('/api/admin/integrations/:id/test', async (req, res) => {
    try {
      const { id } = req.params;
      const startTime = Date.now();
      let result;
      
      switch (id) {
        case 'helcim-payments':
          try {
            const apiToken = process.env.HELCIM_API_TOKEN;
            
            if (!apiToken) {
              result = {
                success: false,
                responseTime: Date.now() - startTime,
                error: 'HELCIM_API_TOKEN not configured. Please add your Helcim API key.'
              };
            } else {
              // Test with different authentication header formats that Helcim might use
              let response;
              let authMethod = '';
              
              // Try different authentication approaches
              const authTests = [
                { headers: { 'api-token': apiToken, 'Content-Type': 'application/json' }, method: 'api-token header' },
                { headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' }, method: 'Bearer token' },
                { headers: { 'Authorization': `Token ${apiToken}`, 'Content-Type': 'application/json' }, method: 'Token prefix' },
                { headers: { 'x-api-token': apiToken, 'Content-Type': 'application/json' }, method: 'x-api-token header' }
              ];
              
              for (const test of authTests) {
                response = await fetch('https://api.helcim.com/v2/customers', {
                  method: 'GET',
                  headers: test.headers
                });
                authMethod = test.method;
                if (response.status !== 401) break;
              }

              const responseText = response.status === 401 ? await response.text() : 'Connection test';
              
              if (response.status === 401 || response.status === 403) {
                result = {
                  success: false,
                  status: response.status,
                  responseTime: Date.now() - startTime,
                  error: `Authentication failed with all methods tested. API key: ${apiToken.substring(0, 8)}... Please verify the API key is correct and has proper permissions.`
                };
              } else if (response.status === 404) {
                // 404 could mean endpoint doesn't exist but auth might be working
                result = {
                  success: true,
                  status: response.status,
                  responseTime: Date.now() - startTime,
                  data: 'API authentication appears valid. Endpoint returned 404 which may indicate API version differences.'
                };
              } else if (response.ok) {
                result = {
                  success: true,
                  status: response.status,
                  responseTime: Date.now() - startTime,
                  data: 'Helcim API connection and authentication successful!'
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
              error: error instanceof Error ? error.message : 'Connection failed'
            };
          }
          break;
          
        case 'vin-decode':
          try {
            const vinResult = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleVariableValuesList/make?format=json');
            const data = await vinResult.json();
            result = {
              success: vinResult.ok,
              status: vinResult.status,
              responseTime: Date.now() - startTime,
              data: data?.Message || 'VIN API connection successful'
            };
          } catch (error) {
            result = {
              success: false,
              responseTime: Date.now() - startTime,
              error: error instanceof Error ? error.message : 'VIN API connection failed'
            };
          }
          break;
          
        case 'openai':
          try {
            if (!process.env.OPENAI_API_KEY) {
              result = {
                success: false,
                responseTime: Date.now() - startTime,
                error: 'OPENAI_API_KEY environment variable not set. Please add your OpenAI API key.'
              };
            } else {
              const openaiResult = await fetch('https://api.openai.com/v1/models', {
                headers: {
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
              });
              result = {
                success: openaiResult.ok,
                status: openaiResult.status,
                responseTime: Date.now() - startTime,
                data: openaiResult.ok ? 'OpenAI API connection successful' : 'OpenAI API connection failed'
              };
            }
          } catch (error) {
            result = {
              success: false,
              responseTime: Date.now() - startTime,
              error: error instanceof Error ? error.message : 'OpenAI API connection failed'
            };
          }
          break;
          
        case 'postgres':
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
              error: error instanceof Error ? error.message : 'Database connection failed'
            };
          }
          break;
          
        default:
          result = {
            success: false,
            responseTime: Date.now() - startTime,
            error: 'Unknown integration ID'
          };
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error testing integration:', error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    }
  });

  // Update integration endpoint
  app.put('/api/admin/integrations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { apiKey, endpoint, timeout, retries } = req.body;
      
      // In a real application, this would update environment variables or configuration
      console.log(`Updating integration ${id} configuration:`, { 
        apiKey: apiKey ? '***masked***' : 'not provided', 
        endpoint, 
        timeout, 
        retries 
      });
      
      // Simulate configuration update based on integration type
      switch (id) {
        case 'helcim-payments':
          if (apiKey && apiKey !== '••••••••••••') {
            console.log('Would update HELCIM_API_TOKEN environment variable');
          }
          break;
        case 'openai':
          if (apiKey && apiKey !== '••••••••••••') {
            console.log('Would update OPENAI_API_KEY environment variable');
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
      console.error('Error updating integration:', error);
      res.status(500).json({ error: 'Failed to update integration' });
    }
  });

  // Wholesale Portal API Routes
  app.get('/api/wholesale/stats', async (req, res) => {
    try {
      // In production, this would fetch real partner statistics
      const stats = {
        totalSales: 247500,
        monthlyCommission: 18560,
        activePolicies: 1243,
        conversionRate: 24.5
      };
      res.json(stats);
    } catch (error) {
      console.error('Error fetching wholesale stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // White-label Configuration API
  app.get('/api/wholesale/white-label/config/:resellerId', async (req, res) => {
    try {
      const { resellerId } = req.params;
      
      // Mock white-label configuration data
      const config = {
        resellerId,
        branding: {
          logoUrl: '/assets/partner-logo.png',
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          accentColor: '#f59e0b',
          companyName: 'Premium Insurance Partners',
          tagline: 'Comprehensive Protection Solutions',
          contactPhone: '1-800-PARTNER',
          contactEmail: 'info@premiuminsurance.com',
          address: '123 Business Avenue, Suite 100, Business City, BC 12345'
        },
        domain: {
          subdomain: 'premiuminsurance',
          customDomain: 'insurance.premiumpartners.com',
          sslEnabled: true,
          domainStatus: 'active'
        },
        products: {
          autoAdvantage: { enabled: true, markup: 15, commission: 12 },
          homeProtection: { enabled: true, markup: 20, commission: 15 },
          allVehicle: { enabled: true, markup: 18, commission: 10 },
          rvProtection: { enabled: false, markup: 22, commission: 14 }
        },
        pages: {
          landingPage: {
            title: 'Comprehensive Vehicle & Home Protection',
            heroText: 'Protect your most valuable assets with our trusted coverage solutions',
            ctaText: 'Get Your Free Quote Today',
            features: [
              'Comprehensive Auto Protection',
              'Complete Home Coverage',
              '24/7 Customer Support',
              'Fast Claims Processing'
            ]
          },
          aboutPage: {
            companyStory: 'We have been serving our community for over 15 years with reliable insurance solutions.',
            mission: 'To provide comprehensive, affordable protection for families and businesses.'
          }
        },
        seo: {
          metaTitle: 'Vehicle & Home Protection | Premium Insurance Partners',
          metaDescription: 'Get comprehensive auto and home protection plans from Premium Insurance Partners. Fast quotes, excellent coverage, and 24/7 support.',
          keywords: 'auto insurance, home protection, vehicle warranty, comprehensive coverage',
          ogImage: '/assets/partner-og-image.jpg'
        }
      };

      res.json(config);
    } catch (error) {
      console.error('Error fetching white-label config:', error);
      res.status(500).json({ error: 'Failed to fetch white-label configuration' });
    }
  });

  app.put('/api/wholesale/white-label/config/:resellerId', async (req, res) => {
    try {
      const { resellerId } = req.params;
      const { branding, domain, products, pages, seo } = req.body;

      // In production, this would save to database
      console.log(`Updating white-label config for reseller ${resellerId}:`, {
        branding: branding ? 'Updated' : 'No changes',
        domain: domain ? 'Updated' : 'No changes',
        products: products ? 'Updated' : 'No changes',
        pages: pages ? 'Updated' : 'No changes',
        seo: seo ? 'Updated' : 'No changes'
      });

      res.json({
        success: true,
        message: 'White-label configuration updated successfully',
        resellerId,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating white-label config:', error);
      res.status(500).json({ error: 'Failed to update white-label configuration' });
    }
  });

  // Subdomain/Domain Management API
  app.post('/api/wholesale/white-label/domain', async (req, res) => {
    try {
      const { resellerId, subdomain, customDomain, sslRequired } = req.body;

      // In production, this would:
      // 1. Check domain availability
      // 2. Configure DNS/SSL
      // 3. Set up routing
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
        status: 'configuring',
        dnsCname: customDomain ? 'tpaplatform.com' : null,
        sslStatus: sslRequired ? 'pending' : 'not_required',
        estimatedCompletion: '15 minutes'
      };

      res.json(result);
    } catch (error) {
      console.error('Error configuring domain:', error);
      res.status(500).json({ error: 'Failed to configure domain' });
    }
  });

  // White-label Quote Widget API
  app.get('/api/wholesale/white-label/quote-widget/:resellerId', async (req, res) => {
    try {
      const { resellerId } = req.params;
      
      // Generate embeddable quote widget code
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
        documentation: 'https://docs.tpaplatform.com/widgets/quote'
      });
    } catch (error) {
      console.error('Error generating quote widget:', error);
      res.status(500).json({ error: 'Failed to generate quote widget' });
    }
  });

  app.get('/api/wholesale/products', async (req, res) => {
    try {
      // In production, this would fetch products with partner-specific pricing
      const products = [
        {
          id: 'auto-advantage-wholesale',
          name: 'Auto Advantage Program',
          category: 'Vehicle Protection',
          basePrice: 1200,
          partnerMarkup: 15,
          commission: 12,
          status: 'active',
          description: 'Comprehensive auto protection with deductible reimbursement'
        },
        {
          id: 'home-protection-wholesale',
          name: 'Home Protection Plan',
          category: 'Home Protection',
          basePrice: 800,
          partnerMarkup: 20,
          commission: 15,
          status: 'active',
          description: 'Complete home protection with emergency services'
        },
        {
          id: 'all-vehicle-wholesale',
          name: 'All-Vehicle Protection',
          category: 'Multi-Vehicle',
          basePrice: 1500,
          partnerMarkup: 18,
          commission: 10,
          status: 'active',
          description: 'Protection for cars, motorcycles, ATVs, boats, and RVs'
        }
      ];
      res.json(products);
    } catch (error) {
      console.error('Error fetching wholesale products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/api/wholesale/quotes', async (req, res) => {
    try {
      // In production, this would fetch partner's quotes from database
      const quotes = [
        {
          id: 'wq-001',
          productName: 'Auto Advantage Program',
          customerEmail: 'customer@example.com',
          totalPremium: 1380,
          commission: 165.6,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'wq-002',
          productName: 'Home Protection Plan',
          customerEmail: 'homeowner@example.com',
          totalPremium: 960,
          commission: 144,
          status: 'sold',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching wholesale quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  app.post('/api/wholesale/quotes', async (req, res) => {
    try {
      const { productId, vin, zip, term, mileage } = req.body;
      
      // Validate input
      if (!productId || !vin) {
        return res.status(400).json({ error: 'Product ID and VIN are required' });
      }

      // In production, this would:
      // 1. Decode VIN using existing service
      // 2. Calculate quote using rating engine
      // 3. Apply partner markup and commission
      // 4. Store quote in database
      
      const quote = {
        id: `wq-${Date.now()}`,
        productId,
        vin,
        zip,
        term,
        mileage,
        productName: 'Auto Advantage Program', // Would be looked up from productId
        basePremium: 1200,
        partnerMarkup: 180, // 15% markup
        totalPremium: 1380,
        commission: 165.6, // 12% commission
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      res.json({ 
        success: true, 
        quote,
        message: 'Wholesale quote generated successfully'
      });
    } catch (error) {
      console.error('Error generating wholesale quote:', error);
      res.status(500).json({ error: 'Failed to generate quote' });
    }
  });

  // Bulk quote processing endpoint
  app.post('/api/wholesale/bulk-quotes', async (req, res) => {
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      // Process each item
      const results = items.map((item: any) => {
        try {
          // Validate required fields
          if (!item.vin || !item.productId || !item.term) {
            return {
              ...item,
              status: 'error',
              errorMessage: 'Missing required fields: VIN, Product, or Term'
            };
          }

          // Simulate quote calculation (in production, would use actual rating engine)
          const basePremium = Math.floor(Math.random() * 1000) + 800; // $800-1800
          const markupRate = 0.15; // 15% markup
          const commissionRate = 0.12; // 12% commission
          
          const markup = basePremium * markupRate;
          const totalPremium = basePremium + markup;
          const commission = totalPremium * commissionRate;

          return {
            ...item,
            basePremium,
            totalPremium: Math.round(totalPremium),
            commission: Math.round(commission),
            status: 'processed'
          };
        } catch (error) {
          return {
            ...item,
            status: 'error',
            errorMessage: 'Processing error occurred'
          };
        }
      });

      res.json({ 
        success: true, 
        results,
        summary: {
          total: items.length,
          processed: results.filter(r => r.status === 'processed').length,
          errors: results.filter(r => r.status === 'error').length
        }
      });
    } catch (error) {
      console.error('Error processing bulk quotes:', error);
      res.status(500).json({ error: 'Failed to process bulk quotes' });
    }
  });

  // Partner authentication endpoint
  app.post('/api/wholesale/auth', async (req, res) => {
    try {
      const { partnerCode, username, password } = req.body;
      
      // In production, this would authenticate against partner database
      if (partnerCode && username && password) {
        const partnerData = {
          id: 'partner-001',
          partnerCode,
          companyName: 'Premium Insurance Agency',
          contactName: username,
          tier: 'gold',
          commissionRate: 12,
          markupRate: 15,
          isActive: true
        };
        
        res.json({ 
          success: true, 
          partner: partnerData,
          token: 'wholesale-jwt-token' // Would be actual JWT in production
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error authenticating partner:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // AI Assistant API Routes (Public - no auth required)
  app.get('/api/ai/knowledge-topics', async (req, res) => {
    try {
      const topics = [
        { id: 'claims', name: 'Claims Processing', description: 'Help with filing and tracking claims' },
        { id: 'policies', name: 'Policy Information', description: 'Coverage details and policy terms' },
        { id: 'quotes', name: 'Quote Questions', description: 'Pricing and coverage options' },
        { id: 'technical', name: 'Technical Support', description: 'Platform and technical issues' },
        { id: 'billing', name: 'Billing & Payments', description: 'Payment processing and billing questions' }
      ];
      res.json(topics);
    } catch (error) {
      console.error('Error fetching knowledge topics:', error);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, context, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Create context-aware system prompt
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

      // Add context-specific guidance
      if (context.type === 'claims') {
        systemPrompt += '\n\nFocus on claims-related guidance: filing process, required documentation, timelines, and status updates.';
      } else if (context.type === 'quotes') {
        systemPrompt += '\n\nFocus on quote-related help: pricing factors, coverage options, eligibility requirements, and terms.';
      } else if (context.type === 'policy') {
        systemPrompt += '\n\nFocus on policy information: coverage details, exclusions, terms, and conditions.';
      } else if (context.type === 'technical') {
        systemPrompt += '\n\nFocus on technical support: platform navigation, account issues, and troubleshooting.';
      }

      // In production, this would call OpenAI API
      // For now, provide contextual responses based on the type
      let response = '';
      
      if (context.type === 'claims') {
        if (message.toLowerCase().includes('file a claim') || message.toLowerCase().includes('claim process')) {
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

• Filing a new claim
• Checking claim status
• Understanding coverage
• Required documentation
• Claim timelines and process

What specific claims question can I help you with?`;
        }
      } else if (context.type === 'quotes') {
        if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
          response = `Quote pricing is based on several factors:

**For Vehicle Protection:**
• Vehicle age, make, model, and mileage
• Coverage level selected (Platinum, Gold, Silver)
• Term length (12-60 months)
• Geographic location
• Deductible amount

**For Home Protection:**
• Home age and square footage
• Coverage options selected
• Local service costs
• Plan duration

**Factors that can reduce cost:**
• Newer vehicles with lower mileage
• Shorter coverage terms
• Higher deductible amounts
• Bundle discounts

To get an accurate quote, I recommend using our quote generator with your specific details. Would you like help understanding any particular coverage option?`;
        } else {
          response = `I can help explain quotes and pricing. Common questions include:

• How pricing is calculated
• Coverage level differences
• Available terms and options
• Eligibility requirements
• Discount opportunities

What would you like to know about quotes or pricing?`;
        }
      } else if (context.type === 'policy') {
        response = `I can help you understand policy coverage and terms. Our main products include:

**Vehicle Protection Plans:**
• Comprehensive mechanical breakdown coverage
• Deductible reimbursement options
• Emergency services (towing, rental car)
• Multiple coverage levels available

**Home Protection Plans:**
• Major appliance coverage
• HVAC system protection
• Plumbing and electrical coverage
• 24/7 emergency service

**Key Policy Features:**
• Nationwide coverage and service network
• Professional claims handling
• Flexible payment options
• Transferable coverage (vehicle plans)

What specific aspect of your policy would you like me to explain?`;
      } else if (context.type === 'technical') {
        response = `I can help with platform and technical issues:

**Common Solutions:**
• **Login Problems**: Try resetting your password or clearing browser cache
• **Quote Issues**: Ensure VIN is entered correctly (17 characters)
• **Payment Problems**: Check card details and billing address
• **Document Upload**: Use supported formats (PDF, JPG, PNG) under 10MB

**Account Help:**
• Access your dashboard to view policies and claims
• Update contact information in account settings
• Download policy documents and proof of coverage

**Browser Requirements:**
• Use updated Chrome, Firefox, Safari, or Edge
• Enable JavaScript and cookies
• Disable ad blockers for full functionality

What specific technical issue are you experiencing?`;
      } else {
        response = `Hello! I'm here to help with any questions about your insurance coverage, claims, quotes, or our platform.

**I can assist with:**
• Filing and tracking claims
• Understanding coverage options
• Quote pricing and eligibility
• Policy terms and conditions
• Platform navigation and technical support
• Billing and payment questions

**Popular topics:**
• "How do I file a claim?"
• "What does my policy cover?"
• "Why is my quote this price?"
• "How do I update my account?"

How can I help you today?`;
      }

      res.json({
        message: response,
        context: context.type,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  app.post('/api/ai/feedback', async (req, res) => {
    try {
      const { messageId, helpful } = req.body;
      
      // In production, this would store feedback in database for AI model improvement
      console.log(`AI Feedback - Message: ${messageId}, Helpful: ${helpful}`);
      
      res.json({ 
        success: true, 
        message: 'Feedback recorded successfully' 
      });
    } catch (error) {
      console.error('Error recording AI feedback:', error);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  // Advanced Claims Management API Routes
  app.get('/api/claims/advanced', async (req, res) => {
    try {
      const { status, type, search } = req.query;
      
      // Mock advanced claims data with AI analysis
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

      // Apply filters
      if (status && status !== 'all') {
        filteredClaims = filteredClaims.filter(claim => claim.status === status);
      }
      if (type && type !== 'all') {
        filteredClaims = filteredClaims.filter(claim => claim.claimType === type);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredClaims = filteredClaims.filter(claim => 
          claim.claimNumber.toLowerCase().includes(searchLower) ||
          claim.customerName.toLowerCase().includes(searchLower) ||
          claim.policyNumber.toLowerCase().includes(searchLower)
        );
      }

      res.json(filteredClaims);
    } catch (error) {
      console.error('Error fetching advanced claims:', error);
      res.status(500).json({ error: 'Failed to fetch claims' });
    }
  });

  app.get('/api/claims/statistics', async (req, res) => {
    try {
      // Mock statistics data
      const stats = {
        totalClaims: 1247,
        newThisMonth: 89,
        avgProcessingDays: 7,
        totalPayouts: 2450000,
        fraudRate: 3.2
      };
      res.json(stats);
    } catch (error) {
      console.error('Error fetching claim statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  app.post('/api/claims/:claimId/ai-analysis', async (req, res) => {
    try {
      const { claimId } = req.params;
      
      // Mock AI analysis result
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

      // Simulate AI processing delay
      setTimeout(() => {
        res.json({
          success: true,
          analysis,
          message: 'AI analysis completed successfully'
        });
      }, 2000);

    } catch (error) {
      console.error('Error running AI analysis:', error);
      res.status(500).json({ error: 'Failed to run AI analysis' });
    }
  });

  app.put('/api/claims/:claimId/status', async (req, res) => {
    try {
      const { claimId } = req.params;
      const { status, notes } = req.body;

      // Mock status update
      res.json({
        success: true,
        claimId,
        status,
        notes,
        updatedAt: new Date().toISOString(),
        message: 'Claim status updated successfully'
      });
    } catch (error) {
      console.error('Error updating claim status:', error);
      res.status(500).json({ error: 'Failed to update claim status' });
    }
  });

  app.put('/api/claims/:claimId/adjuster', async (req, res) => {
    try {
      const { claimId } = req.params;
      const adjusterData = req.body;

      // Mock adjuster assignment
      res.json({
        success: true,
        claimId,
        adjuster: adjusterData,
        assignedAt: new Date().toISOString(),
        message: 'Adjuster assigned successfully'
      });
    } catch (error) {
      console.error('Error assigning adjuster:', error);
      res.status(500).json({ error: 'Failed to assign adjuster' });
    }
  });

  // Policy Management API Routes
  app.get('/api/policies/management', async (req, res) => {
    try {
      const { status, product, search } = req.query;
      
      // Mock comprehensive policy data
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
            mileage: 15000
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
            mileage: 25000
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
            mileage: 45000
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

      // Apply filters
      if (status && status !== 'all') {
        filteredPolicies = filteredPolicies.filter(policy => policy.status === status);
      }
      if (product && product !== 'all') {
        filteredPolicies = filteredPolicies.filter(policy => policy.productType === product);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredPolicies = filteredPolicies.filter(policy => 
          policy.policyNumber.toLowerCase().includes(searchLower) ||
          policy.customerName.toLowerCase().includes(searchLower) ||
          policy.customerEmail.toLowerCase().includes(searchLower)
        );
      }

      res.json(filteredPolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
      res.status(500).json({ error: 'Failed to fetch policies' });
    }
  });

  app.get('/api/policies/statistics', async (req, res) => {
    try {
      // Mock policy statistics
      const stats = {
        activePolicies: 2847,
        newThisMonth: 156,
        premiumRevenue: 4250000,
        renewalsDue: 89,
        retentionRate: 87.3
      };
      res.json(stats);
    } catch (error) {
      console.error('Error fetching policy statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  app.post('/api/policies/:policyId/generate-document', async (req, res) => {
    try {
      const { policyId } = req.params;
      const { documentType } = req.body;
      
      // Mock document generation
      const document = {
        id: `doc-${Date.now()}`,
        name: `${documentType} Document`,
        type: documentType,
        url: `/documents/${policyId}-${documentType}.pdf`,
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        document,
        message: `${documentType} document generated successfully`
      });
    } catch (error) {
      console.error('Error generating document:', error);
      res.status(500).json({ error: 'Failed to generate document' });
    }
  });

  app.put('/api/policies/:policyId/status', async (req, res) => {
    try {
      const { policyId } = req.params;
      const { status, reason } = req.body;

      // Mock status update
      res.json({
        success: true,
        policyId,
        status,
        reason,
        updatedAt: new Date().toISOString(),
        message: 'Policy status updated successfully'
      });
    } catch (error) {
      console.error('Error updating policy status:', error);
      res.status(500).json({ error: 'Failed to update policy status' });
    }
  });

  app.post('/api/policies/:policyId/renewal-notice', async (req, res) => {
    try {
      const { policyId } = req.params;
      
      // Mock renewal notice
      res.json({
        success: true,
        policyId,
        sentAt: new Date().toISOString(),
        message: 'Renewal notice sent successfully'
      });
    } catch (error) {
      console.error('Error sending renewal notice:', error);
      res.status(500).json({ error: 'Failed to send renewal notice' });
    }
  });

  // Advanced Analytics API Routes
  app.get('/api/analytics/dashboard', async (req, res) => {
    try {
      const { dateRange } = req.query;
      const days = parseInt(dateRange as string) || 30;
      
      // Mock comprehensive analytics data
      const mockAnalytics = {
        totalRevenue: 4250000,
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
          { name: 'Auto VSC', value: 2125000, fill: '#3B82F6' },
          { name: 'Home Protection', value: 1275000, fill: '#10B981' },
          { name: 'RV Coverage', value: 595000, fill: '#F59E0B' },
          { name: 'Marine', value: 170000, fill: '#EF4444' },
          { name: 'Powersports', value: 85000, fill: '#8B5CF6' }
        ],
        policyTrends: Array.from({ length: 12 }, (_, i) => ({
          date: format(new Date(2024, i), 'MMM'),
          new: Math.floor(Math.random() * 200) + 150,
          renewed: Math.floor(Math.random() * 300) + 200
        })),
        claimsTrends: Array.from({ length: 12 }, (_, i) => ({
          month: format(new Date(2024, i), 'MMM'),
          count: Math.floor(Math.random() * 100) + 50,
          payout: Math.floor(Math.random() * 500000) + 200000
        })),
        retentionCohorts: Array.from({ length: 12 }, (_, i) => ({
          month: `Month ${i + 1}`,
          retention: Math.max(100 - (i * 8) - Math.random() * 10, 60)
        }))
      };

      res.json(mockAnalytics);
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  app.get('/api/analytics/kpi-metrics', async (req, res) => {
    try {
      const { dateRange } = req.query;
      
      // Mock KPI metrics with targets and trends
      const kpiMetrics = [
        {
          id: 'revenue',
          name: 'Total Revenue',
          value: 4250000,
          previousValue: 3890000,
          format: 'currency',
          trend: 'up',
          target: 4500000,
          description: 'Total premium revenue collected'
        },
        {
          id: 'policies',
          name: 'Active Policies',
          value: 2847,
          previousValue: 2654,
          format: 'number',
          trend: 'up',
          target: 3000,
          description: 'Currently active insurance policies'
        },
        {
          id: 'claims_ratio',
          name: 'Loss Ratio',
          value: 68.5,
          previousValue: 72.1,
          format: 'percentage',
          trend: 'down',
          target: 65.0,
          description: 'Claims paid vs premiums collected'
        },
        {
          id: 'retention',
          name: 'Retention Rate',
          value: 89.2,
          previousValue: 87.8,
          format: 'percentage',
          trend: 'up',
          target: 90.0,
          description: 'Customer retention rate'
        },
        {
          id: 'processing_time',
          name: 'Avg Processing Time',
          value: 6.8,
          previousValue: 8.2,
          format: 'number',
          trend: 'down',
          target: 5.0,
          description: 'Average claim processing time in days'
        },
        {
          id: 'profit_margin',
          name: 'Profit Margin',
          value: 15.8,
          previousValue: 14.2,
          format: 'percentage',
          trend: 'up',
          target: 18.0,
          description: 'Net profit margin percentage'
        }
      ];

      res.json(kpiMetrics);
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      res.status(500).json({ error: 'Failed to fetch KPI metrics' });
    }
  });

  app.get('/api/analytics/revenue-trends', async (req, res) => {
    try {
      const { dateRange } = req.query;
      const days = parseInt(dateRange as string) || 30;
      
      // Generate revenue trend data
      const revenueTrends = Array.from({ length: days }, (_, i) => ({
        date: format(subDays(new Date(), days - i), 'MMM dd'),
        revenue: Math.floor(Math.random() * 50000) + 100000,
        policies: Math.floor(Math.random() * 20) + 10,
        claims: Math.floor(Math.random() * 5) + 2
      }));

      res.json(revenueTrends);
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      res.status(500).json({ error: 'Failed to fetch revenue trends' });
    }
  });

  app.get('/api/analytics/policy-breakdown', async (req, res) => {
    try {
      const policyBreakdown = [
        { name: 'Auto VSC', count: 1425, fill: '#3B82F6' },
        { name: 'Home Protection', count: 856, fill: '#10B981' },
        { name: 'RV Coverage', count: 342, fill: '#F59E0B' },
        { name: 'Marine', count: 156, fill: '#EF4444' },
        { name: 'Powersports', count: 68, fill: '#8B5CF6' }
      ];

      res.json(policyBreakdown);
    } catch (error) {
      console.error('Error fetching policy breakdown:', error);
      res.status(500).json({ error: 'Failed to fetch policy breakdown' });
    }
  });

  app.get('/api/analytics/claims-breakdown', async (req, res) => {
    try {
      const claimsBreakdown = [
        { name: 'Engine/Transmission', count: 245, amount: 1250000, fill: '#3B82F6' },
        { name: 'HVAC Systems', count: 189, amount: 890000, fill: '#10B981' },
        { name: 'Electrical', count: 156, amount: 650000, fill: '#F59E0B' },
        { name: 'Suspension', count: 98, amount: 420000, fill: '#EF4444' },
        { name: 'Other', count: 67, amount: 180000, fill: '#8B5CF6' }
      ];

      res.json(claimsBreakdown);
    } catch (error) {
      console.error('Error fetching claims breakdown:', error);
      res.status(500).json({ error: 'Failed to fetch claims breakdown' });
    }
  });

  // Real-Time Communications API Routes
  app.get('/api/communications/conversations', async (req, res) => {
    try {
      const { type, search } = req.query;
      
      // Mock conversations data
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

      // Apply filters
      if (type && type !== 'all') {
        filteredConversations = filteredConversations.filter(conv => conv.type === type);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredConversations = filteredConversations.filter(conv => 
          conv.name.toLowerCase().includes(searchLower) ||
          conv.participants.some(p => p.name.toLowerCase().includes(searchLower))
        );
      }

      res.json(filteredConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.get('/api/communications/messages/:conversationId', async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      // Mock messages data
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
            { emoji: "👍", count: 2, users: ["user-002", "user-003"] },
            { emoji: "🎉", count: 1, users: ["user-002"] }
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
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.get('/api/communications/notifications', async (req, res) => {
    try {
      // Mock notifications data
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
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.post('/api/communications/messages', async (req, res) => {
    try {
      const { conversationId, content, type = 'text' } = req.body;
      
      // Mock message creation
      const newMessage = {
        id: `msg-${Date.now()}`,
        content,
        senderId: "user-current",
        senderName: "You",
        timestamp: new Date().toISOString(),
        type
      };

      res.json({
        success: true,
        message: newMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.put('/api/communications/conversations/:conversationId/read', async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      res.json({
        success: true,
        conversationId,
        markedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  });

  app.put('/api/communications/notifications/:notificationId/read', async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      res.json({
        success: true,
        notificationId,
        markedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  // System Integration Hub API Routes
  app.get('/api/system/status', async (req, res) => {
    try {
      // Mock comprehensive system status data
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
      console.error('Error fetching system status:', error);
      res.status(500).json({ error: 'Failed to fetch system status' });
    }
  });

  app.get('/api/system/integrations', async (req, res) => {
    try {
      // Mock integration data
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
          successRate: 100.0,
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
      console.error('Error fetching integrations:', error);
      res.status(500).json({ error: 'Failed to fetch integrations' });
    }
  });

  app.get('/api/system/workflows', async (req, res) => {
    try {
      // Mock workflow automation data
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
      console.error('Error fetching workflows:', error);
      res.status(500).json({ error: 'Failed to fetch workflows' });
    }
  });

  app.get('/api/system/metrics', async (req, res) => {
    try {
      // Mock performance metrics
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
          threshold: { warning: 500, critical: 1000 }
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
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // System control endpoints
  app.post('/api/system/:systemId/restart', async (req, res) => {
    try {
      const { systemId } = req.params;
      
      // Mock system restart
      res.json({
        success: true,
        systemId,
        action: 'restart',
        timestamp: new Date().toISOString(),
        message: 'System restart initiated successfully'
      });
    } catch (error) {
      console.error('Error restarting system:', error);
      res.status(500).json({ error: 'Failed to restart system' });
    }
  });

  app.post('/api/system/integrations/:integrationId/:action', async (req, res) => {
    try {
      const { integrationId, action } = req.params;
      
      res.json({
        success: true,
        integrationId,
        action,
        timestamp: new Date().toISOString(),
        message: `Integration ${action} completed successfully`
      });
    } catch (error) {
      console.error('Error controlling integration:', error);
      res.status(500).json({ error: 'Failed to control integration' });
    }
  });

  app.post('/api/system/workflows/:workflowId/:action', async (req, res) => {
    try {
      const { workflowId, action } = req.params;
      
      res.json({
        success: true,
        workflowId,
        action,
        timestamp: new Date().toISOString(),
        message: `Workflow ${action} completed successfully`
      });
    } catch (error) {
      console.error('Error controlling workflow:', error);
      res.status(500).json({ error: 'Failed to control workflow' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
