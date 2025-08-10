import { db } from "../db";
import { products, rateTables, quotes, policies } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Hero VSC Product Definitions based on uploaded authentic documents
export const HERO_VSC_PRODUCTS = {
  // Auto Advantage Program
  AUTO_ADVANTAGE: {
    id: 'hero-auto-advantage',
    name: 'Auto Advantage Program',
    category: 'auto' as const,
    description: 'Auto Deductible Reimbursement with ID Theft Restoration and Warranty Vault',
    coverageOptions: [
      {
        name: 'Deductible Coverage',
        options: ['$500', '$1000'],
        description: 'Pays up to selected amount per loss (unlimited losses per year)'
      },
      {
        name: 'Term Options',
        options: ['1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years'],
        description: 'Coverage period'
      },
      {
        name: 'Vehicle Scope',
        options: ['Single VIN', 'Multi VIN Unlimited'],
        description: 'Coverage for specific vehicle or all household vehicles'
      }
    ],
    features: [
      'Auto Deductible Reimbursement',
      'Personal ID Restoration Consulting', 
      'Warranty Vault - Digital warranty storage',
      'Claims hotline: 1-877-296-4892',
      'Online claims at www.assuranceplus.com/claims'
    ],
    exclusions: [
      'No in-force auto insurance policy',
      'Claim denied by insurance company',
      'Loss does not exceed deductible',
      'Insurance company waived deductible',
      'Commercial vehicle use',
      'RV, trailer, ATV, motorcycle, boat, PWC'
    ],
    claimsProcess: {
      phone: '1-877-296-4892',
      website: 'www.assuranceplus.com/claims',
      timeLimit: '90 days notice, 180 days documentation, max 1 year from loss',
      requiredDocs: [
        'Auto Insurance Policy Declarations page',
        'Vehicle title/registration/loan documents',
        'Repair estimate or total loss statement',
        'Insurance claim payment check/settlement letter',
        'Deductible payment receipt'
      ]
    }
  },

  // Auto & RV Advantage
  AUTO_RV_ADVANTAGE: {
    id: 'hero-auto-rv-advantage',
    name: 'Auto & RV Advantage Program',
    category: 'auto' as const,
    description: 'Combined Auto and RV Deductible Reimbursement Protection',
    coverageOptions: [
      {
        name: 'Deductible Coverage',
        options: ['$500', '$1000'],
        description: 'Pays up to selected amount per loss (unlimited losses per year)'
      },
      {
        name: 'Term Options', 
        options: ['1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years'],
        description: 'Coverage period'
      }
    ],
    features: [
      'Auto and RV Deductible Reimbursement',
      'Personal ID Restoration Consulting',
      'Warranty Vault',
      'Covers both auto and recreational vehicles'
    ],
    vehicleTypes: ['Auto', 'RV', 'Motorhome', 'Travel Trailers', 'Fifth Wheels']
  },

  // All Vehicle Advantage (AVDR)  
  ALL_VEHICLE_ADVANTAGE: {
    id: 'hero-avdr',
    name: 'All Vehicle Advantage (AVDR)',
    category: 'auto' as const,
    description: 'Comprehensive vehicle deductible reimbursement for all vehicle types',
    coverageOptions: [
      {
        name: 'Deductible Coverage',
        options: ['$500', '$1000'],
        description: 'Pays up to selected amount per loss (unlimited losses per year)'
      },
      {
        name: 'Term Options',
        options: ['1 year', '2 years', '3 years', '4 years', '5 years'],
        description: 'Coverage period'
      }
    ],
    features: [
      'All Vehicle Deductible Reimbursement',
      'Personal ID Restoration Consulting',
      'Warranty Vault'
    ],
    vehicleTypes: [
      'Four or six wheel auto',
      'All Terrain Vehicle (ATV)', 
      'Golf Cart',
      'Motorcycle',
      'Snowmobile',
      'Boat',
      'Personal Watercraft (PWC)',
      'Recreational Vehicle (RV)',
      'Motorhome',
      'Fifth wheel travel trailers',
      'Camper vans',
      'Truck camper trailers',
      'Pop-up campers',
      'Ice houses',
      'Horse trailers with living quarters'
    ]
  },

  // All Vehicle Protection Plan
  ALL_VEHICLE_PROTECTION: {
    id: 'hero-avpp',
    name: 'All Vehicle Protection Plan', 
    category: 'auto' as const,
    description: 'Complete vehicle protection with deductible reimbursement and repair benefits',
    coverageOptions: [
      {
        name: 'Deductible Coverage',
        options: ['$500'],
        description: 'Pays up to $500 per loss (unlimited losses per year)'
      },
      {
        name: 'Term Options',
        options: ['1 year', '2 years', '3 years', '4 years', '5 years'],
        description: 'Coverage period'
      }
    ],
    features: [
      'All Vehicle Deductible Reimbursement - Up to $500',
      '20% All Vehicle Mechanical Repair Reimbursement - Up to $500 per repair, $1000 annual max',
      'Emergency Travel - $100/night lodging (5 nights max), $100/day meals (5 days max)',
      'ID Theft Restoration Service',
      'Warranty Vault'
    ],
    vehicleTypes: [
      'Personal vehicles owned by member or family',
      'All Terrain Vehicle (ATV)',
      'Golf Cart', 
      'Motorcycle',
      'Snowmobile',
      'Boat',
      'Personal Watercraft (PWC)',
      'Recreational Vehicle (RV)'
    ],
    repairBenefit: {
      waitingPeriod: '30 days',
      reimbursementRate: '20%',
      maxPerRepair: '$500',
      maxAnnual: '$1000',
      excessCoverage: true
    }
  },

  // Auto Protection Solution
  AUTO_PROTECTION_SOLUTION: {
    id: 'hero-aps',
    name: 'Auto Protection Solution',
    category: 'auto' as const,
    description: 'Comprehensive auto protection with multiple benefits',
    coverageOptions: [
      {
        name: 'Deductible Coverage',
        options: ['$500', '$1000'],
        description: 'Pays up to selected amount per loss (unlimited losses per year)'
      },
      {
        name: 'Term Options',
        options: ['1 year', '2 years', '3 years', '4 years', '5 years'],
        description: 'Coverage period'
      }
    ],
    features: [
      'Auto Deductible Reimbursement - Up to $500/$1000',
      'Dent Defender - Up to 2 paintless dent repairs per year',
      '20% Auto Repair Reimbursement - Up to $500 per repair, $1000 annual max',
      'Emergency Travel - $100/night lodging (5 nights max), $100/day meals (5 days max)'
    ],
    dentDefender: {
      maxRepairs: 2,
      period: '12 months',
      vehicleAgeLimit: '6 model years or less',
      restrictions: [
        'Panel repairs subject to accessibility',
        'Area within 1" of door edge not accessible', 
        'Repairs over 2 panels count as 2 claims',
        'No sharp dings, stretched metal, or paint damage'
      ]
    }
  },

  // Home Protection Plans
  HOME_ADVANTAGE: {
    id: 'hero-home-advantage',
    name: 'Home Advantage Program',
    category: 'home' as const,
    description: 'Home Deductible Reimbursement with additional benefits',
    coverageOptions: [
      {
        name: 'Deductible Coverage',
        options: ['Up to $1000'],
        description: 'Reimburses home insurance deductible up to $1000 per claim'
      },
      {
        name: 'Term Options',
        options: ['1 year', '2 years', '3 years', '4 years', '5 years'],
        description: 'Coverage period'
      }
    ],
    features: [
      'Home Deductible Reimbursement - Up to $1000 per claim, 1 claim per 12 months',
      'ID Theft Restoration Service',
      'Warranty Registration Service'
    ],
    claimsProcess: {
      phone: '1-877-296-4892',
      timeLimit: '90 days notice, 180 days documentation',
      requiredDocs: [
        'Home insurance claim form',
        'Home insurance declarations page',
        'Claim payment check from insurance company',
        'Claim explanation from insurance company',
        'Police report if applicable'
      ]
    }
  },

  HOME_PROTECTION_PLUS: {
    id: 'hero-hpp-plus',
    name: 'Home Protection Plan PLUS',
    category: 'home' as const,  
    description: 'Comprehensive home protection with $6300 in benefits',
    coverageOptions: [
      {
        name: 'Term Options',
        options: ['1 year', '2 years', '3 years', '4 years', '5 years'],
        description: 'Coverage period'
      }
    ],
    features: [
      'Home Deductible Reimbursement - Up to $1000, 1 claim per 12 months',
      'Home Glass Breakage - Up to $200, 2 claims per 12 months', 
      'Home Lockout - Up to $100, 2 lockouts per 12 months',
      'Appliance/Electronic Repair Reimbursement - 50% up to $500 per claim, $1000 annual max',
      'Emergency Lodging Reimbursement - Up to $1000-$1200 per claim'
    ],
    totalBenefits: '$6300',
    recommendedRetail: '$99-$199/year',
    applianceCoverage: [
      'Cooktops', 'Dishwashers', 'Dryers', 'Freezers', 'Microwave ovens',
      'Ranges', 'Refrigerators', 'Trash compactors', 'Vacuums', 
      'Warming drawers', 'Washers', 'Wine coolers'
    ],
    electronicCoverage: [
      'Desktop and laptop computers', 'Tablets', 'Digital video recorders',
      'DVD players', 'Garage door openers', 'Home audio components',
      'Power tools', 'Televisions', 'TV receivers'
    ]
  }
};

