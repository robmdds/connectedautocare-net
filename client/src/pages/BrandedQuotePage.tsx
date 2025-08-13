import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrandedQuotePageProps {
  resellerId: string;
  config?: any;
}

export default function BrandedQuotePage({ resellerId, config }: BrandedQuotePageProps) {
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const { data: whitelabelConfig } = useQuery({
    queryKey: [`/api/wholesale/white-label/config/${resellerId}`],
    enabled: !config,
  });

  const brandConfig = config || whitelabelConfig;

  // Apply custom branding
  useEffect(() => {
    if (brandConfig?.branding) {
      const root = document.documentElement;
      if (brandConfig.branding.primaryColor) {
        root.style.setProperty('--primary', brandConfig.branding.primaryColor);
      }
      if (brandConfig.branding.secondaryColor) {
        root.style.setProperty('--secondary', brandConfig.branding.secondaryColor);
      }
    }
  }, [brandConfig]);

  const handleSubmitQuote = () => {
    // Submit quote logic here
    console.log('Quote submitted:', {
      resellerId,
      vin,
      mileage,
      customerEmail,
      customerName,
      selectedProduct,
    });
  };

  if (!brandConfig) {
    return <div className="p-6">Loading...</div>;
  }

  const { branding, products } = brandConfig;
  const availableProducts = Object.entries(products || {})
    .filter(([_, product]: [string, any]) => product.enabled)
    .map(([key, product]: [string, any]) => ({
      key,
      name: key === 'autoAdvantage' ? 'Auto Advantage Program' :
            key === 'homeProtection' ? 'Home Protection Plan' :
            key === 'allVehicle' ? 'All-Vehicle Protection' : key,
      product
    }));

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: 'var(--background)',
        fontFamily: 'var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)'
      }}
    >
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'var(--card)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {branding?.logoUrl && (
              <img 
                src={branding.logoUrl} 
                alt={branding.companyName || 'Company Logo'}
                className="h-10"
                data-testid="branded-logo"
              />
            )}
            <div className="text-right">
              {branding?.companyName && (
                <h1 className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                  {branding.companyName}
                </h1>
              )}
              {branding?.tagline && (
                <p className="text-muted-foreground">{branding.tagline}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              {brandConfig.pages?.landingPage?.title || 'Get Your Protection Quote'}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {brandConfig.pages?.landingPage?.heroText || 'Protect your vehicle with comprehensive coverage'}
            </p>
          </div>

          {/* Quote Form */}
          <Card>
            <CardHeader>
              <CardTitle>Get Your Free Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer-name">Full Name *</Label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Email Address *</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    data-testid="input-customer-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="product-select">Protection Plan *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Select a protection plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(({ key, name }) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vin-input">Vehicle VIN</Label>
                  <Input
                    id="vin-input"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="Enter 17-character VIN"
                    maxLength={17}
                    data-testid="input-vin"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Found on dashboard, driver's door frame, or registration
                  </p>
                </div>
                <div>
                  <Label htmlFor="mileage-input">Current Mileage</Label>
                  <Input
                    id="mileage-input"
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="Enter current miles"
                    data-testid="input-mileage"
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSubmitQuote}
                style={{ 
                  backgroundColor: branding?.primaryColor || 'hsl(var(--primary))',
                  borderColor: branding?.primaryColor || 'hsl(var(--primary))'
                }}
                disabled={!customerName || !customerEmail || !selectedProduct}
                data-testid="button-get-quote"
              >
                {brandConfig.pages?.landingPage?.ctaText || 'Get My Free Quote'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                No obligation • Instant results • Secure & confidential
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          {brandConfig.pages?.landingPage?.features && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-center mb-6">Why Choose Us?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandConfig.pages.landingPage.features.map((feature: string, index: number) => (
                  <div key={index} className="text-center p-4">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: `${branding?.primaryColor || '#2563eb'}20` }}
                    >
                      <span 
                        className="text-lg font-bold"
                        style={{ color: branding?.primaryColor || '#2563eb' }}
                      >
                        ✓
                      </span>
                    </div>
                    <p className="text-sm font-medium">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ backgroundColor: 'var(--card)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            {branding?.contactPhone && (
              <p className="mb-2">
                Call us: <a href={`tel:${branding.contactPhone}`} className="text-primary hover:underline">
                  {branding.contactPhone}
                </a>
              </p>
            )}
            {branding?.contactEmail && (
              <p className="mb-2">
                Email: <a href={`mailto:${branding.contactEmail}`} className="text-primary hover:underline">
                  {branding.contactEmail}
                </a>
              </p>
            )}
            <p>© 2025 {branding?.companyName || 'Insurance Partners'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}