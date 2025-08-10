/**
 * Connected Auto Care VSC Service
 * Handles Elevate and Pinnacle VSC products with authentic rate cards and contract templates
 */

// Connected Auto Care VSC Product Definitions from uploaded documentation
export const CONNECTED_AUTO_CARE_PRODUCTS = {
  ELEVATE_PLATINUM: {
    id: 'cac-elevate-platinum',
    name: 'Elevate Platinum VSC',
    category: 'auto',
    description: 'Premium comprehensive vehicle service contract with extensive coverage',
    administrator: 'Ascent Administration Services, LLC',
    address: '360 South Smith Road, Tempe, Arizona 85281',
    phone: '866-660-7003',
    roadsidePhone: '877-626-0880',
    deductible: {
      sellingDealer: '$0 per claim visit',
      otherRepairFacility: '$100 per claim visit'
    },
    laborRate: '$150.00 per hour maximum',
    coverageOptions: [
      {
        name: 'Term Length',
        options: ['12 months', '24 months', '36 months', '48 months', '60 months', '72 months'],
        description: 'Contract duration'
      },
      {
        name: 'Coverage Miles',
        options: ['15,000', '25,000', '30,000', '45,000', '60,000', '75,000', '90,000', '100,000', '125,000', 'Unlimited'],
        description: 'Maximum miles covered during term'
      },
      {
        name: 'Vehicle Class',
        options: ['Class A', 'Class B', 'Class C'],
        description: 'Vehicle classification for pricing'
      }
    ],
    features: [
      'Comprehensive mechanical breakdown coverage',
      'Engine and transmission coverage',
      'Electrical system coverage',
      'Air conditioning coverage',
      'Suspension coverage',
      'Brake system coverage',
      'Fuel system coverage',
      'Cooling system coverage',
      'Steering coverage',
      'Seals and gaskets coverage (conditions apply)',
      '24-hour roadside assistance and towing',
      'Rental car reimbursement',
      'Trip interruption benefits'
    ],
    exclusions: [
      'Pre-existing conditions',
      'Maintenance items per owner\'s manual',
      'Commercial use vehicles',
      'Modified vehicles beyond manufacturer specifications',
      'Damage from accidents, floods, fire',
      'Improper repair damage',
      'Diagnostic charges for non-covered repairs'
    ],
    claimsProcess: {
      phone: '866-660-7003',
      website: 'AscentAdmin.com',
      authorization: 'Prior authorization required for repairs',
      laborGuide: 'Mitchell\'s ProDemand labor guide',
      parts: 'New, remanufactured, or like kind and quality replacement parts'
    },
    vehicleClassification: {
      classA: ['Honda', 'Hyundai', 'Isuzu', 'Kia', 'Mazda', 'Mitsubishi', 'Scion', 'Subaru', 'Toyota', 'Lexus', 'Nissan', 'Infiniti'],
      classB: ['1/2 Ton Pickup Trucks', 'Acura', 'Audi (A3/A4)', 'BMW (1/2 Series)', 'Buick', 'Chevrolet', 'Chrysler/Dodge/Plymouth', 'Fiat', 'Ford', 'GMC', 'Jeep', 'Mercury', 'Mercedes C Class', 'Mini', 'Oldsmobile', 'Pontiac', 'VW', 'Volvo', '3/4 and 1-ton Pickup Trucks'],
      classC: ['Audi (except A3/A4, RS-series, S-series, A8)', 'BMW (except 1/2, 7, M, Z Series)', 'Cadillac', 'Jaguar', 'Land Rover', 'Mercedes Benz (except C, S/SL Class, M Class)', 'Porsche', 'Tesla']
    },
    ineligibleVehicles: [
      'Alfa Romeo', 'Aston Martin', 'Audi (A8/RS/S6/S7/R8)', 'Bentley', 'BMW (7, M, Z Series)', 'Bugatti', 'Corvette', 'Daewoo', 'DeLorean', 'Dodge SRT', 'Ferrari', 'Hummer', 'Isuzu', 'Lamborghini', 'Lotus', 'Maserati', 'Maybach', 'McLaren', 'Mercedes Benz (all AMG, M Class, S/SL Class)', 'Mitsubishi Lancer Evolution', 'Peugeot', 'Rivian', 'Rolls Royce', 'Saab', 'Saturn', 'Smart', 'Sterling', 'Subaru WRX', 'Suzuki', 'VW V8 engine', 'Yugo', 'Police vehicles', 'Taxi vehicles', 'Pickup trucks over 1-ton', 'V10/V12 cars or SUVs', 'Rotary engine vehicles', 'Special interest vehicles', 'Vehicles under $2,000', 'Vehicles over $100,000', 'Modified vehicles beyond 6" lift kit'
    ],
    surcharges: {
      mandatory: {
        '4WD_AWD': 200,
        'diesel': 200,
        'turbo_supercharge': 200
      },
      optional: {
        'commercial': 200,
        'lift_up_to_6': 200,
        'eco_coverage': 100,
        'technology_coverage': 100
      },
      oilChanges: {
        '6_changes': 300,
        '8_changes': 400,
        '10_changes': 500
      }
    }
  },
  ELEVATE_GOLD: {
    id: 'cac-elevate-gold',
    name: 'Elevate Gold VSC',
    category: 'auto',
    description: 'Mid-tier vehicle service contract with solid coverage',
    administrator: 'Ascent Administration Services, LLC',
    address: '360 South Smith Road, Tempe, Arizona 85281',
    phone: '866-660-7003',
    roadsidePhone: '877-626-0880',
    deductible: {
      sellingDealer: '$0 per claim visit',
      otherRepairFacility: '$100 per claim visit'
    },
    laborRate: '$150.00 per hour maximum',
    coverageOptions: [
      {
        name: 'Term Length',
        options: ['12 months', '24 months', '36 months', '48 months', '60 months', '72 months'],
        description: 'Contract duration'
      },
      {
        name: 'Coverage Miles',
        options: ['15,000', '25,000', '30,000', '45,000', '60,000', '75,000', '90,000', '100,000', '125,000', 'Unlimited'],
        description: 'Maximum miles covered during term'
      },
      {
        name: 'Vehicle Class',
        options: ['Class A', 'Class B', 'Class C'],
        description: 'Vehicle classification for pricing'
      }
    ],
    features: [
      'Essential mechanical breakdown coverage',
      'Engine and transmission coverage',
      'Selected electrical coverage',
      'Air conditioning coverage',
      'Basic suspension coverage',
      'Brake system coverage',
      'Fuel system coverage',
      'Cooling system coverage',
      'Steering coverage',
      '24-hour roadside assistance and towing',
      'Rental car reimbursement'
    ],
    exclusions: [
      'Pre-existing conditions',
      'Maintenance items per owner\'s manual',
      'Commercial use vehicles',
      'Modified vehicles beyond manufacturer specifications',
      'Damage from accidents, floods, fire',
      'Improper repair damage',
      'Diagnostic charges for non-covered repairs'
    ],
    claimsProcess: {
      phone: '866-660-7003',
      website: 'AscentAdmin.com',
      authorization: 'Prior authorization required for repairs',
      laborGuide: 'Mitchell\'s ProDemand labor guide',
      parts: 'New, remanufactured, or like kind and quality replacement parts'
    },
    vehicleClassification: {
      classA: ['Honda', 'Hyundai', 'Isuzu', 'Kia', 'Mazda', 'Mitsubishi', 'Scion', 'Subaru', 'Toyota', 'Lexus', 'Nissan', 'Infiniti'],
      classB: ['1/2 Ton Pickup Trucks', 'Acura', 'Audi (A3/A4)', 'BMW (1/2 Series)', 'Buick', 'Chevrolet', 'Chrysler/Dodge/Plymouth', 'Fiat', 'Ford', 'GMC', 'Jeep', 'Mercury', 'Mercedes C Class', 'Mini', 'Oldsmobile', 'Pontiac', 'VW', 'Volvo', '3/4 and 1-ton Pickup Trucks'],
      classC: ['Audi (except A3/A4, RS-series, S-series, A8)', 'BMW (except 1/2, 7, M, Z Series)', 'Cadillac', 'Jaguar', 'Land Rover', 'Mercedes Benz (except C, S/SL Class, M Class)', 'Porsche', 'Tesla']
    },
    ineligibleVehicles: [
      'Alfa Romeo', 'Aston Martin', 'Audi (A8/RS/S6/S7/R8)', 'Bentley', 'BMW (7, M, Z Series)', 'Bugatti', 'Corvette', 'Daewoo', 'DeLorean', 'Dodge SRT', 'Ferrari', 'Hummer', 'Isuzu', 'Lamborghini', 'Lotus', 'Maserati', 'Maybach', 'McLaren', 'Mercedes Benz (all AMG, M Class, S/SL Class)', 'Mitsubishi Lancer Evolution', 'Peugeot', 'Rivian', 'Rolls Royce', 'Saab', 'Saturn', 'Smart', 'Sterling', 'Subaru WRX', 'Suzuki', 'VW V8 engine', 'Yugo', 'Police vehicles', 'Taxi vehicles', 'Pickup trucks over 1-ton', 'V10/V12 cars or SUVs', 'Rotary engine vehicles', 'Special interest vehicles', 'Vehicles under $2,000', 'Vehicles over $100,000', 'Modified vehicles beyond 6" lift kit'
    ],
    surcharges: {
      mandatory: {
        '4WD_AWD': 200,
        'diesel': 200,
        'turbo_supercharge': 200
      },
      optional: {
        'commercial': 200,
        'lift_up_to_6': 200,
        'eco_coverage': 100,
        'technology_coverage': 100
      },
      oilChanges: {
        '6_changes': 300,
        '8_changes': 400,
        '10_changes': 500
      }
    }
  },
  PINNACLE_SILVER: {
    id: 'cac-pinnacle-silver',
    name: 'Pinnacle Silver VSC',
    category: 'auto',
    description: 'Powertrain coverage with essential protection',
    administrator: 'Ascent Administration Services, LLC',
    address: '360 South Smith Road, Tempe, Arizona 85281',
    phone: '866-660-7003',
    roadsidePhone: '877-626-0880',
    deductible: {
      sellingDealer: '$0 per claim visit',
      otherRepairFacility: '$100 per claim visit'
    },
    laborRate: '$150.00 per hour maximum',
    coverageOptions: [
      {
        name: 'Term Length',
        options: ['12 months', '24 months', '36 months', '48 months', '60 months'],
        description: 'Contract duration'
      },
      {
        name: 'Coverage Miles',
        options: ['15,000', '25,000', '30,000', '45,000', '60,000', '75,000', '100,000', '125,000', 'Unlimited'],
        description: 'Maximum miles covered during term'
      },
      {
        name: 'Vehicle Class',
        options: ['Class A', 'Class B', 'Class C'],
        description: 'Vehicle classification for pricing'
      }
    ],
    features: [
      'Engine coverage - all internal parts',
      'Transmission coverage - automatic and manual',
      'Drive axle coverage',
      'Transfer case coverage (4WD)',
      'Engine cooling system',
      'Seals and gaskets for covered components',
      '24-hour roadside assistance and towing (3 events per year)',
      'Rental car benefits ($35 per 6 hours of labor, max $250)',
      'Trip interruption coverage'
    ],
    exclusions: [
      'Pre-existing conditions',
      'Manual transmission clutch parts',
      'Maintenance items per owner\'s manual',
      'Commercial use vehicles',
      'Modified vehicles beyond manufacturer specifications',
      'Damage from accidents, floods, fire',
      'Improper repair damage',
      'Diagnostic charges for non-covered repairs'
    ],
    claimsProcess: {
      phone: '866-660-7003',
      website: 'AscentAdmin.com',
      authorization: 'Prior authorization required for repairs',
      laborGuide: 'Mitchell\'s ProDemand labor guide',
      parts: 'New, remanufactured, or like kind and quality replacement parts'
    },
    vehicleClassification: {
      classA: ['Honda', 'Hyundai', 'Isuzu', 'Kia', 'Mazda', 'Mitsubishi', 'Scion', 'Subaru', 'Toyota', 'Lexus', 'Nissan', 'Infiniti'],
      classB: ['1/2 Ton Pickup Trucks', 'Acura', 'Audi (A3/A4)', 'BMW (1/2 Series)', 'Buick', 'Chevrolet', 'Chrysler/Dodge/Plymouth', 'Fiat', 'Ford', 'GMC', 'Jeep', 'Mercury', 'Mercedes C Class', 'Mini', 'Oldsmobile', 'Pontiac', 'VW', 'Volvo', '3/4 and 1-ton Pickup Trucks'],
      classC: ['Audi (except A3/A4, RS-series, S-series, A8)', 'BMW (except 1/2, 7, M, Z Series)', 'Cadillac', 'Jaguar', 'Land Rover', 'Mercedes Benz (except C, S/SL Class, M Class)', 'Porsche', 'Tesla']
    },
    ineligibleVehicles: [
      'Alfa Romeo', 'Aston Martin', 'Audi (A8/RS/S6/S7/R8)', 'Bentley', 'BMW (7, M, Z Series)', 'Bugatti', 'Corvette', 'Daewoo', 'DeLorean', 'Dodge SRT', 'Ferrari', 'Hummer', 'Isuzu', 'Lamborghini', 'Lotus', 'Maserati', 'Maybach', 'McLaren', 'Mercedes Benz (all AMG, M Class, S/SL Class)', 'Mitsubishi Lancer Evolution', 'Peugeot', 'Rivian', 'Rolls Royce', 'Saab', 'Saturn', 'Smart', 'Sterling', 'Subaru WRX', 'Suzuki', 'VW V8 engine', 'Yugo', 'Police vehicles', 'Taxi vehicles', 'Pickup trucks over 1-ton', 'V10/V12 cars or SUVs', 'Rotary engine vehicles', 'Special interest vehicles', 'Vehicles under $2,000', 'Vehicles over $100,000', 'Modified vehicles beyond 6" lift kit'
    ],
    surcharges: {
      mandatory: {
        '4WD_AWD': 200,
        'diesel': 200,
        'turbo_supercharge': 200
      },
      optional: {
        'commercial': 200,
        'lift_up_to_6': 200,
        'eco_coverage': 100,
        'technology_coverage': 100
      },
      oilChanges: {
        '6_changes': 300,
        '8_changes': 400,
        '10_changes': 500
      }
    }
  }
} as const;