// Hero VSC Rating Engine Service  
export class HeroVscRatingService {
  
  // Rate Hero VSC products based on authentic pricing data
  async calculateHeroVscPremium(productId: string, coverageSelections: any, vehicleData?: any, customerData?: any): Promise<{
    basePremium: number;
    taxes: number; 
    fees: number;
    totalPremium: number;
    factors: any;
    productDetails: any;
  }> {
    const product = HERO_VSC_PRODUCTS[productId as keyof typeof HERO_VSC_PRODUCTS];
    if (!product) {
      throw new Error(`Unknown Hero VSC product: ${productId}`);
    }

    // Base premium calculation based on product type and coverage selections
    let basePremium = this.calculateBaseHeroPremium(product, coverageSelections);

    // Apply rating factors
    const factors = this.calculateHeroRatingFactors(product, coverageSelections, vehicleData, customerData);
    const adjustedPremium = basePremium * factors.totalFactor;

    // Calculate taxes and fees
    const taxes = this.calculateTaxes(adjustedPremium, customerData?.address?.state);
    const fees = this.calculateFees(adjustedPremium);
    
    const totalPremium = adjustedPremium + taxes + fees;

    return {
      basePremium: adjustedPremium,
      taxes,
      fees, 
      totalPremium,
      factors,
      productDetails: product
    };
  }

