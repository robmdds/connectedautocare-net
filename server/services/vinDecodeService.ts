export class VinDecodeService {
  async decodeVin(vin: string): Promise<any> {
    // Validate VIN format
    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format');
    }

    try {
      // Primary: Try NHTSA API first - most reliable
      const nhtsa = await this.decodeVinNHTSA(vin);
      if (nhtsa.success && nhtsa.data && nhtsa.data.year) {
        return nhtsa.data;
      }

      // Fallback: Enhanced VIN structure parsing
      return this.parseVinBasic(vin);
    } catch (error) {
      console.error('VIN decode error:', error);
      throw new Error('Failed to decode VIN');
    }
  }

  private async decodeVinNHTSA(vin: string): Promise<{ success: boolean; data?: any }> {
    try {
      console.log(`NHTSA API request for VIN: ${vin}`);
      // Try different NHTSA API endpoints for better data (Extended versions provide more complete data)
      const endpoints = [
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/${vin}?format=json`,
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`,
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      ];
      
      for (const endpoint of endpoints) {
        console.log(`Trying NHTSA endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          console.log(`NHTSA API response not ok: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`NHTSA raw response structure:`, {
          hasResults: !!data.Results,
          resultsLength: data.Results?.length,
          firstResult: data.Results?.[0]
        });
        
        if (data.Results && data.Results.length > 0) {
          // Handle different response formats
          let results: any = {};
          
          if (endpoint.includes('decodevinvalues') || endpoint.includes('DecodeVinValues')) {
            // decodevinvalues and DecodeVinValuesExtended return data directly in first result
            results = data.Results[0] || {};
            console.log(`${endpoint.includes('Extended') ? 'Extended ' : ''}decodevinvalues format - direct fields:`, {
              Make: results.Make,
              Model: results.Model,
              ModelYear: results.ModelYear,
              BodyClass: results.BodyClass
            });
          } else {
            // decodevin and DecodeVinExtended return Variable/Value pairs
            results = data.Results.reduce((acc: any, item: any) => {
              if (item.Value && item.Value !== 'Not Applicable' && item.Value !== '' && item.Value !== null) {
                acc[item.Variable] = item.Value;
              }
              return acc;
            }, {});
            console.log(`${endpoint.includes('Extended') ? 'Extended ' : ''}decodevin format - Variable/Value pairs:`, {
              Make: results.Make,
              Model: results.Model,
              ModelYear: results.ModelYear,
              BodyClass: results.BodyClass
            });
          }

          // Enhanced data extraction - use manufacturer info even if Make/Model are missing
          const manufacturer = results.Manufacturer || '';
          let extractedMake = results.Make || '';
          let extractedModel = results.Model || '';
          
          // Extract make from manufacturer if Make field is empty
          if (!extractedMake && manufacturer) {
            if (manufacturer.includes('NISSAN')) {
              extractedMake = 'NISSAN';
            } else if (manufacturer.includes('HONDA')) {
              extractedMake = 'HONDA';
            } else if (manufacturer.includes('TOYOTA')) {
              extractedMake = 'TOYOTA';
            } else if (manufacturer.includes('FORD')) {
              extractedMake = 'FORD';
            } else if (manufacturer.includes('GENERAL MOTORS') || manufacturer.includes('GM')) {
              extractedMake = 'CHEVROLET';
            }
            // Add more manufacturer mappings as needed
          }
          
          // For Nissan/Infiniti VINs, try to extract model from VIN structure if model is missing
          if (!extractedModel && (extractedMake === 'NISSAN' || extractedMake === 'INFINITI')) {
            const vinCode = vin.substring(3, 8); // Characters 4-8 often contain model info
            if (vinCode.startsWith('AZ2')) {
              // JN8AZ2 pattern can be both Armada (Nissan) and QX80 (Infiniti)
              if (extractedMake === 'INFINITI') {
                extractedModel = 'QX80';
              } else {
                extractedModel = 'ARMADA';
              }
            }
          }

          // Handle Infiniti/Nissan relationship - they share platforms
          if (extractedMake === 'INFINITI' && extractedModel === 'QX80') {
            // QX80 is luxury version of Armada - note this in the data
            extractedModel = 'QX80 (Armada Platform)';
          }

          // Check if we have useful data - relaxed criteria to use manufacturer info
          const hasManufacturer = manufacturer && manufacturer.length > 0;
          const hasYear = results.ModelYear && parseInt(results.ModelYear) > 1980;
          
          if (hasYear && hasManufacturer) {
            const year = parseInt(results.ModelYear);
            console.log(`NHTSA SUCCESS: Found year ${year} for ${extractedMake} ${extractedModel} (from ${manufacturer})`);
            
            return {
              success: true,
              data: {
                vin,
                make: extractedMake || 'Unknown',
                model: extractedModel || 'Unknown', 
                year: year,
                bodyStyle: results.BodyClass || results.VehicleType || 'Unknown',
                engine: results.EngineModel || 'Unknown',
                fuelType: results.FuelTypePrimary || 'Gasoline',
                transmission: results.TransmissionStyle || 'Unknown',
                driveType: results.DriveType || 'Unknown',
                source: 'NHTSA Enhanced'
              }
            };
          }
        }
      }

      console.log('NHTSA API: No useful data returned from any endpoint');
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
        
        // For ambiguous letters, choose the most recent valid year
        // Modern VINs are more likely to be 2010+ than 1980s vehicles still in use
        const validYears = possibleYears.filter(y => y <= currentYear);
        
        if (validYears.length > 0) {
          // Choose the most recent valid year (2010s over 1980s/1990s)
          year = Math.max(...validYears);
        } else {
          year = possibleYears[0];
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