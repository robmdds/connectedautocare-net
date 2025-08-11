/**
 * Connected Auto Care VSC Service
 * Handles Elevate and Pinnacle VSC products with authentic rate cards and contract templates
 */

interface CoverageOptions {
  validTermLengths: string[];
  validCoverageMiles: string[];
  reasons?: string[];
}

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
      '12': {
        'new_to_15000': { '15000': 1779, '25000': 1786, 'unlimited': 1836 },
        '15000_to_50000': { '15000': 1911, '25000': 1918, 'unlimited': 1954 },
        '50000_to_75000': { '15000': 1960, '25000': 1969, 'unlimited': 2012 },
        '75000_to_100000': { '15000': 1997, '25000': 2006, 'unlimited': null },
        '100000_to_125000': { '15000': 2083, '25000': 2096, 'unlimited': null },
        '125000_to_150000': { '15000': 2169, '25000': 2182, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1790, '45000': 1801, 'unlimited': 1855 },
        '15000_to_50000': { '30000': 1928, '25000': 1935, 'unlimited': 1979 },
        '50000_to_75000': { '30000': 1981, '45000': 1990, 'unlimited': 2036 },
        '75000_to_100000': { '30000': 2020, '45000': 2029, 'unlimited': null },
        '100000_to_125000': { '30000': 2111, '45000': 2124, 'unlimited': null },
        '125000_to_150000': { '30000': 2202, '45000': 2219, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1802, '60000': 1817, '75000': 1826, '100000': 1830, '125000': 1841, 'unlimited': 1864 },
        '15000_to_50000': { '45000': 1942, '60000': 1951, '75000': 1962, '100000': 1968, '125000': 1975, 'unlimited': 1998 },
        '50000_to_75000': { '45000': 1998, '60000': 2007, '75000': 2016, '100000': 2030, '125000': 2033, 'unlimited': 2047 },
        '75000_to_100000': { '45000': 2038, '60000': 2047, '75000': 2063, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '45000': 2087, '60000': 2098, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '45000': 2142, '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 1815, '75000': 1836, '100000': 1842, '125000': 1844, 'unlimited': 1868 },
        '15000_to_50000': { '60000': 1959, '75000': 1976, '100000': 1982, '125000': 1984, 'unlimited': 2008 },
        '50000_to_75000': { '60000': 2021, '75000': 2040, '100000': 2046, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 2062, '75000': 2083, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 2118, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': 2174, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 1818, '75000': 1839, '100000': 1843, '125000': 1852, 'unlimited': 1876 },
        '15000_to_50000': { '60000': 1962, '75000': 1982, '100000': 1986, '125000': 1996, 'unlimited': 2021 },
        '50000_to_75000': { '60000': 2024, '75000': 2043, '100000': 2051, '125000': 2032, 'unlimited': 2051 },
        '75000_to_100000': { '60000': 2066, '75000': 2091, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 2125, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 1843, '90000': 1868, '100000': 1892 },
        '15000_to_50000': { '75000': 1989, '90000': 2000, '100000': 2011 },
        '50000_to_75000': { '75000': 2058, '90000': 2068, '100000': 2085 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null },
        '100000_to_125000': { '75000': null, '90000': null, '100000': null },
        '125000_to_150000': { '75000': null, '90000': null, '100000': null }
      }
    },
    classC: {
      '12': {
        'new_to_15000': { '15000': 1956, '25000': 2007, 'unlimited': 2224 },
        '15000_to_50000': { '15000': 2617, '25000': 2672, 'unlimited': null },
        '50000_to_75000': { '15000': 2766, '25000': 2822, 'unlimited': null },
        '75000_to_100000': { '15000': 2946, '25000': 3053, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1970, '45000': 2025, 'unlimited': 2252 },
        '15000_to_50000': { '30000': 2645, '45000': 2703, 'unlimited': null },
        '50000_to_75000': { '30000': 2799, '45000': 2858, 'unlimited': null },
        '75000_to_100000': { '30000': 2984, '45000': 3095, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1985, '60000': 2043, '75000': 2060, '100000': 2065, '125000': 2078, 'unlimited': 2281 },
        '15000_to_50000': { '45000': 2674, '60000': 2735, '75000': 2755, '100000': 2761, '125000': 2779, 'unlimited': null },
        '50000_to_75000': { '45000': 2835, '60000': 2896, '75000': 2919, '100000': 2935, '125000': 2940, 'unlimited': null },
        '75000_to_100000': { '45000': 3025, '60000': 3089, '75000': 3116, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 2002, '75000': 2027, '100000': 2034, '125000': 2037, 'unlimited': 2311 },
        '15000_to_50000': { '60000': 2706, '75000': 2734, '100000': 2742, '125000': 2745, 'unlimited': null },
        '50000_to_75000': { '60000': 2872, '75000': 2904, '100000': 2913, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 3068, '75000': 3105, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 2005, '75000': 2030, '100000': 2034, '125000': 2045, 'unlimited': 2341 },
        '15000_to_50000': { '60000': 2709, '75000': 2740, '100000': 2745, '125000': 2758, 'unlimited': null },
        '50000_to_75000': { '60000': 2875, '75000': 2907, '100000': 2916, '125000': 2896, 'unlimited': null },
        '75000_to_100000': { '60000': 3072, '75000': 3110, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 2034, '90000': 2064, '100000': 2094 },
        '15000_to_50000': { '75000': 2748, '90000': 2761, '100000': 2774 },
        '50000_to_75000': { '75000': 2918, '90000': 2931, '100000': 2950 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null }
      }
    }
  },
  ELEVATE_GOLD: {
    classA: {
      '12': {
        'new_to_15000': { '15000': 1465, '25000': 1469, 'unlimited': 1505 },
        '15000_to_50000': { '15000': 1533, '25000': 1536, 'unlimited': 1564 },
        '50000_to_75000': { '15000': 1580, '25000': 1582, 'unlimited': 1620 },
        '75000_to_100000': { '15000': 1604, '25000': 1607, 'unlimited': null },
        '100000_to_125000': { '15000': 1642, '25000': 1646, 'unlimited': null },
        '125000_to_150000': { '15000': 1679, '25000': 1692, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1473, '45000': 1482, 'unlimited': 1519 },
        '15000_to_50000': { '30000': 1546, '45000': 1548, 'unlimited': 1567 },
        '50000_to_75000': { '30000': 1595, '45000': 1597, 'unlimited': 1621 },
        '75000_to_100000': { '30000': 1620, '45000': 1623, 'unlimited': null },
        '100000_to_125000': { '30000': 1663, '45000': 1666, 'unlimited': null },
        '125000_to_150000': { '30000': 1709, '45000': 1717, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1483, '60000': 1495, '75000': 1502, '100000': 1505, '125000': 1514, 'unlimited': 1532 },
        '15000_to_50000': { '45000': 1550, '60000': 1556, '75000': 1564, '100000': 1569, '125000': 1574, 'unlimited': 1592 },
        '50000_to_75000': { '45000': 1600, '60000': 1607, '75000': 1614, '100000': 1625, '125000': 1628, 'unlimited': 1639 },
        '75000_to_100000': { '45000': 1627, '60000': 1634, '75000': 1647, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '45000': 1669, '60000': 1678, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '45000': 1716, '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 1494, '75000': 1512, '100000': 1517, '125000': 1519, 'unlimited': 1537 },
        '15000_to_50000': { '60000': 1563, '75000': 1576, '100000': 1581, '125000': 1583, 'unlimited': 1601 },
        '50000_to_75000': { '60000': 1616, '75000': 1632, '100000': 1637, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 1644, '75000': 1662, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1691, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': 1740, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 1497, '75000': 1515, '100000': 1518, '125000': 1526, 'unlimited': 1544 },
        '15000_to_50000': { '60000': 1566, '75000': 1584, '100000': 1587, '125000': 1595, 'unlimited': 1613 },
        '50000_to_75000': { '60000': 1618, '75000': 1634, '100000': 1640, '125000': 1621, 'unlimited': 1640 },
        '75000_to_100000': { '60000': 1648, '75000': 1672, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1697, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 1519, '90000': 1537, '100000': 1555 },
        '15000_to_50000': { '75000': 1590, '90000': 1600, '100000': 1609 },
        '50000_to_75000': { '75000': 1646, '90000': 1656, '100000': 1670 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null },
        '100000_to_125000': { '75000': null, '90000': null, '100000': null },
        '125000_to_150000': { '75000': null, '90000': null, '100000': null }
      }
    },
    classB: {
      '12': {
        'new_to_15000': { '15000': 1601, '25000': 1607, 'unlimited': 1651 },
        '15000_to_50000': { '15000': 1720, '25000': 1726, 'unlimited': 1759 },
        '50000_to_75000': { '15000': 1764, '25000': 1772, 'unlimited': 1811 },
        '75000_to_100000': { '15000': 1797, '25000': 1805, 'unlimited': null },
        '100000_to_125000': { '15000': 1875, '25000': 1886, 'unlimited': null },
        '125000_to_150000': { '15000': 1952, '25000': 1964, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1612, '45000': 1621, 'unlimited': 1671 },
        '15000_to_50000': { '30000': 1734, '45000': 1741, 'unlimited': 1783 },
        '50000_to_75000': { '30000': 1783, '45000': 1792, 'unlimited': 1831 },
        '75000_to_100000': { '30000': 1818, '45000': 1825, 'unlimited': null },
        '100000_to_125000': { '30000': 1900, '45000': 1912, 'unlimited': null },
        '125000_to_150000': { '30000': 1982, '45000': 1996, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1622, '60000': 1634, '75000': 1642, '100000': 1646, '125000': 1655, 'unlimited': 1684 },
        '15000_to_50000': { '45000': 1751, '60000': 1758, '75000': 1768, '100000': 1773, '125000': 1779, 'unlimited': 1798 },
        '50000_to_75000': { '45000': 1798, '60000': 1806, '75000': 1814, '100000': 1826, '125000': 1829, 'unlimited': 1840 },
        '75000_to_100000': { '45000': 1834, '60000': 1840, '75000': 1854, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '45000': 1878, '60000': 1888, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '45000': 1928, '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 1633, '75000': 1651, '100000': 1656, '125000': 1658, 'unlimited': 1687 },
        '15000_to_50000': { '60000': 1765, '75000': 1779, '100000': 1784, '125000': 1786, 'unlimited': 1807 },
        '50000_to_75000': { '60000': 1818, '75000': 1834, '100000': 1839, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 1856, '75000': 1871, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1906, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': 1956, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 1635, '75000': 1653, '100000': 1657, '125000': 1667, 'unlimited': 1694 },
        '15000_to_50000': { '60000': 1767, '75000': 1784, '100000': 1788, '125000': 1797, 'unlimited': 1818 },
        '50000_to_75000': { '60000': 1820, '75000': 1837, '100000': 1843, '125000': 1829, 'unlimited': 1843 },
        '75000_to_100000': { '60000': 1859, '75000': 1882, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1913, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 1666, '90000': 1684, '100000': 1703 },
        '15000_to_50000': { '75000': 1790, '90000': 1800, '100000': 1810 },
        '50000_to_75000': { '75000': 1850, '90000': 1858, '100000': 1872 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null },
        '100000_to_125000': { '75000': null, '90000': null, '100000': null },
        '125000_to_150000': { '75000': null, '90000': null, '100000': null }
      }
    },
    classC: {
      '12': {
        'new_to_15000': { '15000': 1713, '25000': 1756, 'unlimited': 1946 },
        '15000_to_50000': { '15000': 2290, '25000': 2340, 'unlimited': null },
        '50000_to_75000': { '15000': 2420, '25000': 2469, 'unlimited': null },
        '75000_to_100000': { '15000': 2577, '25000': 2672, 'unlimited': null }
      }
    }
  },
  PINNACLE_SILVER: {
    classA: {
      '12': {
        'new_to_15000': { '15000': 1222, '25000': 1225, 'unlimited': 1256 },
        '15000_to_50000': { '15000': 1279, '25000': 1281, 'unlimited': 1305 },
        '50000_to_75000': { '15000': 1318, '25000': 1319, 'unlimited': 1350 },
        '75000_to_100000': { '15000': 1339, '25000': 1341, 'unlimited': null },
        '100000_to_125000': { '15000': 1371, '25000': 1373, 'unlimited': null },
        '125000_to_150000': { '15000': 1399, '25000': 1410, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1229, '45000': 1236, 'unlimited': 1267 },
        '15000_to_50000': { '30000': 1289, '45000': 1291, 'unlimited': 1307 },
        '50000_to_75000': { '30000': 1328, '45000': 1331, 'unlimited': 1351 },
        '75000_to_100000': { '30000': 1352, '45000': 1354, 'unlimited': null },
        '100000_to_125000': { '30000': 1389, '45000': 1391, 'unlimited': null },
        '125000_to_150000': { '30000': 1424, '45000': 1432, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1238, '60000': 1247, '75000': 1253, '100000': 1256, '125000': 1264, 'unlimited': 1279 },
        '15000_to_50000': { '45000': 1292, '60000': 1298, '75000': 1305, '100000': 1309, '125000': 1313, 'unlimited': 1328 },
        '50000_to_75000': { '45000': 1333, '60000': 1340, '75000': 1345, '100000': 1355, '125000': 1358, 'unlimited': 1366 },
        '75000_to_100000': { '45000': 1357, '60000': 1364, '75000': 1374, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '45000': 1392, '60000': 1400, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '45000': 1430, '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 1247, '75000': 1262, '100000': 1266, '125000': 1267, 'unlimited': 1282 },
        '15000_to_50000': { '60000': 1303, '75000': 1314, '100000': 1318, '125000': 1319, 'unlimited': 1334 },
        '50000_to_75000': { '60000': 1346, '75000': 1361, '100000': 1365, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 1371, '75000': 1388, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1409, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': 1447, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 1249, '75000': 1264, '100000': 1266, '125000': 1273, 'unlimited': 1287 },
        '15000_to_50000': { '60000': 1305, '75000': 1320, '100000': 1322, '125000': 1328, 'unlimited': 1344 },
        '50000_to_75000': { '60000': 1348, '75000': 1361, '100000': 1367, '125000': 1352, 'unlimited': 1368 },
        '75000_to_100000': { '60000': 1374, '75000': 1393, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1416, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 1266, '90000': 1281, '100000': 1296 },
        '15000_to_50000': { '75000': 1325, '90000': 1333, '100000': 1340 },
        '50000_to_75000': { '75000': 1373, '90000': 1381, '100000': 1393 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null },
        '100000_to_125000': { '75000': null, '90000': null, '100000': null },
        '125000_to_150000': { '75000': null, '90000': null, '100000': null }
      }
    },
    classB: {
      '12': {
        'new_to_15000': { '15000': 1334, '25000': 1340, 'unlimited': 1377 },
        '15000_to_50000': { '15000': 1433, '25000': 1439, 'unlimited': 1467 },
        '50000_to_75000': { '15000': 1470, '25000': 1477, 'unlimited': 1510 },
        '75000_to_100000': { '15000': 1498, '25000': 1505, 'unlimited': null },
        '100000_to_125000': { '15000': 1566, '25000': 1577, 'unlimited': null },
        '125000_to_150000': { '15000': 1635, '25000': 1646, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1343, '45000': 1351, 'unlimited': 1392 },
        '15000_to_50000': { '30000': 1446, '45000': 1453, 'unlimited': 1485 },
        '50000_to_75000': { '30000': 1486, '45000': 1494, 'unlimited': 1527 },
        '75000_to_100000': { '30000': 1515, '45000': 1521, 'unlimited': null },
        '100000_to_125000': { '30000': 1584, '45000': 1594, 'unlimited': null },
        '125000_to_150000': { '30000': 1652, '45000': 1664, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1352, '60000': 1362, '75000': 1369, '100000': 1372, '125000': 1379, 'unlimited': 1403 },
        '15000_to_50000': { '45000': 1459, '60000': 1465, '75000': 1473, '100000': 1477, '125000': 1482, 'unlimited': 1498 },
        '50000_to_75000': { '45000': 1498, '60000': 1505, '75000': 1511, '100000': 1521, '125000': 1524, 'unlimited': 1533 },
        '75000_to_100000': { '45000': 1528, '60000': 1533, '75000': 1544, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '45000': 1565, '60000': 1574, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '45000': 1608, '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 1361, '75000': 1376, '100000': 1380, '125000': 1382, 'unlimited': 1407 },
        '15000_to_50000': { '60000': 1470, '75000': 1483, '100000': 1487, '125000': 1489, 'unlimited': 1506 },
        '50000_to_75000': { '60000': 1515, '75000': 1528, '100000': 1532, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 1546, '75000': 1558, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1588, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': 1631, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 1363, '75000': 1378, '100000': 1381, '125000': 1389, 'unlimited': 1413 },
        '15000_to_50000': { '60000': 1472, '75000': 1487, '100000': 1490, '125000': 1497, 'unlimited': 1518 },
        '50000_to_75000': { '60000': 1517, '75000': 1530, '100000': 1535, '125000': 1521, 'unlimited': 1535 },
        '75000_to_100000': { '60000': 1549, '75000': 1567, '100000': null, '125000': null, 'unlimited': null },
        '100000_to_125000': { '60000': 1595, '75000': null, '100000': null, '125000': null, 'unlimited': null },
        '125000_to_150000': { '60000': null, '75000': null, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 1388, '90000': 1402, '100000': 1417 },
        '15000_to_50000': { '75000': 1493, '90000': 1500, '100000': 1508 },
        '50000_to_75000': { '75000': 1540, '90000': 1547, '100000': 1558 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null },
        '100000_to_125000': { '75000': null, '90000': null, '100000': null },
        '125000_to_150000': { '75000': null, '90000': null, '100000': null }
      }
    },
    classC: {
      '12': {
        'new_to_15000': { '15000': 1469, '25000': 1506, 'unlimited': 1669 },
        '15000_to_50000': { '15000': 1963, '25000': 2007, 'unlimited': null },
        '50000_to_75000': { '15000': 2077, '25000': 2117, 'unlimited': null },
        '75000_to_100000': { '15000': 2211, '25000': 2290, 'unlimited': null }
      },
      '24': {
        'new_to_15000': { '30000': 1478, '45000': 1519, 'unlimited': 1689 },
        '15000_to_50000': { '30000': 1984, '45000': 2027, 'unlimited': null },
        '50000_to_75000': { '30000': 2099, '45000': 2143, 'unlimited': null },
        '75000_to_100000': { '30000': 2238, '45000': 2321, 'unlimited': null }
      },
      '36': {
        'new_to_15000': { '45000': 1489, '60000': 1532, '75000': 1545, '100000': 1549, '125000': 1559, 'unlimited': 1711 },
        '15000_to_50000': { '45000': 2006, '60000': 2051, '75000': 2066, '100000': 2071, '125000': 2084, 'unlimited': null },
        '50000_to_75000': { '45000': 2126, '60000': 2172, '75000': 2189, '100000': 2201, '125000': 2205, 'unlimited': null },
        '75000_to_100000': { '45000': 2269, '60000': 2317, '75000': 2337, '100000': null, '125000': null, 'unlimited': null }
      },
      '48': {
        'new_to_15000': { '60000': 1502, '75000': 1521, '100000': 1526, '125000': 1528, 'unlimited': 1733 },
        '15000_to_50000': { '60000': 2030, '75000': 2051, '100000': 2057, '125000': 2059, 'unlimited': null },
        '50000_to_75000': { '60000': 2154, '75000': 2178, '100000': 2185, '125000': null, 'unlimited': null },
        '75000_to_100000': { '60000': 2301, '75000': 2329, '100000': null, '125000': null, 'unlimited': null }
      },
      '60': {
        'new_to_15000': { '60000': 1504, '75000': 1523, '100000': 1526, '125000': 1534, 'unlimited': 1756 },
        '15000_to_50000': { '60000': 2032, '75000': 2055, '100000': 2059, '125000': 2069, 'unlimited': null },
        '50000_to_75000': { '60000': 2156, '75000': 2180, '100000': 2187, '125000': 2172, 'unlimited': null },
        '75000_to_100000': { '60000': 2304, '75000': 2333, '100000': null, '125000': null, 'unlimited': null }
      },
      '72': {
        'new_to_15000': { '75000': 1526, '90000': 1548, '100000': 1571 },
        '15000_to_50000': { '75000': 2061, '90000': 2071, '100000': 2081 },
        '50000_to_75000': { '75000': 2189, '90000': 2198, '100000': 2213 },
        '75000_to_100000': { '75000': null, '90000': null, '100000': null }
      }
    }
  }
} as const;

// Eligibility validation interface
interface EligibilityCheck {
  isEligible: boolean;
  reasons: string[];
  allowSpecialQuote: boolean;
}

export class ConnectedAutoCareRatingService {
  
  // Check vehicle eligibility for Connected Auto Care VSC
  checkEligibility(vehicleData: any, coverageSelections: any): EligibilityCheck {
    const reasons: string[] = [];
    let isEligible = true;
    let allowSpecialQuote = false;

    // STRICT: Check vehicle age (must be 15 years or newer - NO EXCEPTIONS)
    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(vehicleData.year);
    
    // Handle invalid/missing year data
    if (!vehicleYear || vehicleYear < 1990 || vehicleYear > currentYear + 1) {
      isEligible = false;
      allowSpecialQuote = true;
      reasons.push(`Vehicle year (${vehicleData.year}) is invalid or missing. Valid vehicle identification required.`);
    } else {
      const vehicleAge = currentYear - vehicleYear;
      if (vehicleAge > 15) {
        isEligible = false;
        allowSpecialQuote = true;
        reasons.push(`Vehicle is ${vehicleAge} years old (${vehicleYear}). Maximum age is 15 years.`);
      }
    }

    // STRICT: Check mileage limits (must be 150,000 miles or less)
    const currentMileage = parseInt(vehicleData.mileage || 0);
    if (currentMileage > 150000) {
      isEligible = false;
      allowSpecialQuote = true;
      reasons.push(`Vehicle has ${currentMileage.toLocaleString()} miles. Maximum mileage is 150,000 miles.`);
    }

    // STRICT: Check vehicle class (INELIGIBLE means excluded make/model)
    const vehicleClass = this.determineVehicleClass(vehicleData.make, vehicleData.model);
    if (vehicleClass === 'INELIGIBLE') {
      isEligible = false;
      allowSpecialQuote = false; // Excluded vehicles cannot be special quoted
      reasons.push(`${vehicleData.make} ${vehicleData.model || ''} is not eligible for coverage.`);
    }

    // STRICT: Verify rate exists in rate table - NO FALLBACK ALLOWED
    if (isEligible && vehicleClass !== 'INELIGIBLE') {
      const rateExists = this.verifyRateExists(vehicleClass, coverageSelections, currentMileage);
      if (!rateExists.hasRate) {
        isEligible = false;
        allowSpecialQuote = true;
        reasons.push(rateExists.reason);
      }
    }

    return {
      isEligible,
      reasons,
      allowSpecialQuote
    };
  }

  // Verify that an actual rate exists in the rate table for the given parameters
  verifyRateExists(vehicleClass: string, coverageSelections: any, currentMileage: number): { hasRate: boolean; reason: string } {
    const productId = 'ELEVATE_PLATINUM'; // Default for now
    const classKey = `class${vehicleClass}` as 'classA' | 'classB' | 'classC';
    const termMonths = (coverageSelections.termLength || '36 months').replace(' months', '');
    const coverageMiles = (coverageSelections.coverageMiles || '75000').replace(/,/g, '').toLowerCase();
    const mileageBracket = this.getMileageBracket(currentMileage);

    // Check if rate table exists for this product and class
    const productRates = CONNECTED_AUTO_CARE_RATES[productId as keyof typeof CONNECTED_AUTO_CARE_RATES];
    if (!productRates || !productRates[classKey]) {
      return { 
        hasRate: false, 
        reason: `No rate table available for ${vehicleClass} class vehicles` 
      };
    }

    const classRates = productRates[classKey];
    if (!classRates || !classRates[termMonths as keyof typeof classRates]) {
      return { 
        hasRate: false, 
        reason: `${termMonths}-month term not available for ${vehicleClass} class vehicles` 
      };
    }

    const termRates = classRates[termMonths as keyof typeof classRates];
    if (!termRates || !termRates[mileageBracket as keyof typeof termRates]) {
      return { 
        hasRate: false, 
        reason: `No coverage available for vehicles with ${currentMileage.toLocaleString()} miles in ${vehicleClass} class` 
      };
    }

    const bracketRates = termRates[mileageBracket as keyof typeof termRates];
    if (!bracketRates || !bracketRates[coverageMiles as keyof typeof bracketRates] || bracketRates[coverageMiles as keyof typeof bracketRates] === null) {
      return { 
        hasRate: false, 
        reason: `${coverageSelections.coverageMiles} coverage not available for vehicles with ${currentMileage.toLocaleString()} miles` 
      };
    }

    return { hasRate: true, reason: '' };
  }
  
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
      console.log('=== Connected Auto Care Premium Calculation ===');
      console.log('ProductID:', productId);
      console.log('Vehicle Data:', vehicleData);
      console.log('Coverage Selections:', coverageSelections);
      
      // Check eligibility first
      const eligibilityCheck = this.checkEligibility(vehicleData, coverageSelections);
      console.log('Eligibility Check:', eligibilityCheck);

      if (!eligibilityCheck.isEligible) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          productId: productId,
          vehicleData: vehicleData,
          coverageSelections: coverageSelections,
          customerData: customerData,
          basePremium: 0,
          taxes: 0,
          fees: 0,
          totalPremium: 0,
          status: 'ineligible',
          eligibilityReasons: eligibilityCheck.reasons,
          allowSpecialQuote: eligibilityCheck.allowSpecialQuote,
          createdAt: new Date().toISOString()
        };
      }
      
      const product = CONNECTED_AUTO_CARE_PRODUCTS[productId as keyof typeof CONNECTED_AUTO_CARE_PRODUCTS];
      if (!product) {
        throw new Error('Invalid Connected Auto Care product ID');
      }
      
      // Determine vehicle class
      const vehicleClass = this.determineVehicleClass(vehicleData.make, vehicleData.model);
      console.log('Determined Vehicle Class:', vehicleClass);
      if (vehicleClass === 'INELIGIBLE') {
        throw new Error('Vehicle is not eligible for Connected Auto Care VSC coverage');
      }
      
      // Get coverage selections
      const termLength = coverageSelections.termLength || '36 months';
      const rawCoverageMiles = coverageSelections.coverageMiles || '75000';
      // Remove commas from coverage miles to match rate table format
      const coverageMiles = rawCoverageMiles.replace(/,/g, '');
      const termMonths = termLength.replace(' months', '');
      console.log('Term Length:', termLength, '-> Term Months:', termMonths);
      console.log('Coverage Miles (raw):', rawCoverageMiles, '-> Coverage Miles (cleaned):', coverageMiles);
      
      // Get current mileage and determine bracket
      const currentMileage = vehicleData.mileage || 0;
      const mileageBracket = this.getMileageBracket(currentMileage);
      console.log('Current Mileage:', currentMileage, '-> Mileage Bracket:', mileageBracket);
      
      // Look up base premium from rate card - NO FALLBACKS ALLOWED
      let basePremium: number | null = null;
      
      if (productId === 'ELEVATE_PLATINUM' && CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM) {
        const classKey = `class${vehicleClass}` as 'classA' | 'classB' | 'classC';
        console.log('Looking up rate with classKey:', classKey);
        const classRates = CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM[classKey];
        console.log('Class rates found:', !!classRates);
        if (classRates && classRates[termMonths as keyof typeof classRates]) {
          const termRates = classRates[termMonths as keyof typeof classRates];
          console.log('Term rates found:', !!termRates);
          if (termRates && termRates[mileageBracket as keyof typeof termRates]) {
            const bracketRates = termRates[mileageBracket as keyof typeof termRates];
            console.log('Bracket rates found:', !!bracketRates);
            if (bracketRates && bracketRates[coverageMiles as keyof typeof bracketRates]) {
              const premium = bracketRates[coverageMiles as keyof typeof bracketRates];
              console.log('Premium lookup result:', premium);
              if (typeof premium === 'number') {
                basePremium = premium;
                console.log('Base premium set to:', basePremium);
              }
            } else {
              console.log('Available coverage miles for this bracket:', Object.keys(bracketRates || {}));
            }
          } else {
            console.log('Available mileage brackets for this term:', Object.keys(termRates || {}));
          }
        } else {
          console.log('Available term lengths for this class:', Object.keys(classRates || {}));
        }
      } else if (productId === 'ELEVATE_GOLD' && CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD) {
        const classKey = `class${vehicleClass}` as 'classA' | 'classB' | 'classC';
        console.log('Looking up GOLD rate with classKey:', classKey);
        const classRates = CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD[classKey];
        console.log('GOLD Class rates found:', !!classRates);
        if (classRates && classRates[termMonths as keyof typeof classRates]) {
          const termRates = classRates[termMonths as keyof typeof classRates];
          console.log('GOLD Term rates found:', !!termRates);
          if (termRates && termRates[mileageBracket as keyof typeof termRates]) {
            const bracketRates = termRates[mileageBracket as keyof typeof termRates];
            console.log('GOLD Bracket rates found:', !!bracketRates);
            if (bracketRates && bracketRates[coverageMiles as keyof typeof bracketRates]) {
              const premium = bracketRates[coverageMiles as keyof typeof bracketRates];
              console.log('GOLD Premium lookup result:', premium);
              if (typeof premium === 'number') {
                basePremium = premium;
                console.log('GOLD Base premium set to:', basePremium);
              }
            } else {
              console.log('GOLD Available coverage miles for this bracket:', Object.keys(bracketRates || {}));
            }
          } else {
            console.log('GOLD Available mileage brackets for this term:', Object.keys(termRates || {}));
          }
        } else {
          console.log('GOLD Available term lengths for this class:', Object.keys(classRates || {}));
        }
      } else if (productId === 'PINNACLE_SILVER' && CONNECTED_AUTO_CARE_RATES.PINNACLE_SILVER) {
        const classKey = `class${vehicleClass}` as 'classA' | 'classB' | 'classC';
        console.log('Looking up SILVER rate with classKey:', classKey);
        const classRates = CONNECTED_AUTO_CARE_RATES.PINNACLE_SILVER[classKey];
        console.log('SILVER Class rates found:', !!classRates);
        if (classRates && classRates[termMonths as keyof typeof classRates]) {
          const termRates = classRates[termMonths as keyof typeof classRates];
          console.log('SILVER Term rates found:', !!termRates);
          if (termRates && termRates[mileageBracket as keyof typeof termRates]) {
            const bracketRates = termRates[mileageBracket as keyof typeof termRates];
            console.log('SILVER Bracket rates found:', !!bracketRates);
            if (bracketRates && bracketRates[coverageMiles as keyof typeof bracketRates]) {
              const premium = bracketRates[coverageMiles as keyof typeof bracketRates];
              console.log('SILVER Premium lookup result:', premium);
              if (typeof premium === 'number') {
                basePremium = premium;
                console.log('SILVER Base premium set to:', basePremium);
              }
            } else {
              console.log('SILVER Available coverage miles for this bracket:', Object.keys(bracketRates || {}));
            }
          } else {
            console.log('SILVER Available mileage brackets for this term:', Object.keys(termRates || {}));
          }
        } else {
          console.log('SILVER Available term lengths for this class:', Object.keys(classRates || {}));
        }
      }
      
      // STRICT ENFORCEMENT: If no rate found in table, vehicle is ineligible
      if (basePremium === null) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          productId: productId,
          vehicleData: vehicleData,
          coverageSelections: coverageSelections,
          customerData: customerData,
          basePremium: 0,
          taxes: 0,
          fees: 0,
          totalPremium: 0,
          status: 'ineligible',
          eligibilityReasons: [`No rate available for this vehicle configuration: ${vehicleClass} class, ${termMonths} months, ${mileageBracket} mileage, ${coverageMiles} coverage miles`],
          allowSpecialQuote: true,
          createdAt: new Date().toISOString()
        };
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
      
      console.log('=== Final Calculation Summary ===');
      console.log('Base Premium:', basePremium);
      console.log('Mandatory Surcharges:', mandatorySurcharges);
      console.log('Optional Surcharges:', optionalSurcharges);
      console.log('Oil Change Surcharge:', oilChangeSurcharge);
      console.log('Premium Before Tax:', premiumBeforeTax);
      
      // Calculate taxes and fees
      const taxes = this.calculateTaxes(premiumBeforeTax, customerData?.address?.state);
      const fees = this.calculateFees(premiumBeforeTax);
      const totalPremium = premiumBeforeTax + taxes + fees;
      
      console.log('Taxes:', taxes);
      console.log('Fees:', fees);
      console.log('Total Premium:', totalPremium);
      console.log('===========================================');
      
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

  // Get valid coverage options based on vehicle data and current mileage
  getValidCoverageOptions(productId: string, vehicleData: any): CoverageOptions {
    const product = CONNECTED_AUTO_CARE_PRODUCTS[productId as keyof typeof CONNECTED_AUTO_CARE_PRODUCTS];
    if (!product) {
      return { validTermLengths: [], validCoverageMiles: [], reasons: ['Invalid product ID'] };
    }

    // Check basic eligibility first
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - (vehicleData.year || 0);
    const currentMileage = vehicleData.mileage || 0;
    
    // Basic eligibility checks
    if (vehicleAge > 15) {
      return { 
        validTermLengths: [], 
        validCoverageMiles: [], 
        reasons: [`Vehicle is ${vehicleAge} years old. Maximum age is 15 years.`] 
      };
    }
    
    if (currentMileage > 150000) {
      return { 
        validTermLengths: [], 
        validCoverageMiles: [], 
        reasons: [`Vehicle has ${currentMileage.toLocaleString()} miles. Maximum mileage is 150,000 miles.`] 
      };
    }

    // Determine vehicle class
    const vehicleClass = this.determineVehicleClass(vehicleData.make, vehicleData.model);
    if (vehicleClass === 'INELIGIBLE') {
      return { 
        validTermLengths: [], 
        validCoverageMiles: [], 
        reasons: ['Vehicle make/model is not eligible for coverage'] 
      };
    }

    // Get rate table for this product
    let rateTable: any = null;
    if (productId === 'ELEVATE_PLATINUM') {
      rateTable = CONNECTED_AUTO_CARE_RATES.ELEVATE_PLATINUM;
    } else if (productId === 'ELEVATE_GOLD') {
      rateTable = CONNECTED_AUTO_CARE_RATES.ELEVATE_GOLD;
    } else if (productId === 'PINNACLE_SILVER') {
      rateTable = CONNECTED_AUTO_CARE_RATES.PINNACLE_SILVER;
    }

    if (!rateTable) {
      return { validTermLengths: [], validCoverageMiles: [], reasons: ['Rate table not available'] };
    }

    const classKey = `class${vehicleClass}` as 'classA' | 'classB' | 'classC';
    const classRates = rateTable[classKey];
    if (!classRates) {
      return { validTermLengths: [], validCoverageMiles: [], reasons: ['Vehicle class not found in rate table'] };
    }

    // Get current mileage bracket
    const mileageBracket = this.getMileageBracket(currentMileage);
    
    const validTermLengths: string[] = [];
    const validCoverageMiles: string[] = [];
    
    // Check each term length to see if any coverage options are available
    Object.keys(classRates).forEach(termKey => {
      const termRates = classRates[termKey as keyof typeof classRates];
      if (!termRates || !termRates[mileageBracket as keyof typeof termRates]) {
        return; // Skip terms not available for this mileage bracket
      }

      const bracketRates = termRates[mileageBracket as keyof typeof termRates];
      if (!bracketRates) return;

      // Check if any coverage miles are available for this term/mileage combination
      const availableCoverageMiles = Object.keys(bracketRates).filter(miles => {
        const rate = bracketRates[miles as keyof typeof bracketRates];
        return rate !== null && typeof rate === 'number';
      });

      if (availableCoverageMiles.length > 0) {
        // Add term to valid options
        const termMonths = parseInt(termKey);
        validTermLengths.push(`${termMonths} months`);
        
        // Add coverage miles options (with formatting)
        availableCoverageMiles.forEach(miles => {
          if (miles === 'unlimited') {
            if (!validCoverageMiles.includes('Unlimited')) {
              validCoverageMiles.push('Unlimited');
            }
          } else {
            const formattedMiles = parseInt(miles).toLocaleString();
            if (!validCoverageMiles.includes(formattedMiles)) {
              validCoverageMiles.push(formattedMiles);
            }
          }
        });
      }
    });

    // Sort options logically
    validTermLengths.sort((a, b) => {
      const aMonths = parseInt(a.replace(' months', ''));
      const bMonths = parseInt(b.replace(' months', ''));
      return aMonths - bMonths;
    });

    validCoverageMiles.sort((a, b) => {
      if (a === 'Unlimited') return 1;
      if (b === 'Unlimited') return -1;
      const aNum = parseInt(a.replace(/,/g, ''));
      const bNum = parseInt(b.replace(/,/g, ''));
      return aNum - bNum;
    });

    const reasons: string[] = [];
    if (validTermLengths.length === 0) {
      reasons.push('No valid term lengths available for this vehicle and mileage');
    }
    if (validCoverageMiles.length === 0) {
      reasons.push('No valid coverage miles available for this vehicle and mileage');
    }

    return {
      validTermLengths,
      validCoverageMiles,
      reasons: reasons.length > 0 ? reasons : undefined
    };
  }
}

export const connectedAutoCareRatingService = new ConnectedAutoCareRatingService();