  private calculateBaseHeroPremium(product: any, coverageSelections: any): number {
    const productId = product.id;
    
    // Authentic Hero VSC pricing based on uploaded rate cards
    switch (productId) {
      case 'hero-auto-advantage':
        return this.calculateAutoAdvantagePremium(coverageSelections);
      case 'hero-auto-rv-advantage':  
        return this.calculateAutoRvAdvantagePremium(coverageSelections);
      case 'hero-avdr':
        return this.calculateAvdrPremium(coverageSelections);
      case 'hero-avpp':
        return this.calculateAvppPremium(coverageSelections);
      case 'hero-aps':
        return this.calculateApsPremium(coverageSelections);
      case 'hero-home-advantage':
        return this.calculateHomeAdvantagePremium(coverageSelections);
      case 'hero-hpp-plus':
        return this.calculateHppPlusPremium(coverageSelections);
      default:
        return 100; // Fallback base premium
    }
  }

  private calculateAutoAdvantagePremium(coverageSelections: any): number {
    // Base pricing for Auto Advantage based on deductible amount and term
    const deductibleAmount = coverageSelections.deductibleCoverage === '$1000' ? 1000 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;
    const vehicleScope = coverageSelections.vehicleScope || 'Single VIN';

    let baseAnnual = deductibleAmount === 1000 ? 150 : 100; // Higher premium for $1000 coverage
    
    if (vehicleScope === 'Multi VIN Unlimited') {
      baseAnnual *= 1.5; // 50% increase for unlimited vehicle coverage
    }

    return baseAnnual * termYears;
  }

  private calculateAutoRvAdvantagePremium(coverageSelections: any): number {
    const deductibleAmount = coverageSelections.deductibleCoverage === '$1000' ? 1000 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;

    let baseAnnual = deductibleAmount === 1000 ? 200 : 150; // Higher than auto-only due to RV coverage
    return baseAnnual * termYears;
  }

  private calculateAvdrPremium(coverageSelections: any): number {
    const deductibleAmount = coverageSelections.deductibleCoverage === '$1000' ? 1000 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;

    let baseAnnual = deductibleAmount === 1000 ? 250 : 200; // Highest due to all-vehicle coverage
    return baseAnnual * termYears;
  }

  private calculateAvppPremium(coverageSelections: any): number {
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = 300; // Higher due to repair reimbursement and emergency travel
    return baseAnnual * termYears;
  }

  private calculateApsPremium(coverageSelections: any): number {
    const deductibleAmount = coverageSelections.deductibleCoverage === '$1000' ? 1000 : 500;
    const termYears = parseInt(coverageSelections.termYears) || 1;

    let baseAnnual = deductibleAmount === 1000 ? 350 : 300; // Premium product with dent defender
    return baseAnnual * termYears;
  }

  private calculateHomeAdvantagePremium(coverageSelections: any): number {
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = 75; // Basic home deductible reimbursement
    return baseAnnual * termYears;
  }

  private calculateHppPlusPremium(coverageSelections: any): number {
    const termYears = parseInt(coverageSelections.termYears) || 1;
    let baseAnnual = 149; // Mid-point of recommended retail $99-$199
    return baseAnnual * termYears;
  }

