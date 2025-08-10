import { storage } from '../storage';
import type { InsertQuote } from '@shared/schema';

interface RatingResult {
  basePremium: number;
  taxes: number;
  fees: number;
  discounts: number;
  totalPremium: number;
  factors: Record<string, number>;
}

interface RatingFactors {
  vehicleAge?: number;
  mileage?: number;
  driverAge?: number;
  location?: string;
  coverage?: any;
  vehicleValue?: number;
}

export class RatingEngineService {
  async calculatePremium(quoteData: InsertQuote): Promise<RatingResult> {
    try {
      // Get active rate table for the product
      const rateTable = await storage.getActiveRateTable(quoteData.productId!);
      if (!rateTable) {
        throw new Error('No active rate table found for product');
      }

      // Get vehicle information
      let vehicle = null;
      if (quoteData.vehicleId) {
        vehicle = await storage.getVehicle(quoteData.vehicleId);
      }

      // Extract rating factors
      const factors = this.extractRatingFactors(quoteData, vehicle);
      
      // Calculate base premium using rate table
      const basePremium = this.calculateBasePremium(rateTable.rateData, factors);
      
      // Apply modifiers
      const modifiers = this.applyModifiers(basePremium, factors, quoteData);
      
      // Calculate taxes and fees
      const taxes = this.calculateTaxes(basePremium, quoteData.customerAddress);
      const fees = this.calculateFees(basePremium);
      const discounts = this.calculateDiscounts(basePremium, quoteData);
      
      const totalPremium = basePremium + taxes + fees - discounts + (modifiers.resellerMarkup || 0);

      return {
        basePremium,
        taxes,
        fees,
        discounts,
        totalPremium,
        factors: {
          basePremium,
          vehicleAge: factors.vehicleAge || 0,
          mileage: factors.mileage || 0,
          resellerMarkup: modifiers.resellerMarkup || 0,
        },
      };
    } catch (error) {
      console.error('Rating calculation error:', error);
      
      // Fallback calculation
      const fallbackPremium = this.calculateFallbackPremium(quoteData);
      return {
        basePremium: fallbackPremium,
        taxes: fallbackPremium * 0.08, // 8% tax
        fees: 25,
        discounts: 0,
        totalPremium: fallbackPremium * 1.08 + 25,
        factors: { fallback: true },
      };
    }
  }

  private extractRatingFactors(quoteData: InsertQuote, vehicle: any): RatingFactors {
    const factors: RatingFactors = {};

    if (vehicle) {
      const currentYear = new Date().getFullYear();
      factors.vehicleAge = vehicle.year ? currentYear - vehicle.year : 0;
      factors.mileage = vehicle.mileage || 0;
      factors.vehicleValue = parseFloat(vehicle.vehicleValue || '0');
    }

    // Extract from customer address
    if (quoteData.customerAddress) {
      const address = quoteData.customerAddress as any;
      factors.location = address.state || address.province || 'unknown';
    }

    factors.coverage = quoteData.coverageSelections;

    return factors;
  }

  private calculateBasePremium(rateData: any, factors: RatingFactors): number {
    // This would implement complex rating logic based on rate table structure
    // For now, implement simplified logic
    
    let basePremium = 800; // Base rate

    // Age factor
    if (factors.vehicleAge !== undefined) {
      if (factors.vehicleAge < 3) {
        basePremium *= 1.2; // Newer vehicles cost more
      } else if (factors.vehicleAge > 10) {
        basePremium *= 0.8; // Older vehicles cost less
      }
    }

    // Mileage factor
    if (factors.mileage !== undefined) {
      if (factors.mileage > 100000) {
        basePremium *= 0.9; // High mileage discount
      } else if (factors.mileage < 20000) {
        basePremium *= 1.1; // Low mileage premium
      }
    }

    // Vehicle value factor
    if (factors.vehicleValue && factors.vehicleValue > 0) {
      basePremium += factors.vehicleValue * 0.02; // 2% of vehicle value
    }

    // Coverage factor
    if (factors.coverage) {
      const coverage = factors.coverage as any;
      if (coverage.comprehensive) {
        basePremium += 200;
      }
      if (coverage.collision) {
        basePremium += 300;
      }
      if (coverage.liability) {
        basePremium += 150;
      }
    }

    return Math.round(basePremium);
  }

  private applyModifiers(basePremium: number, factors: RatingFactors, quoteData: InsertQuote): any {
    const modifiers: any = {};

    // Reseller markup
    if (quoteData.resellerMarkup) {
      const markupRate = parseFloat(quoteData.resellerMarkup.toString()) / 100;
      modifiers.resellerMarkup = basePremium * markupRate;
    }

    return modifiers;
  }

  private calculateTaxes(basePremium: number, address: any): number {
    // Simplified tax calculation based on location
    let taxRate = 0.08; // Default 8%

    if (address) {
      const state = address.state || address.province;
      switch (state?.toUpperCase()) {
        case 'CA':
          taxRate = 0.10; // California
          break;
        case 'NY':
          taxRate = 0.09; // New York
          break;
        case 'TX':
          taxRate = 0.07; // Texas
          break;
        case 'FL':
          taxRate = 0.06; // Florida
          break;
        default:
          taxRate = 0.08;
      }
    }

    return Math.round(basePremium * taxRate);
  }

  private calculateFees(basePremium: number): number {
    // Standard processing fees
    return 25; // Flat fee
  }

  private calculateDiscounts(basePremium: number, quoteData: InsertQuote): number {
    let discounts = 0;

    // Promo code discounts
    if (quoteData.promoCode) {
      switch (quoteData.promoCode.toUpperCase()) {
        case 'SAVE10':
          discounts += basePremium * 0.10;
          break;
        case 'FIRST15':
          discounts += basePremium * 0.15;
          break;
        case 'NEWCUSTOMER':
          discounts += 50;
          break;
      }
    }

    return Math.round(discounts);
  }

  private calculateFallbackPremium(quoteData: InsertQuote): number {
    // Simple fallback when rate tables are not available
    let premium = 1000; // Base fallback premium

    // Adjust based on coverage selections
    const coverage = quoteData.coverageSelections as any;
    if (coverage) {
      if (coverage.comprehensive) premium += 200;
      if (coverage.collision) premium += 300;
      if (coverage.liability) premium += 150;
    }

    return premium;
  }

  async validateRateTable(rateTableData: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate rate table structure
    if (!rateTableData || typeof rateTableData !== 'object') {
      errors.push('Rate table data must be a valid object');
    }

    if (!rateTableData.rates || !Array.isArray(rateTableData.rates)) {
      errors.push('Rate table must contain a rates array');
    }

    if (!rateTableData.factors || typeof rateTableData.factors !== 'object') {
      errors.push('Rate table must contain a factors object');
    }

    // Additional validation logic here...

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
