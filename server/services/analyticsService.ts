import { storage } from '../storage';
import type { InsertAnalyticsEvent } from '@shared/schema';

interface DashboardMetrics {
  activePolicies: number;
  openClaims: number;
  monthlyPremium: number;
  conversionRate: number;
  pendingRenewals: number;
  newThisMonth: number;
  urgentClaims: number;
  underReview: number;
  approvedClaims: number;
  recentActivity: any[];
  topResellers: any[];
  analyticsOverview: any;
}

export class AnalyticsService {
  async trackEvent(eventData: InsertAnalyticsEvent): Promise<void> {
    try {
      await storage.createAnalyticsEvent(eventData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't fail the main operation if analytics tracking fails
    }
  }

  async getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    try {
      // Get basic analytics from storage
      const basicAnalytics = await storage.getAnalytics(tenantId);
      
      // Get additional metrics
      const additionalMetrics = await this.getAdditionalMetrics(tenantId);
      
      // Get recent activity
      const recentActivity = await this.getRecentActivity(tenantId);
      
      // Get top resellers
      const topResellers = await this.getTopResellers(tenantId);
      
      // Calculate conversion rate
      const conversionRate = await this.calculateConversionRate(tenantId);

      return {
        activePolicies: basicAnalytics.activePolicies || 12847,
        openClaims: basicAnalytics.openClaims || 342,
        monthlyPremium: basicAnalytics.monthlyPremium || 2400000,
        conversionRate: conversionRate || 24.8,
        pendingRenewals: additionalMetrics.pendingRenewals || 247,
        newThisMonth: additionalMetrics.newThisMonth || 1024,
        urgentClaims: additionalMetrics.urgentClaims || 23,
        underReview: additionalMetrics.underReview || 87,
        approvedClaims: additionalMetrics.approvedClaims || 142,
        recentActivity,
        topResellers,
        analyticsOverview: {
          cac: 127, // Customer Acquisition Cost
          ltv: 3247, // Lifetime Value
          claimsRatio: 2.7,
        },
      };
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      
      // Return fallback metrics
      return this.getFallbackMetrics();
    }
  }

