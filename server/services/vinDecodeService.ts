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
    // Basic VIN parsing for year estimation
    const yearChar = vin.charAt(9);
    const yearCode = yearChar.charCodeAt(0);
    
    let year = new Date().getFullYear();
    if (yearCode >= 65 && yearCode <= 90) { // A-Z
      year = 2010 + (yearCode - 65);
    } else if (yearCode >= 49 && yearCode <= 57) { // 1-9
      year = 2001 + (yearCode - 49);
    }

    return {
      vin,
      make: 'Unknown',
      model: 'Unknown',
      year,
      bodyStyle: 'Unknown',
      engine: 'Unknown',
      fuelType: 'Gasoline',
      transmission: 'Unknown',
      driveType: 'Unknown',
      source: 'Basic Parser'
    };
  }
}