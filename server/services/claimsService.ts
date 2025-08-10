import { storage } from '../storage';
import { AIAssistantService } from './aiAssistantService';
import type { InsertClaim, Claim } from '@shared/schema';

export class ClaimsService {
  private aiAssistant: AIAssistantService;

  constructor() {
    this.aiAssistant = new AIAssistantService();
  }

  async createClaim(claimData: InsertClaim): Promise<Claim> {
    try {
      // Generate claim number
      const claimNumber = this.generateClaimNumber();
      
      // Initialize FNOL data
      const fnolData = {
        reportedAt: new Date().toISOString(),
        reportingMethod: 'online',
        initialReport: claimData.description,
      };

      // Create initial audit trail entry
      const auditTrail = [{
        timestamp: new Date().toISOString(),
        action: 'claim_created',
        performedBy: 'system',
        details: 'Claim created via FNOL',
      }];

      const claim = await storage.createClaim({
        ...claimData,
        claimNumber,
        fnolData,
        auditTrail,
      });

      // Auto-assign adjuster if available
      await this.autoAssignAdjuster(claim);

      // Get AI analysis of the claim
      const aiAnalysis = await this.aiAssistant.analyzeClaim(claim);
      
      // Add AI analysis to notes
      await this.addClaimNote(claim.id, {
        type: 'ai_analysis',
        content: aiAnalysis,
        createdBy: 'ai_assistant',
        createdAt: new Date().toISOString(),
      });

      // Track analytics
      await storage.createAnalyticsEvent({
        tenantId: claimData.policyId ? undefined : 'unknown', // Would need to get from policy
        eventType: 'claim_created',
        entityType: 'claim',
        entityId: claim.id,
        properties: {
          claimNumber,
          type: claim.type,
          estimatedAmount: parseFloat(claim.estimatedAmount || '0'),
        },
      });

      return claim;
    } catch (error) {
      console.error('Claim creation error:', error);
      throw error;
    }
  }

