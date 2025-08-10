import { storage } from "../storage";
import { type InsertClaim } from "@shared/schema";

export class ClaimsService {
  async createClaim(claimData: InsertClaim): Promise<any> {
    try {
      // Generate claim number
      const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Create claim with initial status
      const claim = await storage.createClaim({
        ...claimData,
        claimNumber,
        status: 'submitted',
        submittedAt: new Date()
      });

      // Auto-assign adjuster (placeholder logic)
      await this.autoAssignAdjuster(claim.id);

      return claim;
    } catch (error) {
      console.error('Claim creation error:', error);
      throw new Error('Failed to create claim');
    }
  }

  async processClaim(claimId: string, action: string, notes?: string, adjusterId?: string): Promise<any> {
    try {
      const updates: any = {
        lastUpdated: new Date()
      };

      switch (action) {
        case 'review':
          updates.status = 'under_review';
          break;
        case 'approve':
          updates.status = 'approved';
          updates.approvedAt = new Date();
          break;
        case 'deny':
          updates.status = 'denied';
          updates.deniedAt = new Date();
          break;
        case 'settle':
          updates.status = 'settled';
          updates.settledAt = new Date();
          break;
        case 'close':
          updates.status = 'closed';
          updates.closedAt = new Date();
          break;
      }

      if (adjusterId) {
        updates.adjusterId = adjusterId;
      }

      if (notes) {
        updates.adjustmentNotes = notes;
      }

      const claim = await storage.updateClaim(claimId, updates);

      // Track analytics event
      await storage.createAnalyticsEvent({
        tenantId: claim.tenantId!,
        eventType: 'claim_updated',
        entityType: 'claim',
        entityId: claimId,
        properties: {
          action,
          status: updates.status,
          adjusterId
        }
      });

      return claim;
    } catch (error) {
      console.error('Claim processing error:', error);
      throw new Error('Failed to process claim');
    }
  }

  async estimateDamage(claimId: string, photos?: string[]): Promise<any> {
    try {
      // Placeholder for AI-powered damage estimation
      // In a real implementation, this would use computer vision
      // to analyze damage photos and estimate repair costs
      
      const estimatedAmount = Math.floor(Math.random() * 10000) + 1000; // Random estimate for demo
      
      await storage.updateClaim(claimId, {
        estimatedAmount: estimatedAmount.toString(),
        lastUpdated: new Date()
      });

      return {
        claimId,
        estimatedAmount,
        confidence: 0.85,
        method: 'AI Analysis',
        photos: photos || []
      };
    } catch (error) {
      console.error('Damage estimation error:', error);
      throw new Error('Failed to estimate damage');
    }
  }

  async detectFraud(claimId: string): Promise<any> {
    try {
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      // Placeholder fraud detection logic
      // In a real implementation, this would use ML models to analyze:
      // - Claim patterns
      // - Customer history
      // - Damage photos
      // - Location data
      // - Time patterns
      
      const riskFactors = [];
      let riskScore = 0;

      // Example risk factors
      if (claim.incidentDate) {
        const incidentDate = new Date(claim.incidentDate);
        const hourOfDay = incidentDate.getHours();
        
        // Higher risk for incidents at unusual hours
        if (hourOfDay < 6 || hourOfDay > 22) {
          riskFactors.push('Incident occurred at unusual hour');
          riskScore += 0.2;
        }
      }

      // Check for high claim amount
      if (claim.estimatedAmount && parseFloat(claim.estimatedAmount) > 5000) {
        riskFactors.push('High claim amount');
        riskScore += 0.3;
      }

      // Determine risk level
      let riskLevel = 'low';
      if (riskScore > 0.7) {
        riskLevel = 'high';
      } else if (riskScore > 0.4) {
        riskLevel = 'medium';
      }

      return {
        claimId,
        riskScore,
        riskLevel,
        riskFactors,
        recommendedAction: riskLevel === 'high' ? 'Manual review required' : 'Standard processing'
      };
    } catch (error) {
      console.error('Fraud detection error:', error);
      throw new Error('Failed to detect fraud');
    }
  }

  private async autoAssignAdjuster(claimId: string): Promise<void> {
    try {
      // Placeholder for adjuster assignment logic
      // In a real implementation, this would:
      // 1. Check adjuster workloads
      // 2. Match by specialty/location
      // 3. Consider availability
      
      // For demo, just log the assignment
      console.log(`Auto-assigned adjuster to claim ${claimId}`);
    } catch (error) {
      console.error('Adjuster assignment error:', error);
    }
  }

  async generateClaimReport(claimId: string): Promise<any> {
    try {
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      // Generate comprehensive claim report
      const report = {
        claimNumber: claim.claimNumber,
        status: claim.status,
        submittedAt: claim.submittedAt,
        incidentDate: claim.incidentDate,
        description: claim.description,
        estimatedAmount: claim.estimatedAmount,
        adjustmentNotes: claim.adjustmentNotes,
        timeline: await this.getClaimTimeline(claimId),
        documents: await storage.getDocuments('claim', claimId)
      };

      return report;
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate claim report');
    }
  }

  private async getClaimTimeline(claimId: string): Promise<any[]> {
    // Placeholder for claim timeline generation
    return [
      { date: new Date(), action: 'Claim submitted', status: 'submitted' },
      { date: new Date(), action: 'Under review', status: 'under_review' }
    ];
  }
}