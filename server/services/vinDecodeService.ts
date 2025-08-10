interface VehicleData {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  engineSize?: string;
  fuelType?: string;
  vehicleValue?: number;
  success: boolean;
  source: 'chromedata' | 'nhtsa' | 'manual';
}

export class VinDecodeService {
  private chromedataApiKey: string;
  private nhtsaApiBase: string;

  constructor() {
    this.chromedataApiKey = process.env.CHROMEDATA_API_KEY || '';
    this.nhtsaApiBase = 'https://vpic.nhtsa.dot.gov/api';
  }

  async decodeVin(vin: string): Promise<VehicleData> {
    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format');
    }

    // Try ChromeData first (if API key available)
    if (this.chromedataApiKey) {
      try {
        const chromedataResult = await this.decodeWithChromedata(vin);
        if (chromedataResult.success) {
          return chromedataResult;
        }
      } catch (error) {
        console.error('ChromeData decode failed:', error);
      }
    }

    // Fallback to NHTSA
    try {
      const nhtsaResult = await this.decodeWithNhtsa(vin);
      return nhtsaResult;
    } catch (error) {
      console.error('NHTSA decode failed:', error);
      throw new Error('VIN decode failed from all sources');
    }
  }

  private async decodeWithChromedata(vin: string): Promise<VehicleData> {
    try {
      const response = await fetch('https://api.chromedata.com/vehicles/decode', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.chromedataApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vin }),
      });

      if (!response.ok) {
        throw new Error(`ChromeData API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        vin,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim,
        bodyStyle: data.bodyStyle,
        engineSize: data.engine?.displacement,
        fuelType: data.engine?.fuelType,
        vehicleValue: data.valuation?.msrp,
        success: true,
        source: 'chromedata',
      };
    } catch (error) {
      console.error('ChromeData decode error:', error);
      throw error;
    }
  }

  private async decodeWithNhtsa(vin: string): Promise<VehicleData> {
    try {
      const response = await fetch(
        `${this.nhtsaApiBase}/vehicles/DecodeVinValues/${vin}?format=json`
      );

      if (!response.ok) {
        throw new Error(`NHTSA API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.Results?.[0];

      if (!result || result.ErrorCode !== '0') {
        throw new Error('NHTSA decode failed');
      }

      return {
        vin,
        year: parseInt(result.ModelYear) || 0,
        make: result.Make || '',
        model: result.Model || '',
        trim: result.Trim,
        bodyStyle: result.BodyClass,
        engineSize: result.DisplacementL ? `${result.DisplacementL}L` : undefined,
        fuelType: result.FuelTypePrimary,
        success: true,
        source: 'nhtsa',
      };
    } catch (error) {
      console.error('NHTSA decode error:', error);
      throw error;
    }
  }

  async getVehicleValue(year: number, make: string, model: string, trim?: string): Promise<number | null> {
    if (!this.chromedataApiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.chromedata.com/vehicles/valuation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.chromedataApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          make,
          model,
          trim,
          mileage: 50000, // Default mileage for valuation
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.values?.retail || data.values?.msrp || null;
    } catch (error) {
      console.error('Vehicle valuation error:', error);
      return null;
    }
  }
}
