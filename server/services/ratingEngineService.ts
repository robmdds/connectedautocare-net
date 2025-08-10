export class RatingEngineService {
  async calculatePremium(quoteData: any): Promise<{
    basePremium: number;
    taxes: number;
    fees: number;
    totalPremium: number;
    factors: any;
  }> {
    try {
      // Base premium from product
      let basePremium = 1000; // Default base premium

      // Apply rating factors
      const factors = this.calculateRatingFactors(quoteData);
      
      // Calculate adjusted premium
      const adjustedPremium = basePremium * factors.totalFactor;
      
      // Calculate taxes and fees
      const taxes = this.calculateTaxes(adjustedPremium, quoteData.customerInfo?.address?.state);
      const fees = this.calculateFees(adjustedPremium);
      
      const totalPremium = adjustedPremium + taxes + fees;

      return {
        basePremium: adjustedPremium,
        taxes,
        fees,
        totalPremium,
        factors
      };
    } catch (error) {
      console.error('Rating calculation error:', error);
      throw new Error('Failed to calculate premium');
    }
  }

  private calculateRatingFactors(quoteData: any): any {
    const factors = {
      ageFactor: 1.0,
      vehicleFactor: 1.0,
      locationFactor: 1.0,
      coverageFactor: 1.0,
      totalFactor: 1.0
    };

    // Age factor (if driver age available)
    if (quoteData.driverInfo?.age) {
      const age = quoteData.driverInfo.age;
      if (age < 25) {
        factors.ageFactor = 1.5; // Higher rate for young drivers
      } else if (age > 65) {
        factors.ageFactor = 1.2; // Higher rate for senior drivers
      } else {
        factors.ageFactor = 1.0; // Base rate for middle-aged drivers
      }
    }

    // Vehicle factor (if vehicle info available)
    if (quoteData.vehicleInfo?.year) {
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - quoteData.vehicleInfo.year;
      
      if (vehicleAge > 10) {
        factors.vehicleFactor = 0.8; // Discount for older vehicles
      } else if (vehicleAge < 3) {
        factors.vehicleFactor = 1.3; // Higher rate for newer vehicles
      }
    }

    // Location factor (basic state-based rating)
    if (quoteData.customerInfo?.address?.state) {
      const state = quoteData.customerInfo.address.state.toLowerCase();
      const highRiskStates = ['ca', 'fl', 'tx', 'ny'];
      
      if (highRiskStates.includes(state)) {
        factors.locationFactor = 1.2;
      } else {
        factors.locationFactor = 0.9;
      }
    }

    // Coverage factor based on selected coverage options
    if (quoteData.coverageOptions) {
      const hasComprehensive = quoteData.coverageOptions.comprehensive;
      const hasCollision = quoteData.coverageOptions.collision;
      
      if (hasComprehensive && hasCollision) {
        factors.coverageFactor = 1.8; // Full coverage
      } else if (hasComprehensive || hasCollision) {
        factors.coverageFactor = 1.4; // Partial coverage
      } else {
        factors.coverageFactor = 1.0; // Liability only
      }
    }

    // Calculate total factor
    factors.totalFactor = factors.ageFactor * factors.vehicleFactor * 
                         factors.locationFactor * factors.coverageFactor;

    return factors;
  }

  private calculateTaxes(premium: number, state?: string): number {
    // Basic state tax calculation
    const taxRates: { [key: string]: number } = {
      'ca': 0.0825, // California
      'ny': 0.08,   // New York
      'tx': 0.0625, // Texas
      'fl': 0.06,   // Florida
      default: 0.065 // Default rate
    };

    const rate = state ? (taxRates[state.toLowerCase()] || taxRates.default) : taxRates.default;
    return Math.round(premium * rate * 100) / 100;
  }

  private calculateFees(premium: number): number {
    // Fixed fees and percentage-based fees
    const fixedFees = 25; // Policy fee
    const percentageFee = premium * 0.02; // 2% processing fee
    
    return Math.round((fixedFees + percentageFee) * 100) / 100;
  }

  async uploadRateTable(file: any, productId: string, tenantId: string): Promise<any> {
    // Placeholder for rate table upload functionality
    // In a real implementation, this would parse CSV/Excel files
    // and store rate factors in the database
    
    return {
      success: true,
      message: 'Rate table upload functionality ready for implementation',
      productId,
      tenantId
    };
  }
}