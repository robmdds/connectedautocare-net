import { storage } from '../storage';
import type { InsertPolicy, Policy, Quote } from '@shared/schema';

export class PolicyService {
  async issuePolicy(policyData: InsertPolicy): Promise<Policy> {
    try {
      // Generate policy number
      const policyNumber = this.generatePolicyNumber();
      
      const policy = await storage.createPolicy({
        ...policyData,
        policyNumber,
        status: 'issued',
      });

      // Generate policy documents
      await this.generatePolicyDocuments(policy);

      // Track analytics
      await storage.createAnalyticsEvent({
        tenantId: policy.tenantId!,
        eventType: 'policy_issued',
        entityType: 'policy',
        entityId: policy.id,
        properties: {
          policyNumber,
          premium: parseFloat(policy.premium),
        },
      });

      return policy;
    } catch (error) {
      console.error('Policy issuance error:', error);
      throw error;
    }
  }

  async issueFromQuote(quoteId: string, paymentData: { paymentId: string; paymentMethod: string }): Promise<Policy> {
    try {
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }

      if (quote.status !== 'approved') {
        throw new Error('Quote must be approved before issuing policy');
      }

      // Create policy from quote
      const effectiveDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year policy

      const policy = await this.issuePolicy({
        tenantId: quote.tenantId!,
        quoteId: quote.id,
        productId: quote.productId!,
        vehicleId: quote.vehicleId!,
        customerEmail: quote.customerEmail!,
        customerName: quote.customerName!,
        customerPhone: quote.customerPhone,
        customerAddress: quote.customerAddress!,
        coverageDetails: quote.coverageSelections,
        premium: quote.totalPremium,
        effectiveDate,
        expiryDate,
        paymentMethod: paymentData.paymentMethod,
        resellerId: quote.resellerId,
      });

      // Update quote status
      await storage.updateQuote(quoteId, { status: 'converted' });

      return policy;
    } catch (error) {
      console.error('Policy issuance from quote error:', error);
      throw error;
    }
  }

  async renewPolicy(policyId: string): Promise<Policy> {
    try {
      const currentPolicy = await storage.getPolicy(policyId);
      if (!currentPolicy) {
        throw new Error('Policy not found');
      }

      if (currentPolicy.status !== 'active') {
        throw new Error('Only active policies can be renewed');
      }

      // Create renewal policy
      const effectiveDate = currentPolicy.expiryDate!;
      const expiryDate = new Date(effectiveDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const renewalPolicy = await this.issuePolicy({
        tenantId: currentPolicy.tenantId!,
        productId: currentPolicy.productId!,
        vehicleId: currentPolicy.vehicleId!,
        customerEmail: currentPolicy.customerEmail,
        customerName: currentPolicy.customerName,
        customerPhone: currentPolicy.customerPhone,
        customerAddress: currentPolicy.customerAddress,
        coverageDetails: currentPolicy.coverageDetails,
        premium: currentPolicy.premium,
        effectiveDate,
        expiryDate,
        paymentMethod: currentPolicy.paymentMethod,
        resellerId: currentPolicy.resellerId,
      });

      // Update current policy status
      await storage.updatePolicy(policyId, { status: 'expired' });

      return renewalPolicy;
    } catch (error) {
      console.error('Policy renewal error:', error);
      throw error;
    }
  }

  async cancelPolicy(policyId: string, reason: string, effectiveDate?: Date): Promise<Policy> {
    try {
      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      const cancellationDate = effectiveDate || new Date();
      
      const updatedPolicy = await storage.updatePolicy(policyId, {
        status: 'cancelled',
        // Add cancellation details to metadata if needed
      });

      // Track cancellation event
      await storage.createAnalyticsEvent({
        tenantId: policy.tenantId!,
        eventType: 'policy_cancelled',
        entityType: 'policy',
        entityId: policyId,
        properties: {
          reason,
          cancellationDate: cancellationDate.toISOString(),
        },
      });

      return updatedPolicy;
    } catch (error) {
      console.error('Policy cancellation error:', error);
      throw error;
    }
  }

  private generatePolicyNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `POL-${timestamp}-${random}`;
  }

  private async generatePolicyDocuments(policy: Policy): Promise<void> {
    try {
      // Generate policy contract
      await this.generatePolicyContract(policy);
      
      // Generate disclosure documents
      await this.generateDisclosures(policy);
      
      // Generate ID cards
      await this.generateIDCards(policy);
      
      // Mark documents as generated
      await storage.updatePolicy(policy.id, { documentsGenerated: true });
    } catch (error) {
      console.error('Document generation error:', error);
      // Don't fail policy issuance if document generation fails
    }
  }

  private async generatePolicyContract(policy: Policy): Promise<void> {
    // Generate policy contract document
    const contractData = {
      policyNumber: policy.policyNumber,
      customerName: policy.customerName,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
      coverageDetails: policy.coverageDetails,
      premium: policy.premium,
    };

    // In a real implementation, you would use a document generation service
    // For now, store the document metadata
    await storage.createDocument({
      tenantId: policy.tenantId!,
      policyId: policy.id,
      type: 'policy_contract',
      name: `Policy Contract - ${policy.policyNumber}`,
      filename: `policy_contract_${policy.policyNumber}.pdf`,
      mimeType: 'application/pdf',
      storageUrl: `/documents/policies/${policy.id}/contract.pdf`,
      generatedBy: 'system',
      metadata: contractData,
    });
  }

  private async generateDisclosures(policy: Policy): Promise<void> {
    // Generate required disclosure documents
    await storage.createDocument({
      tenantId: policy.tenantId!,
      policyId: policy.id,
      type: 'disclosure',
      name: `Disclosures - ${policy.policyNumber}`,
      filename: `disclosures_${policy.policyNumber}.pdf`,
      mimeType: 'application/pdf',
      storageUrl: `/documents/policies/${policy.id}/disclosures.pdf`,
      generatedBy: 'system',
    });
  }

  private async generateIDCards(policy: Policy): Promise<void> {
    // Generate insurance ID cards
    await storage.createDocument({
      tenantId: policy.tenantId!,
      policyId: policy.id,
      type: 'id_card',
      name: `Insurance ID Card - ${policy.policyNumber}`,
      filename: `id_card_${policy.policyNumber}.pdf`,
      mimeType: 'application/pdf',
      storageUrl: `/documents/policies/${policy.id}/id_card.pdf`,
      generatedBy: 'system',
    });
  }

  async checkRenewalEligibility(policyId: string): Promise<{ eligible: boolean; reasons?: string[] }> {
    try {
      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return { eligible: false, reasons: ['Policy not found'] };
      }

      const reasons: string[] = [];

      if (policy.status !== 'active') {
        reasons.push('Policy is not active');
      }

      if (policy.expiryDate && new Date(policy.expiryDate) < new Date()) {
        reasons.push('Policy has already expired');
      }

      // Check for outstanding claims
      const claims = await storage.getClaims(policy.tenantId!, { policyId, status: 'open' });
      if (claims.length > 0) {
        reasons.push('Policy has open claims');
      }

      return {
        eligible: reasons.length === 0,
        reasons: reasons.length > 0 ? reasons : undefined,
      };
    } catch (error) {
      console.error('Renewal eligibility check error:', error);
      return { eligible: false, reasons: ['Error checking eligibility'] };
    }
  }
}
