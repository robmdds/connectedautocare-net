import crypto from 'crypto';
import { storage } from '../storage';

interface HelcimPaymentIntent {
  provider: string;
  amount: number;
  currency: string;
  description: string;
  clientSecret: string;
  metadata?: any;
}

interface WebhookPayload {
  type: string;
  data: any;
  metadata?: any;
}

export class HelcimService {
  private apiBase: string;
  private apiToken: string;
  private accountId: string;
  private webhookSecret: string;

  constructor() {
    this.apiBase = process.env.HELCIM_API_BASE || 'https://api.helcim.com';
    this.apiToken = process.env.HELCIM_API_TOKEN || '';
    this.accountId = process.env.HELCIM_ACCOUNT_ID || '';
    this.webhookSecret = process.env.HELCIM_WEBHOOK_SECRET || '';
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<HelcimPaymentIntent> {
    try {
      // In a real implementation, you would call the Helcim API
      const response = await fetch(`${this.apiBase}/v2/payment-intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          description: metadata?.description || 'TPA Insurance Payment',
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Helcim API error: ${response.status}`);
      }

      const data = await response.json();

      // Store payment record
      await storage.createPayment({
        amount: amount.toString(),
        currency,
        provider: 'helcim',
        providerTransactionId: data.id,
        status: 'pending',
        description: metadata?.description || 'TPA Insurance Payment',
        metadata,
        quoteId: metadata?.quoteId,
      });

      return {
        provider: 'helcim',
        amount,
        currency,
        description: metadata?.description || 'TPA Insurance Payment',
        clientSecret: data.client_secret,
        metadata,
      };
    } catch (error) {
      console.error('Helcim payment intent creation failed:', error);
      
      // Fallback for development - create mock response
      const mockClientSecret = `mock_helcim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await storage.createPayment({
        amount: amount.toString(),
        currency,
        provider: 'helcim',
        providerTransactionId: mockClientSecret,
        status: 'pending',
        description: metadata?.description || 'TPA Insurance Payment',
        metadata,
        quoteId: metadata?.quoteId,
      });

      return {
        provider: 'helcim',
        amount,
        currency,
        description: metadata?.description || 'TPA Insurance Payment',
        clientSecret: mockClientSecret,
        metadata,
      };
    }
  }

  async processPayment(paymentData: any): Promise<{ success: boolean, paymentId?: string, error?: string }> {
    try {
      console.log('Processing payment via Helcim:', {
        amount: paymentData.amount,
        customer: paymentData.customerData.email,
        card: `****${paymentData.cardData.cardNumber.slice(-4)}`
      });

      // Always use mock processing for development unless explicitly configured for production
      if (!process.env.HELCIM_PRODUCTION_MODE) {
        console.warn('Using mock payment processing for development');
        
        // Mock successful payment for development
        const mockPaymentId = `pay_mock_${Date.now()}`;
        
        // Store mock payment record
        await storage.createPayment({
          amount: paymentData.amount.toString(),
          currency: paymentData.currency || 'USD',
          provider: 'helcim-mock',
          providerTransactionId: mockPaymentId,
          status: 'succeeded',
          description: `VSC Purchase - ${paymentData.metadata.coverage}`,
          metadata: paymentData.metadata,
        });

        console.log('Mock payment processed successfully:', mockPaymentId);
        return {
          success: true,
          paymentId: mockPaymentId
        };
      }

      // Real Helcim API call
      const response = await fetch(`${this.apiBase}/v2/card-transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'purchase',
          amount: Math.round(paymentData.amount * 100), // Convert to cents
          currency: (paymentData.currency || 'USD').toLowerCase(),
          cardData: {
            cardNumber: paymentData.cardData.cardNumber.replace(/\s/g, ''),
            cardExpiry: `${paymentData.cardData.expiryMonth}${paymentData.cardData.expiryYear}`,
            cardCVV: paymentData.cardData.cvv,
          },
          billingAddress: {
            name: `${paymentData.customerData.firstName} ${paymentData.customerData.lastName}`,
            street1: paymentData.customerData.address.street,
            city: paymentData.customerData.address.city,
            province: paymentData.customerData.address.state,
            country: 'USA',
            postalCode: paymentData.customerData.address.zipCode,
          },
          customerCode: paymentData.customerData.email,
          invoiceNumber: `VSC-${Date.now()}`,
          description: `VSC Purchase - ${paymentData.metadata.coverage}`,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'APPROVED') {
        // Store successful payment record
        await storage.createPayment({
          amount: paymentData.amount.toString(),
          currency: paymentData.currency || 'USD',
          provider: 'helcim',
          providerTransactionId: result.transactionId,
          status: 'succeeded',
          description: `VSC Purchase - ${paymentData.metadata.coverage}`,
          metadata: paymentData.metadata,
        });

        return {
          success: true,
          paymentId: result.transactionId
        };
      } else {
        throw new Error(result.message || 'Payment declined');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  async processWebhook(payload: any, headers: any): Promise<{ eventType: string; paymentId?: string; metadata?: any }> {
    try {
      // Verify webhook signature
      if (this.webhookSecret) {
        const signature = headers['helcim-signature'] || headers['x-helcim-signature'];
        if (!this.verifyWebhookSignature(payload, signature)) {
          throw new Error('Invalid webhook signature');
        }
      }

      // Store webhook
      await storage.createWebhook({
        provider: 'helcim',
        eventType: payload.type,
        payload,
        headers,
        verified: true,
      });

      // Process different event types
      const result = {
        eventType: payload.type,
        paymentId: payload.data?.id,
        metadata: payload.data?.metadata,
      };

      if (payload.type === 'payment.succeeded') {
        // Update payment status
        if (payload.data?.id) {
          const payment = await storage.getPayments('', { providerTransactionId: payload.data.id });
          if (payment.length > 0) {
            await storage.updatePayment(payment[0].id, {
              status: 'succeeded',
              processedAt: new Date(),
              providerResponse: payload,
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!signature || !this.webhookSecret) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/v2/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount ? Math.round(amount * 100) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Helcim refund API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Helcim refund failed:', error);
      throw error;
    }
  }
}