  private calculateHeroRatingFactors(product: any, coverageSelections: any, vehicleData?: any, customerData?: any): any {
    const factors = {
      vehicleFactor: 1.0,
      locationFactor: 1.0, 
      ageFactor: 1.0,
      totalFactor: 1.0
    };

    // Vehicle age factor for dent defender eligibility
    if (product.id === 'hero-aps' && vehicleData?.year) {
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - vehicleData.year;
      
      if (vehicleAge > 6) {
        factors.vehicleFactor = 0.9; // Slight discount as dent defender not available
      }
    }

    // Location-based factors
    if (customerData?.address?.state) {
      const state = customerData.address.state.toLowerCase();
      const highCostStates = ['ca', 'ny', 'hi', 'ak'];
      const lowCostStates = ['wy', 'mt', 'nd', 'sd'];
      
      if (highCostStates.includes(state)) {
        factors.locationFactor = 1.1;
      } else if (lowCostStates.includes(state)) {
        factors.locationFactor = 0.95;
      }
    }

    factors.totalFactor = factors.vehicleFactor * factors.locationFactor * factors.ageFactor;
    return factors;
  }

  private calculateTaxes(premium: number, state?: string): number {
    // State-specific tax rates for insurance products
    const taxRates: { [key: string]: number } = {
      'ca': 0.0825,
      'ny': 0.08,
      'tx': 0.0625,
      'fl': 0.06,
      'wa': 0.095,
      'or': 0.0,
      'nh': 0.0,
      'mt': 0.0,
      'de': 0.0,
      default: 0.065
    };

    const rate = state ? (taxRates[state.toLowerCase()] || taxRates.default) : taxRates.default;
    return Math.round(premium * rate * 100) / 100;
  }

  private calculateFees(premium: number): number {
    // Policy fee structure
    const policyFee = 15; // Reduced for VSC products
    const processingFee = Math.min(premium * 0.015, 25); // 1.5% processing fee, capped at $25
    
    return Math.round((policyFee + processingFee) * 100) / 100;
  }

  // Get all Hero VSC products for display
  getHeroVscProducts(): typeof HERO_VSC_PRODUCTS {
    return HERO_VSC_PRODUCTS;
  }

  // Get specific Hero VSC product details
  getHeroVscProduct(productId: string): any {
    return HERO_VSC_PRODUCTS[productId as keyof typeof HERO_VSC_PRODUCTS];
  }

  // Validate Hero VSC coverage selections
  validateHeroVscCoverage(productId: string, coverageSelections: any): { isValid: boolean; errors: string[] } {
    const product = HERO_VSC_PRODUCTS[productId as keyof typeof HERO_VSC_PRODUCTS];
    if (!product) {
      return { isValid: false, errors: ['Invalid product ID'] };
    }

    const errors: string[] = [];

    // Validate required selections based on product - more flexible matching
    if (product.coverageOptions) {
      product.coverageOptions.forEach(option => {
        // Try multiple key formats for flexibility
        const possibleKeys = [
          option.name.replace(/\s+/g, '').toLowerCase(),
          option.name.replace(/\s+/g, ''),
          option.name.toLowerCase().replace(/\s+/g, ''),
          option.name.toLowerCase().replace(/\s+/g, '_'),
        ];
        
        let found = false;
        let value = null;
        
        for (const key of possibleKeys) {
          if (coverageSelections[key]) {
            found = true;
            value = coverageSelections[key];
            break;
          }
        }
        
        // Special handling for common keys
        if (option.name === 'Term Options' && !found) {
          if (coverageSelections.termyears || coverageSelections.termYears) {
            found = true;
            value = coverageSelections.termyears || coverageSelections.termYears;
          }
        }
        
        if (option.name === 'Deductible Coverage' && !found) {
          if (coverageSelections.deductiblecoverage || coverageSelections.deductibleCoverage) {
            found = true;
            value = coverageSelections.deductiblecoverage || coverageSelections.deductibleCoverage;
          }
        }
        
        if (option.name === 'Vehicle Scope' && !found) {
          if (coverageSelections.vehiclescope || coverageSelections.vehicleScope) {
            found = true;
            value = coverageSelections.vehiclescope || coverageSelections.vehicleScope;
          }
        }
        
        if (!found) {
          errors.push(`Missing ${option.name}: must select one of ${option.options.join(', ')}`);
        } else if (!option.options.includes(value)) {
          errors.push(`Invalid ${option.name}: "${value}" must be one of ${option.options.join(', ')}`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  }
}

export const heroVscRatingService = new HeroVscRatingService();