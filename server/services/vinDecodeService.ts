export class VinDecodeService {
  async decodeVin(vin: string): Promise<any> {
    // Validate VIN format
    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format');
    }

    try {
      // Primary: Try NHTSA API
      const nhtsa = await this.decodeVinNHTSA(vin);
      if (nhtsa.success) {
        return nhtsa.data;
      }

      // Fallback: Basic VIN structure parsing
      return this.parseVinBasic(vin);
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
    
    // VIN year codes (10th digit)
    const yearCodes: { [key: string]: number } = {
      // 1980s
      'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984, 'F': 1985, 'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989,
      // 1990s
      'L': 1990, 'M': 1991, 'N': 1992, 'P': 1993, 'R': 1994, 'S': 1995, 'T': 1996, 'V': 1997, 'W': 1998, 'X': 1999,
      // 2000s
      'Y': 2000, '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
      // 2010s (repeats)
      // 'A': 2010 would conflict, so we need logic to differentiate
    };
    
    if (yearCodes[yearChar]) {
      year = yearCodes[yearChar];
      
      // Handle the A-K codes that could be 1980s or 2010s
      if (yearChar >= 'A' && yearChar <= 'K') {
        const possibleYears = [yearCodes[yearChar], yearCodes[yearChar] + 30];
        const currentYear = new Date().getFullYear();
        // Choose the year that makes more sense based on context
        year = possibleYears.find(y => y <= currentYear && y >= 1980) || possibleYears[0];
      }
    }

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