  async updateClaim(claimId: string, updateData: Partial<InsertClaim>, updatedBy: string): Promise<Claim> {
    try {
      const currentClaim = await storage.getClaim(claimId);
      if (!currentClaim) {
        throw new Error('Claim not found');
      }

      // Create audit trail entry
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action: 'claim_updated',
        performedBy: updatedBy,
        details: `Updated: ${Object.keys(updateData).join(', ')}`,
        changes: updateData,
      };

      // Update audit trail
      const currentAuditTrail = (currentClaim.auditTrail as any[]) || [];
      const updatedAuditTrail = [...currentAuditTrail, auditEntry];

      const updatedClaim = await storage.updateClaim(claimId, {
        ...updateData,
        auditTrail: updatedAuditTrail,
      });

      // Handle status changes
      if (updateData.status && updateData.status !== currentClaim.status) {
        await this.handleStatusChange(updatedClaim, currentClaim.status!, updateData.status, updatedBy);
      }

      return updatedClaim;
    } catch (error) {
      console.error('Claim update error:', error);
      throw error;
    }
  }

  async assignAdjuster(claimId: string, adjusterId: string, assignedBy: string): Promise<Claim> {
    try {
      const claim = await storage.updateClaim(claimId, {
        adjusterId,
        assignedAt: new Date(),
      });

      // Add audit trail entry
      await this.addAuditEntry(claimId, {
        action: 'adjuster_assigned',
        performedBy: assignedBy,
        details: `Assigned to adjuster ID: ${adjusterId}`,
      });

      // Notify adjuster (in a real system, you'd send an email/notification)
      console.log(`Claim ${claim.claimNumber} assigned to adjuster ${adjusterId}`);

      return claim;
    } catch (error) {
      console.error('Adjuster assignment error:', error);
      throw error;
    }
  }

  async addClaimNote(claimId: string, note: any): Promise<void> {
    try {
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      const currentNotes = (claim.notes as any[]) || [];
      const updatedNotes = [...currentNotes, {
        ...note,
        id: `note_${Date.now()}`,
        createdAt: note.createdAt || new Date().toISOString(),
      }];

      await storage.updateClaim(claimId, { notes: updatedNotes });
    } catch (error) {
      console.error('Add claim note error:', error);
      throw error;
    }
  }

  async uploadClaimDocument(claimId: string, document: any): Promise<void> {
    try {
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      // Create document record
      await storage.createDocument({
        tenantId: 'unknown', // Would get from claim/policy relation
        claimId,
        type: 'claim_document',
        name: document.name,
        filename: document.filename,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        storageUrl: document.storageUrl,
        uploadedBy: document.uploadedBy,
        metadata: document.metadata,
      });

      // Update claim documents array
      const currentDocuments = (claim.documents as any[]) || [];
      const updatedDocuments = [...currentDocuments, {
        id: `doc_${Date.now()}`,
        name: document.name,
        url: document.storageUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: document.uploadedBy,
      }];

      await storage.updateClaim(claimId, { documents: updatedDocuments });

      // Add audit entry
      await this.addAuditEntry(claimId, {
        action: 'document_uploaded',
        performedBy: document.uploadedBy,
        details: `Document uploaded: ${document.name}`,
      });
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  async approveClaimPayout(claimId: string, amount: number, approvedBy: string): Promise<Claim> {
    try {
      const claim = await storage.updateClaim(claimId, {
        status: 'approved',
        approvedAmount: amount.toString(),
      });

      await this.addAuditEntry(claimId, {
        action: 'claim_approved',
        performedBy: approvedBy,
        details: `Claim approved for payout: $${amount}`,
      });

      // Track analytics
      await storage.createAnalyticsEvent({
        tenantId: 'unknown', // Would get from policy relation
        eventType: 'claim_approved',
        entityType: 'claim',
        entityId: claimId,
        properties: {
          approvedAmount: amount,
          approvedBy,
        },
      });

      return claim;
    } catch (error) {
      console.error('Claim approval error:', error);
      throw error;
    }
  }

  async processClaimPayout(claimId: string, payoutAmount: number, processedBy: string): Promise<Claim> {
    try {
      const claim = await storage.updateClaim(claimId, {
        status: 'payout',
        payoutAmount: payoutAmount.toString(),
      });

      await this.addAuditEntry(claimId, {
        action: 'payout_processed',
        performedBy: processedBy,
        details: `Payout processed: $${payoutAmount}`,
      });

      return claim;
    } catch (error) {
      console.error('Payout processing error:', error);
      throw error;
    }
  }

  async closeClaim(claimId: string, closedBy: string, reason?: string): Promise<Claim> {
    try {
      const claim = await storage.updateClaim(claimId, {
        status: 'closed',
        closedAt: new Date(),
      });

      await this.addAuditEntry(claimId, {
        action: 'claim_closed',
        performedBy: closedBy,
        details: reason || 'Claim closed',
      });

      return claim;
    } catch (error) {
      console.error('Claim closure error:', error);
      throw error;
    }
  }

  private generateClaimNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `CLM-${timestamp}-${random}`;
  }

  private async autoAssignAdjuster(claim: Claim): Promise<void> {
    try {
      // Simple auto-assignment logic - in reality, this would be more sophisticated
      // based on workload, expertise, location, etc.
      
      // For now, just find available adjusters (this would query user table for adjusters)
      // This is a simplified implementation
      console.log(`Auto-assigning claim ${claim.claimNumber} to available adjuster`);
      
      // In a real system, you'd implement proper adjuster assignment logic here
    } catch (error) {
      console.error('Auto-assignment error:', error);
      // Don't fail claim creation if auto-assignment fails
    }
  }

  private async handleStatusChange(claim: Claim, oldStatus: string, newStatus: string, updatedBy: string): Promise<void> {
    try {
      // Handle specific status transitions
      switch (newStatus) {
        case 'review':
          await this.onClaimUnderReview(claim, updatedBy);
          break;
        case 'decision':
          await this.onClaimDecision(claim, updatedBy);
          break;
        case 'approved':
          await this.onClaimApproved(claim, updatedBy);
          break;
        case 'denied':
          await this.onClaimDenied(claim, updatedBy);
          break;
        case 'closed':
          await this.onClaimClosed(claim, updatedBy);
          break;
      }

      // Track status change analytics
      await storage.createAnalyticsEvent({
        tenantId: 'unknown', // Would get from policy relation
        eventType: 'claim_status_changed',
        entityType: 'claim',
        entityId: claim.id,
        properties: {
          oldStatus,
          newStatus,
          claimNumber: claim.claimNumber,
        },
      });
    } catch (error) {
      console.error('Status change handling error:', error);
    }
  }

  private async onClaimUnderReview(claim: Claim, updatedBy: string): Promise<void> {
    // Notify stakeholders, request additional documents, etc.
    console.log(`Claim ${claim.claimNumber} is now under review`);
  }

  private async onClaimDecision(claim: Claim, updatedBy: string): Promise<void> {
    // Prepare decision documentation
    console.log(`Decision pending for claim ${claim.claimNumber}`);
  }

  private async onClaimApproved(claim: Claim, updatedBy: string): Promise<void> {
    // Initiate payout process
    console.log(`Claim ${claim.claimNumber} approved - initiating payout`);
  }

  private async onClaimDenied(claim: Claim, updatedBy: string): Promise<void> {
    // Send denial notice with explanation
    console.log(`Claim ${claim.claimNumber} denied`);
  }

  private async onClaimClosed(claim: Claim, updatedBy: string): Promise<void> {
    // Final cleanup and archiving
    console.log(`Claim ${claim.claimNumber} closed`);
  }

  private async addAuditEntry(claimId: string, entry: any): Promise<void> {
    try {
      const claim = await storage.getClaim(claimId);
      if (!claim) return;

      const currentAuditTrail = (claim.auditTrail as any[]) || [];
      const updatedAuditTrail = [...currentAuditTrail, {
        ...entry,
        timestamp: new Date().toISOString(),
      }];

      await storage.updateClaim(claimId, { auditTrail: updatedAuditTrail });
    } catch (error) {
      console.error('Audit entry error:', error);
    }
  }
}
