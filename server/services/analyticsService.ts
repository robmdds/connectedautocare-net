import { storage } from "../storage";
import { type InsertAnalyticsEvent } from "@shared/schema";

export class AnalyticsService {
  async trackEvent(eventData: InsertAnalyticsEvent): Promise<void> {
    try {
      await storage.createAnalyticsEvent(eventData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw error for analytics to avoid breaking main flows
    }
  }

  async getDashboardMetrics(tenantId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      // Get basic metrics with placeholders for demonstration
      const endDate = dateRange?.end || new Date();
      const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      // In a real implementation, these would be actual database queries
      const metrics = {
        totalPolicies: await this.getPolicyCount(tenantId),
        activeClaims: await this.getActiveClaimsCount(tenantId),
        monthlyPremium: await this.getMonthlyPremiumTotal(tenantId),
        conversionRate: await this.getConversionRate(tenantId),
        recentActivity: await this.getRecentActivity(tenantId),
        chartData: await this.getChartData(tenantId, startDate, endDate)
      };

      return metrics;
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      throw new Error('Failed to fetch dashboard metrics');
    }
  }

  async getRecentActivity(tenantId: string, limit: number = 10): Promise<any[]> {
    try {
      // Mock recent activity data for demonstration
      return [
        {
          id: '1',
          type: 'policy_created',
          message: 'New auto policy POL-2025-ABC123 created',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          entityType: 'policy',
          entityId: 'pol-1'
        },
        {
          id: '2',
          type: 'claim_submitted',
          message: 'Claim CLM-2025-DEF456 submitted for review',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          entityType: 'claim',
          entityId: 'clm-1'
        },
        {
          id: '3',
          type: 'payment_received',
          message: 'Payment of $1,245.50 received for policy POL-2025-GHI789',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          entityType: 'payment',
          entityId: 'pay-1'
        },
        {
          id: '4',
          type: 'quote_generated',
          message: 'Quote QTE-2025-JKL012 generated for RV insurance',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          entityType: 'quote',
          entityId: 'qte-1'
        }
      ];
    } catch (error) {
      console.error('Recent activity error:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }

  private async getPolicyCount(tenantId: string): Promise<number> {
    try {
      const policies = await storage.getPolicies(tenantId);
      return policies.length;
    } catch (error) {
      return 0;
    }
  }

  private async getActiveClaimsCount(tenantId: string): Promise<number> {
    try {
      const claims = await storage.getClaims(tenantId, { status: ['submitted', 'under_review', 'approved'] });
      return claims.length;
    } catch (error) {
      return 0;
    }
  }

  private async getMonthlyPremiumTotal(tenantId: string): Promise<number> {
    try {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const policies = await storage.getPolicies(tenantId, { 
        effectiveDate: { gte: startOfMonth } 
      });
      
      return policies.reduce((total, policy) => {
        return total + (parseFloat(policy.premium) || 0);
      }, 0);
    } catch (error) {
      return 0;
    }
  }

  private async getConversionRate(tenantId: string): Promise<number> {
    try {
      const quotes = await storage.getQuotes(tenantId);
      const policies = await storage.getPolicies(tenantId);
      
      if (quotes.length === 0) return 0;
      
      return Math.round((policies.length / quotes.length) * 100 * 100) / 100; // Round to 2 decimals
    } catch (error) {
      return 0;
    }
  }

  private async getChartData(tenantId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      // Generate mock chart data for demonstration
      const days = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        days.push({
          date: new Date(currentDate).toISOString().split('T')[0],
          policies: Math.floor(Math.random() * 10) + 1,
          claims: Math.floor(Math.random() * 5),
          revenue: Math.floor(Math.random() * 5000) + 1000
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        dailyMetrics: days,
        summary: {
          totalPolicies: days.reduce((sum, day) => sum + day.policies, 0),
          totalClaims: days.reduce((sum, day) => sum + day.claims, 0),
          totalRevenue: days.reduce((sum, day) => sum + day.revenue, 0)
        }
      };
    } catch (error) {
      console.error('Chart data error:', error);
      return { dailyMetrics: [], summary: { totalPolicies: 0, totalClaims: 0, totalRevenue: 0 } };
    }
  }

  async generateReport(tenantId: string, reportType: string, filters?: any): Promise<any> {
    try {
      switch (reportType) {
        case 'policies':
          return await this.generatePolicyReport(tenantId, filters);
        case 'claims':
          return await this.generateClaimsReport(tenantId, filters);
        case 'financial':
          return await this.generateFinancialReport(tenantId, filters);
        default:
          throw new Error('Invalid report type');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate report');
    }
  }

  private async generatePolicyReport(tenantId: string, filters?: any): Promise<any> {
    const policies = await storage.getPolicies(tenantId, filters);
    
    return {
      reportType: 'policies',
      generatedAt: new Date(),
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      totalPremium: policies.reduce((sum, p) => sum + parseFloat(p.premium), 0),
      policies: policies
    };
  }

  private async generateClaimsReport(tenantId: string, filters?: any): Promise<any> {
    const claims = await storage.getClaims(tenantId, filters);
    
    return {
      reportType: 'claims',
      generatedAt: new Date(),
      totalClaims: claims.length,
      openClaims: claims.filter(c => ['submitted', 'under_review'].includes(c.status)).length,
      settledClaims: claims.filter(c => c.status === 'settled').length,
      claims: claims
    };
  }

  private async generateFinancialReport(tenantId: string, filters?: any): Promise<any> {
    const policies = await storage.getPolicies(tenantId, filters);
    const payments = await storage.getPayments(tenantId, filters);
    
    return {
      reportType: 'financial',
      generatedAt: new Date(),
      totalPremium: policies.reduce((sum, p) => sum + parseFloat(p.premium), 0),
      totalPayments: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
      policies: policies.length,
      payments: payments.length
    };
  }
}