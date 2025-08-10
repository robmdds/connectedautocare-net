import { storage } from "../storage";
import { type InsertPolicy } from "@shared/schema";

export class PolicyService {
  async issuePolicy(policyData: InsertPolicy & { issuedBy: string }): Promise<any> {
    try {
      // Generate policy number
      const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Set policy dates
      const effectiveDate = policyData.effectiveDate || new Date();
      const expiryDate = policyData.expiryDate || new Date(effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

      // Create policy
      const policy = await storage.createPolicy({
        ...policyData,
        policyNumber,
        effectiveDate,
        expiryDate,
        status: 'active',
        issuedBy: policyData.issuedBy,
        issuedAt: new Date()
      });

      // Generate policy documents (placeholder for actual document generation)
      await this.generatePolicyDocuments(policy);

      return policy;
    } catch (error) {
      console.error('Policy issuance error:', error);
      throw new Error('Failed to issue policy');
    }
  }

  async processPaymentConfirmation(paymentId: string): Promise<any> {
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

      // Issue policy automatically
      const policy = await this.issuePolicy({
        tenantId: quote.tenantId!,
        quoteId: quote.id,
        customerId: quote.customerId!,
        productId: quote.productId!,
        vehicleId: quote.vehicleId,
        coverageOptions: quote.coverageOptions,
        premium: quote.totalPremium,
        issuedBy: 'system'
      });

      // Update payment with policy ID
      await storage.updatePayment(paymentId, { policyId: policy.id });

      return policy;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw new Error('Failed to process payment confirmation');
    }
  }

  private async generatePolicyDocuments(policy: any): Promise<void> {
    // Placeholder for document generation
    // In a real implementation, this would:
    // 1. Generate policy declarations page
    // 2. Generate terms and conditions
    // 3. Generate insurance cards
    // 4. Store documents in the document system
    console.log(`Generated documents for policy ${policy.policyNumber}`);
  }

  async renewPolicy(policyId: string): Promise<any> {
    try {
      const existingPolicy = await storage.getPolicy(policyId);
      if (!existingPolicy) {
        throw new Error('Policy not found');
      }

      // Create renewal policy
      const renewalPolicy = await this.issuePolicy({
        tenantId: existingPolicy.tenantId!,
        customerId: existingPolicy.customerId!,
        productId: existingPolicy.productId!,
        vehicleId: existingPolicy.vehicleId,
        coverageOptions: existingPolicy.coverageOptions,
        premium: existingPolicy.premium,
        effectiveDate: existingPolicy.expiryDate,
        issuedBy: 'system'
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
        cancellationReason: reason
      });

      // Calculate refund amount (placeholder logic)
      const refundAmount = this.calculateCancellationRefund(policy);

      return {
        policy,
        refundAmount,
        message: 'Policy cancelled successfully'
      };
    } catch (error) {
      console.error('Policy cancellation error:', error);
      throw new Error('Failed to cancel policy');
    }
  }

  private calculateCancellationRefund(policy: any): number {
    // Simple pro-rata refund calculation
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
}