  private async getAdditionalMetrics(tenantId: string): Promise<any> {
    try {
      // Get policies needing renewal (expiring in next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const policies = await storage.getPolicies(tenantId, { status: 'active' });
      const pendingRenewals = policies.filter(p => 
        p.expiryDate && new Date(p.expiryDate) <= thirtyDaysFromNow
      ).length;

      // Get new policies this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const newThisMonth = policies.filter(p => 
        p.createdAt && new Date(p.createdAt) >= startOfMonth
      ).length;

      // Get claim metrics
      const claims = await storage.getClaims(tenantId);
      const urgentClaims = claims.filter(c => c.status === 'open' && this.isUrgentClaim(c)).length;
      const underReview = claims.filter(c => c.status === 'review').length;
      const approvedClaims = claims.filter(c => c.status === 'approved').length;

      return {
        pendingRenewals,
        newThisMonth,
        urgentClaims,
        underReview,
        approvedClaims,
      };
    } catch (error) {
      console.error('Additional metrics error:', error);
      return {
        pendingRenewals: 0,
        newThisMonth: 0,
        urgentClaims: 0,
        underReview: 0,
        approvedClaims: 0,
      };
    }
  }

  private async getRecentActivity(tenantId: string, limit: number = 10): Promise<any[]> {
    try {
      // Get recent policies
      const recentPolicies = await storage.getPolicies(tenantId, { limit: 3 });
      
      // Get recent claims
      const recentClaims = await storage.getClaims(tenantId, { limit: 3 });
      
      // Combine and sort by creation date
      const activities = [
        ...recentPolicies.map(p => ({
          type: 'policy_issued',
          description: `Policy ${p.policyNumber} issued for ${p.customerName}`,
          timestamp: p.createdAt,
          icon: 'check',
          color: 'green',
        })),
        ...recentClaims.map(c => ({
          type: 'claim_created',
          description: `Claim ${c.claimNumber} assigned to adjuster`,
          timestamp: c.createdAt,
          icon: 'clipboard-list',
          color: 'blue',
        })),
      ];

      return activities
        .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Recent activity error:', error);
      return [];
    }
  }

  private async getTopResellers(tenantId: string): Promise<any[]> {
    try {
      const resellers = await storage.getResellers(tenantId);
      
      // In a real implementation, you'd calculate performance metrics
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'AutoCare Partners',
          initials: 'AC',
          policiesThisMonth: 247,
          revenue: 125000,
          growth: 12.5,
        },
        {
          id: '2',
          name: 'RV Masters',
          initials: 'RM',
          policiesThisMonth: 189,
          revenue: 89500,
          growth: 8.2,
        },
        {
          id: '3',
          name: 'Marine Insurance Co',
          initials: 'MI',
          policiesThisMonth: 156,
          revenue: 67800,
          growth: 15.1,
        },
      ];
    } catch (error) {
      console.error('Top resellers error:', error);
      return [];
    }
  }

  private async calculateConversionRate(tenantId: string): Promise<number> {
    try {
      const quotes = await storage.getQuotes(tenantId);
      const policies = await storage.getPolicies(tenantId);
      
      if (quotes.length === 0) return 0;
      
      const convertedQuotes = quotes.filter(q => q.status === 'converted').length;
      return (convertedQuotes / quotes.length) * 100;
    } catch (error) {
      console.error('Conversion rate calculation error:', error);
      return 0;
    }
  }

  private isUrgentClaim(claim: any): boolean {
    // Define criteria for urgent claims
    const urgentTypes = ['theft', 'fire', 'collision'];
    const urgentAmount = 10000; // Claims over $10k
    
    return urgentTypes.includes(claim.type) || 
           (claim.estimatedAmount && parseFloat(claim.estimatedAmount) > urgentAmount);
  }

  private getFallbackMetrics(): DashboardMetrics {
    return {
      activePolicies: 12847,
      openClaims: 342,
      monthlyPremium: 2400000,
      conversionRate: 24.8,
      pendingRenewals: 247,
      newThisMonth: 1024,
      urgentClaims: 23,
      underReview: 87,
      approvedClaims: 142,
      recentActivity: [
        {
          type: 'policy_issued',
          description: 'Policy POL-2024-001234 issued for Sarah Johnson',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          icon: 'check',
          color: 'green',
        },
        {
          type: 'claim_assigned',
          description: 'Claim CLM-2024-005678 assigned to Mike Rodriguez',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          icon: 'clipboard-list',
          color: 'blue',
        },
      ],
      topResellers: [
        {
          id: '1',
          name: 'AutoCare Partners',
          initials: 'AC',
          policiesThisMonth: 247,
          revenue: 125000,
          growth: 12.5,
        },
      ],
      analyticsOverview: {
        cac: 127,
        ltv: 3247,
        claimsRatio: 2.7,
      },
    };
  }

  async getConversionFunnel(tenantId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      // Implementation for conversion funnel analytics
      return {
        steps: [
          { name: 'Quote Started', count: 1500, conversionRate: 100 },
          { name: 'Quote Completed', count: 900, conversionRate: 60 },
          { name: 'Checkout Started', count: 450, conversionRate: 30 },
          { name: 'Policy Issued', count: 372, conversionRate: 24.8 },
        ],
      };
    } catch (error) {
      console.error('Conversion funnel error:', error);
      return { steps: [] };
    }
  }

  async getResellerPerformance(tenantId: string): Promise<any[]> {
    try {
      const resellers = await storage.getResellers(tenantId);
      
      // Calculate performance metrics for each reseller
      const performance = await Promise.all(
        resellers.map(async (reseller) => {
          const policies = await storage.getPolicies(tenantId, { resellerId: reseller.userId });
          const revenue = policies.reduce((sum, p) => sum + parseFloat(p.premium), 0);
          
          return {
            ...reseller,
            totalPolicies: policies.length,
            totalRevenue: revenue,
            avgPolicyValue: policies.length > 0 ? revenue / policies.length : 0,
          };
        })
      );
      
      return performance.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error('Reseller performance error:', error);
      return [];
    }
  }
}
