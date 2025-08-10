import { db } from '../db';
import { specialQuoteRequests, type SpecialQuoteRequest, type InsertSpecialQuoteRequest } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export class SpecialQuoteRequestService {
  
  async createSpecialQuoteRequest(data: {
    tenantId?: string;
    productId: string;
    vehicleData: any;
    coverageSelections: any;
    customerData: any;
    eligibilityReasons: string[];
    requestReason: string;
  }): Promise<SpecialQuoteRequest> {
    // Generate request number
    const requestNumber = `SQR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const insertData = {
      requestNumber,
      tenantId: data.tenantId || 'default-tenant',
      productId: data.productId,
      vehicleData: data.vehicleData,
      coverageSelections: data.coverageSelections,
      customerData: data.customerData,
      eligibilityReasons: data.eligibilityReasons,
      requestReason: data.requestReason,
      status: 'pending' as const,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    const [created] = await db
      .insert(specialQuoteRequests)
      .values(insertData)
      .returning();

    return created;
  }

  async getSpecialQuoteRequest(id: string): Promise<SpecialQuoteRequest | undefined> {
    const [request] = await db
      .select()
      .from(specialQuoteRequests)
      .where(eq(specialQuoteRequests.id, id));
    
    return request;
  }

  async getAllSpecialQuoteRequests(tenantId?: string): Promise<SpecialQuoteRequest[]> {
    if (tenantId) {
      return await db
        .select()
        .from(specialQuoteRequests)
        .where(eq(specialQuoteRequests.tenantId, tenantId))
        .orderBy(desc(specialQuoteRequests.createdAt));
    }
    
    return await db
      .select()
      .from(specialQuoteRequests)
      .orderBy(desc(specialQuoteRequests.createdAt));
  }

  async getPendingSpecialQuoteRequests(tenantId?: string): Promise<SpecialQuoteRequest[]> {
    if (tenantId) {
      return await db
        .select()
        .from(specialQuoteRequests)
        .where(eq(specialQuoteRequests.status, 'pending'))
        .where(eq(specialQuoteRequests.tenantId, tenantId))
        .orderBy(desc(specialQuoteRequests.createdAt));
    }
    
    return await db
      .select()
      .from(specialQuoteRequests)
      .where(eq(specialQuoteRequests.status, 'pending'))
      .orderBy(desc(specialQuoteRequests.createdAt));
  }

  async updateSpecialQuoteRequestStatus(
    id: string, 
    status: 'pending' | 'reviewing' | 'quoted' | 'declined' | 'expired',
    updates: {
      reviewedBy?: string;
      reviewNotes?: string;
      alternativeQuote?: any;
      declineReason?: string;
    } = {}
  ): Promise<SpecialQuoteRequest | undefined> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'reviewing' || status === 'quoted' || status === 'declined') {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = updates.reviewedBy;
    }

    if (updates.reviewNotes) {
      updateData.reviewNotes = updates.reviewNotes;
    }

    if (updates.alternativeQuote) {
      updateData.alternativeQuote = updates.alternativeQuote;
    }

    if (updates.declineReason) {
      updateData.declineReason = updates.declineReason;
    }

    const [updated] = await db
      .update(specialQuoteRequests)
      .set(updateData)
      .where(eq(specialQuoteRequests.id, id))
      .returning();

    return updated;
  }

  async deleteSpecialQuoteRequest(id: string): Promise<boolean> {
    const result = await db
      .delete(specialQuoteRequests)
      .where(eq(specialQuoteRequests.id, id));

    return (result.rowCount || 0) > 0;
  }

  // Helper method to check if a request is expired
  isExpired(request: SpecialQuoteRequest): boolean {
    if (!request.expiresAt) return false;
    return new Date() > new Date(request.expiresAt);
  }

  // Helper method to get request summary for admin dashboard
  async getRequestsSummary(tenantId?: string): Promise<{
    total: number;
    pending: number;
    reviewing: number;
    quoted: number;
    declined: number;
    expired: number;
  }> {
    const requests = await this.getAllSpecialQuoteRequests(tenantId);
    
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      reviewing: requests.filter(r => r.status === 'reviewing').length,
      quoted: requests.filter(r => r.status === 'quoted').length,
      declined: requests.filter(r => r.status === 'declined').length,
      expired: requests.filter(r => this.isExpired(r)).length,
    };
  }
}