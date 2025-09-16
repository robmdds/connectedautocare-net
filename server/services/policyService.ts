import { storage } from "../storage";
import { InsertPolicy, Policy } from "@shared/schema";

export class PolicyService {
  async issuePolicy(policyData: InsertPolicy & { issuedBy: string }): Promise<Policy> {
    try {
      // Validate required fields
      if (!policyData.customerAddress || typeof policyData.customerAddress !== 'object') {
        throw new Error('Customer address is required and must be an object');
      }
      const { street, city, state, zip } = policyData.customerAddress;
      if (!street || !city || !state || !zip) {
        throw new Error('Customer address must include street, city, state, and zip');
      }

      // Generate policy number
      const policyNumber = policyData.policyNumber || `POL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Set policy dates
      const effectiveDate = policyData.effectiveDate || new Date();
      const expiryDate = policyData.expiryDate || new Date(effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      // Ensure coverage_details is provided
      const coverageDetails = policyData.coverageDetails || {};

      // Create policy
      const policy = await storage.createPolicy({
        ...policyData,
        policyNumber,
        effectiveDate,
        expiryDate,
        coverageDetails,
        status: 'active',
        issuedBy: policyData.issuedBy,
        issuedAt: new Date(),
      });

      // Generate policy documents
      await this.generatePolicyDocuments(policy);

      return policy;
    } catch (error) {
      console.error('Policy issuance error:', error);
      throw new Error('Failed to issue policy');
    }
  }

  async processPaymentConfirmation(paymentId: string): Promise<Policy> {
    try {
      // Get payment details
      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Get quote to convert to policy
      const quote = await storage.getQuote(payment.quoteId!);
      if (!quote) {
        throw new Error('Quote not found');
      }

      // Validate or provide default customer_address
      const customerAddress = quote.customerAddress || {
        street: "",
        city: "",
        state: "",
        zip: "",
      };
      if (!customerAddress.street || !customerAddress.city || !customerAddress.state || !customerAddress.zip) {
        throw new Error('Customer address must include street, city, state, and zip');
      }

      // Issue policy automatically
      const policy = await this.issuePolicy({
        tenantId: quote.tenantId!,
        quoteId: quote.id,
        customerName: quote.customerName!,
        customerEmail: quote.customerEmail!,
        customerPhone: quote.customerPhone,
        customerAddress,
        coverageDetails: quote.coverageSelections || {},
        productId: quote.productId!,
        vehicleId: quote.vehicleId,
        premium: quote.totalPremium,
        issuedBy: 'system',
        effectiveDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      // Update payment with policy ID
      await storage.updatePayment(paymentId, { policyId: policy.id });

      return policy;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw new Error('Failed to process payment confirmation');
    }
  }

  async updatePolicy(id: string, policyData: Partial<InsertPolicy>): Promise<Policy> {
    try {
      // Check if policy exists
      const existingPolicy = await storage.getPolicy(id);
      if (!existingPolicy) {
        throw new Error('Policy not found');
      }

      // Validate customer_address if provided
      if (policyData.customerAddress && typeof policyData.customerAddress === 'object') {
        const { street, city, state, zip } = policyData.customerAddress;
        if (!street || !city || !state || !zip) {
          throw new Error('Customer address must include street, city, state, and zip');
        }
      }

      // Prepare update payload
      const updatedPolicy = await storage.updatePolicy(id, {
        ...policyData,
        customerAddress: policyData.customerAddress || existingPolicy.customerAddress,
        coverageDetails: policyData.coverageDetails || existingPolicy.coverageDetails,
        updatedAt: new Date(),
      });

      // Regenerate documents if necessary
      if (
        policyData.coverageDetails ||
        policyData.effectiveDate ||
        policyData.expiryDate ||
        policyData.premium ||
        policyData.customerAddress
      ) {
        await this.generatePolicyDocuments(updatedPolicy);
      }

      return updatedPolicy;
    } catch (error) {
      console.error('Policy update error:', error);
      throw new Error('Failed to update policy');
    }
  }

  private async generatePolicyDocuments(policy: Policy): Promise<void> {
    console.log(`Generated documents for policy ${policy.policyNumber}`);
  }

  async renewPolicy(policyId: string): Promise<Policy> {
    try {
      const existingPolicy = await storage.getPolicy(policyId);
      if (!existingPolicy) {
        throw new Error('Policy not found');
      }

      // Create renewal policy
      const renewalPolicy = await this.issuePolicy({
        tenantId: existingPolicy.tenantId!,
        customerName: existingPolicy.customerName,
        customerEmail: existingPolicy.customerEmail,
        customerPhone: existingPolicy.customerPhone,
        customerAddress: existingPolicy.customerAddress,
        coverageDetails: existingPolicy.coverageDetails,
        productId: existingPolicy.productId,
        vehicleId: existingPolicy.vehicleId,
        premium: existingPolicy.premium,
        effectiveDate: existingPolicy.expiryDate,
        issuedBy: 'system',
      });

      // Update original policy status
      await storage.updatePolicy(policyId, { status: 'renewed' });

      return renewalPolicy;
    } catch (error) {
      console.error('Policy renewal error:', error);
      throw new Error('Failed to renew policy');
    }
  }

  async cancelPolicy(policyId: string, reason: string, cancelledBy: string): Promise<any> {
    try {
      const policy = await storage.updatePolicy(policyId, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
      });

      // Calculate refund amount
      const refundAmount = this.calculateCancellationRefund(policy);

      return {
        policy,
        refundAmount,
        message: 'Policy cancelled successfully',
      };
    } catch (error) {
      console.error('Policy cancellation error:', error);
      throw new Error('Failed to cancel policy');
    }
  }

  private calculateCancellationRefund(policy: Policy): number {
    const now = new Date();
    const effectiveDate = new Date(policy.effectiveDate);
    const expiryDate = new Date(policy.expiryDate);
    
    const totalDays = (expiryDate.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24);
    const usedDays = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24);
    const remainingDays = Math.max(0, totalDays - usedDays);
    
    const refundPercentage = remainingDays / totalDays;
    const premium = parseFloat(policy.premium);
    
    return Math.round(premium * refundPercentage * 100) / 100;
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    return storage.getPolicy(id);
  }

  async getPolicyByNumber(policyNumber: string): Promise<Policy | undefined> {
    return storage.getPolicyByNumber(policyNumber);
  }

  async getPolicies(tenantId: string, filters?: any): Promise<Policy[]> {
    return storage.getPolicies(tenantId, filters);
  }
}