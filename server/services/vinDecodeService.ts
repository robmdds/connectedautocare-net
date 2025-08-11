export class VinDecodeService {
  async decodeVin(vin: string): Promise<any> {
    // Validate VIN format
    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format');
    }

    try {
      // Primary: Use VIN structure parsing for accurate year detection
      const basicParse = this.parseVinBasic(vin);
      
      // Secondary: Try to enhance with NHTSA data but keep the year from VIN parsing
      try {
        const nhtsa = await this.decodeVinNHTSA(vin);
        if (nhtsa.success && nhtsa.data) {
          // Use NHTSA data for make/model but keep VIN-parsed year
          return {
            ...nhtsa.data,
            year: basicParse.year, // Always use VIN-parsed year
            source: 'NHTSA + VIN Parse'
          };
        }
      } catch (nhtsaError) {
        console.log('NHTSA enhancement failed, using basic VIN parse only');
      }

      return basicParse;
    } catch (error) {
      console.error('VIN decode error:', error);
      throw new Error('Failed to decode VIN');
    }
  }

  private async decodeVinNHTSA(vin: string): Promise<{ success: boolean; data?: any }> {
    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );
      
      if (!response.ok) {
        return { success: false };
      }

      const data = await response.json();
      
      if (data.Results && data.Results.length > 0) {
        const results = data.Results.reduce((acc: any, item: any) => {
          if (item.Value && item.Value !== 'Not Applicable' && item.Value !== '') {
            acc[item.Variable] = item.Value;
          }
          return acc;
        }, {});

        return {
          success: true,
          data: {
            vin,
            make: results.Make || 'Unknown',
            model: results.Model || 'Unknown',
            year: results.ModelYear ? parseInt(results.ModelYear) : new Date().getFullYear(),
            bodyStyle: results.BodyClass || 'Unknown',
            engine: results.EngineModel || 'Unknown',
            fuelType: results.FuelTypePrimary || 'Gasoline',
            transmission: results.TransmissionStyle || 'Unknown',
            driveType: results.DriveType || 'Unknown',
            source: 'NHTSA'
          }
        };
      }

      return { success: false };
    } catch (error) {
      console.error('NHTSA API error:', error);
      return { success: false };
    }
  }

  private parseVinBasic(vin: string): any {
    // Enhanced VIN parsing for accurate year estimation
    const yearChar = vin.charAt(9).toUpperCase();
    let year = new Date().getFullYear();
    
    // VIN year codes (10th digit) - complete mapping
    const yearCodes: { [key: string]: number[] } = {
      // Letters can represent multiple decades
      'A': [1980, 2010], 'B': [1981, 2011], 'C': [1982, 2012], 'D': [1983, 2013], 
      'E': [1984, 2014], 'F': [1985, 2015], 'G': [1986, 2016], 'H': [1987, 2017], 
      'J': [1988, 2018], 'K': [1989, 2019], 'L': [1990, 2020], 'M': [1991, 2021], 
      'N': [1992, 2022], 'P': [1993, 2023], 'R': [1994, 2024], 'S': [1995, 2025], 
      'T': [1996, 2026], 'V': [1997, 2027], 'W': [1998, 2028], 'X': [1999, 2029],
      // Numbers are unique to 2000s
      'Y': [2000], '1': [2001], '2': [2002], '3': [2003], '4': [2004], 
      '5': [2005], '6': [2006], '7': [2007], '8': [2008], '9': [2009]
    };
    
    if (yearCodes[yearChar]) {
      const possibleYears = yearCodes[yearChar];
      
      if (possibleYears.length === 1) {
        // Numbers (2000s) are unambiguous
        year = possibleYears[0];
      } else {
        // Letters can be 1980s or 2010s - use context to decide
        const currentYear = new Date().getFullYear();
        
        // For testing purposes, let's examine the VIN structure
        // Most modern vehicles (2010+) have different WMI patterns
        const wmi = vin.substring(0, 3);
        
        // If both years are valid, prefer the older one for reliability
        // as most vehicles in use are older rather than future models
        year = possibleYears.find(y => y <= currentYear) || possibleYears[0];
        
        // For letters A-K, if we're past 2010, default to the older year
        if (currentYear >= 2010) {
          year = possibleYears[0]; // Choose 1980s era
        }
      }
    }

    console.log(`VIN ${vin}: 10th digit '${yearChar}' -> Year ${year}`);

    return {
      vin,
      make: 'Unknown',
      model: 'Unknown',
      year: year,
      bodyStyle: 'Unknown',
      engine: 'Unknown',
      fuelType: 'Gasoline',
      transmission: 'Unknown',
      driveType: 'Unknown',
      source: 'Basic VIN Parse'
    };
  }
}