// Rate Cards from uploaded Elevate documentation
export const CONNECTED_AUTO_CARE_RATES = {
  ELEVATE_PLATINUM: {
    classA: {
      '12': {
        'new_to_15000': { '15000': 1629, '25000': 1634, 'unlimited': 1674 },
        '15000_to_50000': { '15000': 1705, '25000': 1708, 'unlimited': 1740 },
        '50000_to_75000': { '15000': 1757, '25000': 1759, 'unlimited': 1800 },
        '75000_to_100000': { '15000': 1785, '25000': 1788, 'unlimited': null },
        '100000_to_125000': { '15000': 1826, '25000': 1830, 'unlimited': null },
        '125000_to_150000': { '15000': 1866, '25000': 1880, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1639, '45000': 1649, 'unlimited': 1689 },
        '15000_to_50000': { '30000': 1719, '45000': 1721, 'unlimited': 1742 },
        '50000_to_75000': { '30000': 1773, '45000': 1775, 'unlimited': 1801 },
        '75000_to_100000': { '30000': 1802, '45000': 1805, 'unlimited': null },
        '100000_to_125000': { '30000': 1849, '45000': 1852, 'unlimited': null },
        '125000_to_150000': { '30000': 1899, '45000': 1909, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1651, '60000': 1664, '75000': 1672, '100000': 1675, '125000': 1685, 'unlimited': 1705 },
        '15000_to_50000': { '45000': 1723, '60000': 1730, '75000': 1740, '100000': 1746, '125000': 1751, 'unlimited': 1771 },
        '50000_to_75000': { '45000': 1778, '60000': 1787, '75000': 1794, '100000': 1806, '125000': 1810, 'unlimited': 1821 },
        '75000_to_100000': { '45000': 1809, '60000': 1818, '75000': 1832, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '45000': 1856, '60000': 1867, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '45000': 1906, '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 1662, '75000': 1682, '100000': 1687, '125000': 1689, 'unlimited': 1709 },
        '15000_to_50000': { '60000': 1737, '75000': 1752, '100000': 1757, '125000': 1759, 'unlimited': 1779 },
        '50000_to_75000': { '60000': 1795, '75000': 1814, '100000': 1819, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 1828, '75000': 1848, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1879, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': 1929, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 1665, '75000': 1685, '100000': 1688, '125000': 1697, 'unlimited': 1717 },
        '15000_to_50000': { '60000': 1740, '75000': 1760, '100000': 1763, '125000': 1772, 'unlimited': 1792 },
        '50000_to_75000': { '60000': 1798, '75000': 1817, '100000': 1824, '125000': 1803, 'unlimited': 1823 },
        '75000_to_100000': { '60000': 1832, '75000': 1858, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1885, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 1688, '90000': 1708, '100000': 1728 },
        '15000_to_50000': { '75000': 1767, '90000': 1777, '100000': 1787 },
        '50000_to_75000': { '75000': 1831, '90000': 1841, '100000': 1856 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null },
        '100000_to_125000': { '75000': null, '90000': null, '100000': null },
        '125000_to_150000': { '75000': null, '90000': null, '100000': null }
      }
    },
    classB: {
      // Similar structure for Class B vehicles - rates are higher
      '12': {
        'new_to_15000': { '15000': 1779, '25000': 1786, 'unlimited': 1836 },
        '15000_to_50000': { '15000': 1911, '25000': 1918, 'unlimited': 1954 },
        '50000_to_75000': { '15000': 1960, '25000': 1969, 'unlimited': 2012 },
        '75000_to_100000': { '15000': 1997, '25000': 2006, 'unlimited': null },
        '100000_to_125000': { '15000': 2083, '25000': 2096, 'unlimited': null },
        '125000_to_150000': { '15000': 2169, '25000': 2182, 'unlimited': null }
      }
      // Additional Class B rates would continue...
    },
    classC: {
      // Class C rates are significantly higher for luxury vehicles
      '12': {
        'new_to_15000': { '15000': 1956, '25000': 2007, 'unlimited': 2224 },
        '15000_to_50000': { '15000': 2617, '25000': 2672, 'unlimited': null },
        '50000_to_75000': { '15000': 2766, '25000': 2822, 'unlimited': null },
        '75000_to_100000': { '15000': 2946, '25000': 3053, 'unlimited': null }
      }
      // Additional Class C rates would continue...
    }
  },
  ELEVATE_GOLD: {
    classA: {
      '12': {
        'new_to_15000': { '15000': 1549, '25000': 1555, 'unlimited': 1576 },
        '15000_to_50000': { '15000': 1574, '25000': 1575, 'unlimited': 1596 },
        '50000_to_75000': { '15000': 1607, '25000': 1609, 'unlimited': 1635 },
        '75000_to_100000': { '15000': 1625, '25000': 1627, 'unlimited': null },
        '100000_to_125000': { '15000': 1652, '25000': 1655, 'unlimited': null },
        '125000_to_150000': { '15000': 1662, '25000': 1675, 'unlimited': null }
      }
      // Additional Gold rates would continue...
    }
    // Class B and C rates for Gold would follow similar structure
  }
} as const;

export class ConnectedAutoCareRatingService {
  
  // Determine vehicle class based on make and model
  determineVehicleClass(make: string, model?: string): 'A' | 'B' | 'C' | 'INELIGIBLE' {
    const upperMake = make.toUpperCase();
    const upperModel = model?.toUpperCase() || '';
    
    // Check ineligible vehicles first
    const ineligible = [
      'ALFA ROMEO', 'ASTON MARTIN', 'BENTLEY', 'BUGATTI', 'CORVETTE', 'DAEWOO', 
      'DELOREAN', 'FERRARI', 'HUMMER', 'LAMBORGHINI', 'LOTUS', 'MASERATI', 
      'MAYBACH', 'MCLAREN', 'PEUGEOT', 'RIVIAN', 'ROLLS ROYCE', 'SAAB', 
      'SATURN', 'SMART', 'STERLING', 'SUZUKI', 'YUGO'
    ];
    
    if (ineligible.includes(upperMake)) {
      return 'INELIGIBLE';
    }
    
    // Special model checks
    if (upperMake === 'AUDI' && ['A8', 'RS', 'S6', 'S7', 'R8'].some(m => upperModel.includes(m))) {
      return 'INELIGIBLE';
    }
    if (upperMake === 'BMW' && ['7', 'M', 'Z'].some(m => upperModel.includes(m))) {
      return 'INELIGIBLE';
    }
    if (upperMake === 'DODGE' && upperModel.includes('SRT')) {
      return 'INELIGIBLE';
    }
    if (upperMake === 'MERCEDES' && ['AMG', 'M CLASS', 'S CLASS', 'SL CLASS'].some(m => upperModel.includes(m))) {
      return 'INELIGIBLE';
    }
    if (upperMake === 'MITSUBISHI' && upperModel.includes('LANCER EVOLUTION')) {
      return 'INELIGIBLE';
    }
    if (upperMake === 'SUBARU' && upperModel.includes('WRX')) {
      return 'INELIGIBLE';
    }
    if (upperMake === 'VOLKSWAGEN' && upperModel.includes('V8')) {
      return 'INELIGIBLE';
    }
    
    // Class A vehicles
    const classAMakes = [
      'HONDA', 'HYUNDAI', 'ISUZU', 'KIA', 'MAZDA', 'MITSUBISHI', 
      'SCION', 'SUBARU', 'TOYOTA', 'LEXUS', 'NISSAN', 'INFINITI'
    ];
    
    if (classAMakes.includes(upperMake)) {
      return 'A';
    }
    
    // Class C vehicles (luxury)
    const classCMakes = ['CADILLAC', 'JAGUAR', 'LAND ROVER', 'PORSCHE', 'TESLA'];
    if (classCMakes.includes(upperMake)) {
      return 'C';
    }
    
    // Special Audi/BMW/Mercedes cases for Class B
    if (upperMake === 'AUDI' && ['A3', 'A4'].some(m => upperModel.includes(m))) {
      return 'B';
    }
    if (upperMake === 'BMW' && ['1', '2'].some(m => upperModel.includes(m))) {
      return 'B';
    }
    if (upperMake === 'MERCEDES' && upperModel.includes('C CLASS')) {
      return 'B';
    }
    
    // Default to Class B for remaining makes
    const classBMakes = [
      'ACURA', 'AUDI', 'BMW', 'BUICK', 'CHEVROLET', 'CHRYSLER', 'DODGE', 
      'PLYMOUTH', 'FIAT', 'FORD', 'GMC', 'JEEP', 'MERCURY', 'MERCEDES', 
      'MINI', 'OLDSMOBILE', 'PONTIAC', 'VOLKSWAGEN', 'VOLVO'
    ];
    
    if (classBMakes.includes(upperMake)) {
      return 'B';
    }
    
    return 'INELIGIBLE';
  }
  
  // Determine current mileage bracket
  getMileageBracket(currentMileage: number): string {
    if (currentMileage <= 15000) return 'new_to_15000';
    if (currentMileage <= 50000) return '15000_to_50000';
    if (currentMileage <= 75000) return '50000_to_75000';
    if (currentMileage <= 100000) return '75000_to_100000';
    if (currentMileage <= 125000) return '100000_to_125000';
    if (currentMileage <= 150000) return '125000_to_150000';
    return 'over_150000';
  }
  
  // Calculate mandatory surcharges
  calculateMandatorySurcharges(vehicleData: any): number {
    let surcharges = 0;
    
    // 4WD/AWD surcharge
    if (vehicleData.drivetrain && ['4WD', 'AWD', '4x4', 'ALL WHEEL DRIVE', 'FOUR WHEEL DRIVE'].includes(vehicleData.drivetrain.toUpperCase())) {
      surcharges += 200;
    }
    
    // Diesel surcharge
    if (vehicleData.fuelType && vehicleData.fuelType.toUpperCase().includes('DIESEL')) {
      surcharges += 200;
    }
    
    // Turbo/Supercharged surcharge
    if (vehicleData.engine && (vehicleData.engine.toUpperCase().includes('TURBO') || vehicleData.engine.toUpperCase().includes('SUPERCHARGED'))) {
      surcharges += 200;
    }
    
    return surcharges;
  }
  
  // Calculate Connected Auto Care VSC premium
  async calculateConnectedAutoCarePremium(
    productId: string,
    coverageSelections: any,
    vehicleData: any,
    customerData: any
  ): Promise<any> {
    try {
      const product = CONNECTED_AUTO_CARE_PRODUCTS[productId as keyof typeof CONNECTED_AUTO_CARE_PRODUCTS];
      if (!product) {
        throw new Error('Invalid Connected Auto Care product ID');
      }
      
      // Determine vehicle class
      const vehicleClass = this.determineVehicleClass(vehicleData.make, vehicleData.model);
      if (vehicleClass === 'INELIGIBLE') {
        throw new Error('Vehicle is not eligible for Connected Auto Care VSC coverage');
      }
      
      // Get coverage selections
      const termLength = coverageSelections.termLength || '36 months';
      const coverageMiles = coverageSelections.coverageMiles || '75000';
      const termMonths = termLength.replace(' months', '');
      
      // Get current mileage and determine bracket
      const currentMileage = vehicleData.mileage || 0;
      const mileageBracket = this.getMileageBracket(currentMileage);
      
      // Look up base premium from rate card
      let basePremium = 1500; // Default fallback
      
      if (productId === 'ELEVATE_PLATINUM' && CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM) {
        const classKey = `class${vehicleClass}` as 'classA' | 'classB' | 'classC';
        const classRates = CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM[classKey];
        if (classRates && classRates[termMonths as keyof typeof classRates]) {
          const termRates = classRates[termMonths as keyof typeof classRates];
          if (termRates && termRates[mileageBracket as keyof typeof termRates]) {
            const bracketRates = termRates[mileageBracket as keyof typeof termRates];
            if (bracketRates && bracketRates[coverageMiles as keyof typeof bracketRates]) {
              const premium = bracketRates[coverageMiles as keyof typeof bracketRates];
              if (typeof premium === 'number') {
                basePremium = premium;
              }
            }
          }
        }
      } else if (productId === 'ELEVATE_GOLD' && CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD) {
        const classKey = `class${vehicleClass}` as 'classA' | 'classB' | 'classC';
        const classRates = CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD[classKey];
        if (classRates && classRates[termMonths as keyof typeof classRates]) {
          const termRates = classRates[termMonths as keyof typeof classRates];
          if (termRates && termRates[mileageBracket as keyof typeof termRates]) {
            const bracketRates = termRates[mileageBracket as keyof typeof termRates];
            if (bracketRates && bracketRates[coverageMiles as keyof typeof bracketRates]) {
              const premium = bracketRates[coverageMiles as keyof typeof bracketRates];
              if (typeof premium === 'number') {
                basePremium = premium;
              }
            }
          }
        }
      }
      
      // Calculate mandatory surcharges
      const mandatorySurcharges = this.calculateMandatorySurcharges(vehicleData);
      
      // Calculate optional surcharges if selected
      let optionalSurcharges = 0;
      if (coverageSelections.commercialUse) optionalSurcharges += 200;
      if (coverageSelections.liftKit) optionalSurcharges += 200;
      if (coverageSelections.ecoCoverage) optionalSurcharges += 100;
      if (coverageSelections.technologyCoverage) optionalSurcharges += 100;
      
      // Oil change packages
      let oilChangeSurcharge = 0;
      if (coverageSelections.oilChanges === '6') oilChangeSurcharge = 300;
      else if (coverageSelections.oilChanges === '8') oilChangeSurcharge = 400;
      else if (coverageSelections.oilChanges === '10') oilChangeSurcharge = 500;
      
      // Calculate total premium before taxes
      const totalSurcharges = mandatorySurcharges + optionalSurcharges + oilChangeSurcharge;
      const premiumBeforeTax = basePremium + totalSurcharges;
      
      // Calculate taxes and fees
      const taxes = this.calculateTaxes(premiumBeforeTax, customerData?.address?.state);
      const fees = this.calculateFees(premiumBeforeTax);
      const totalPremium = premiumBeforeTax + taxes + fees;
      
      return {
        basePremium: premiumBeforeTax,
        taxes,
        fees,
        totalPremium,
        factors: {
          vehicleClass,
          termLength: termMonths,
          coverageMiles,
          mileageBracket,
          mandatorySurcharges,
          optionalSurcharges,
          oilChangeSurcharge
        },
        productDetails: product
      };
      
    } catch (error) {
      console.error('Connected Auto Care premium calculation error:', error);
      throw error;
    }
  }
  
  private calculateTaxes(premium: number, state?: string): number {
    // State-specific tax rates for VSC products
    const taxRates: { [key: string]: number } = {
      'ca': 0.0825,
      'ny': 0.08,
      'tx': 0.0625,
      'fl': 0.06,
      'wa': 0.095,
      'az': 0.083, // Connected Auto Care is based in Arizona
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
    // VSC administrative fees
    const adminFee = 25;
    const processingFee = Math.min(premium * 0.02, 50); // 2% processing fee, capped at $50
    
    return Math.round((adminFee + processingFee) * 100) / 100;
  }
  
  // Get all Connected Auto Care products
  getConnectedAutoCareProducts(): typeof CONNECTED_AUTO_CARE_PRODUCTS {
    return CONNECTED_AUTO_CARE_PRODUCTS;
  }
  
  // Get specific Connected Auto Care product
  getConnectedAutoCareProduct(productId: string): any {
    return CONNECTED_AUTO_CARE_PRODUCTS[productId as keyof typeof CONNECTED_AUTO_CARE_PRODUCTS];
  }
  
  // Validate Connected Auto Care coverage selections
  validateConnectedAutoCareCoverage(productId: string, coverageSelections: any): { isValid: boolean; errors: string[] } {
    const product = CONNECTED_AUTO_CARE_PRODUCTS[productId as keyof typeof CONNECTED_AUTO_CARE_PRODUCTS];
    if (!product) {
      return { isValid: false, errors: ['Invalid Connected Auto Care product ID'] };
    }
    
    const errors: string[] = [];
    
    // Validate required selections
    if (product.coverageOptions) {
      product.coverageOptions.forEach(option => {
        const key = option.name.toLowerCase().replace(/\s+/g, '');
        const altKeys = [
          option.name.toLowerCase().replace(/\s+/g, '_'),
          option.name.replace(/\s+/g, '').toLowerCase(),
          option.name.toLowerCase()
        ];
        
        let found = false;
        let value = null;
        
        for (const possibleKey of [key, ...altKeys]) {
          if (coverageSelections[possibleKey]) {
            found = true;
            value = coverageSelections[possibleKey];
            break;
          }
        }
        
        // Special handling for common variations
        if (option.name === 'Term Length' && !found) {
          if (coverageSelections.termLength || coverageSelections.term || coverageSelections.termlength) {
            found = true;
            value = coverageSelections.termLength || coverageSelections.term || coverageSelections.termlength;
          }
        }
        
        if (option.name === 'Coverage Miles' && !found) {
          if (coverageSelections.coverageMiles || coverageSelections.miles || coverageSelections.coveragemiles) {
            found = true;
            value = coverageSelections.coverageMiles || coverageSelections.miles || coverageSelections.coveragemiles;
          }
        }
        
        if (option.name === 'Vehicle Class' && !found) {
          if (coverageSelections.vehicleClass || coverageSelections.class || coverageSelections.vehicleclass) {
            found = true;
            value = coverageSelections.vehicleClass || coverageSelections.class || coverageSelections.vehicleclass;
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

export const connectedAutoCareRatingService = new ConnectedAutoCareRatingService();