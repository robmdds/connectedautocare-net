import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function WhitelabelConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resellerId] = useState('reseller-001'); // In production, get from auth context

  // Branding state
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Domain state
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [sslEnabled, setSslEnabled] = useState(true);

  // Product configuration
  const [productConfig, setProductConfig] = useState({
    autoAdvantage: { enabled: true, markup: 15, commission: 12 },
    homeProtection: { enabled: true, markup: 20, commission: 15 },
    allVehicle: { enabled: true, markup: 18, commission: 10 },
  });

  // Page content
  const [heroText, setHeroText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [companyStory, setCompanyStory] = useState('');

  const { data: config, isLoading } = useQuery({
    queryKey: [`/api/wholesale/white-label/config/${resellerId}`],
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      return apiRequest(`/api/wholesale/white-label/config/${resellerId}`, {
        method: 'PUT',
        body: JSON.stringify(configData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wholesale/white-label/config/${resellerId}`] });
      toast({
        title: "Configuration Updated",
        description: "Your white-label configuration has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update white-label configuration.",
        variant: "destructive",
      });
    },
  });

  const setupDomainMutation = useMutation({
    mutationFn: async (domainData: any) => {
      return apiRequest('/api/wholesale/white-label/domain', {
        method: 'POST',
        body: JSON.stringify(domainData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Domain Configuration Started",
        description: `Domain setup in progress. Estimated completion: ${data.estimatedCompletion}`,
      });
    },
  });

  // Load existing configuration
  useEffect(() => {
    if (config) {
      // Branding
      setLogoUrl(config.branding?.logoUrl || '');
      setPrimaryColor(config.branding?.primaryColor || '#2563eb');
      setSecondaryColor(config.branding?.secondaryColor || '#1e40af');
      setCompanyName(config.branding?.companyName || '');
      setTagline(config.branding?.tagline || '');
      setContactPhone(config.branding?.contactPhone || '');
      setContactEmail(config.branding?.contactEmail || '');

      // Domain
      setSubdomain(config.domain?.subdomain || '');
      setCustomDomain(config.domain?.customDomain || '');
      setSslEnabled(config.domain?.sslEnabled !== false);

      // Products
      if (config.products) {
        setProductConfig(config.products);
      }

      // Pages
      setHeroText(config.pages?.landingPage?.heroText || '');
      setCtaText(config.pages?.landingPage?.ctaText || '');
      setCompanyStory(config.pages?.aboutPage?.companyStory || '');
    }
  }, [config]);

  const handleSaveConfiguration = () => {
    const configData = {
      branding: {
        logoUrl,
        primaryColor,
        secondaryColor,
        companyName,
        tagline,
        contactPhone,
        contactEmail,
      },
      domain: {
        subdomain,
        customDomain,
        sslEnabled,
      },
      products: productConfig,
      pages: {
        landingPage: { heroText, ctaText },
        aboutPage: { companyStory },
      },
    };

    updateConfigMutation.mutate(configData);
  };

  const handleDomainSetup = () => {
    setupDomainMutation.mutate({
      resellerId,
      subdomain,
      customDomain,
      sslRequired: sslEnabled,
    });
  };

  const handleProductToggle = (productKey: string, enabled: boolean) => {
    setProductConfig(prev => ({
      ...prev,
      [productKey]: { ...prev[productKey], enabled }
    }));
  };

  const handleProductMarkup = (productKey: string, markup: number) => {
    setProductConfig(prev => ({
      ...prev,
      [productKey]: { ...prev[productKey], markup }
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="whitelabel-config">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">White-label Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Customize your branded portal, subdomain, and embedded widgets for your customers.
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="domain">Domain Setup</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Configure your company branding and visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Name"
                    data-testid="input-company-name"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Your company tagline"
                    data-testid="input-tagline"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://your-domain.com/logo.png"
                  data-testid="input-logo-url"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20"
                      data-testid="input-primary-color"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="1-800-YOUR-COMPANY"
                    data-testid="input-contact-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@yourcompany.com"
                    data-testid="input-contact-email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
              <CardDescription>
                Customize the content on your branded pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-text">Landing Page Hero Text</Label>
                <Textarea
                  id="hero-text"
                  value={heroText}
                  onChange={(e) => setHeroText(e.target.value)}
                  placeholder="Protect your most valuable assets with our trusted coverage solutions"
                  data-testid="textarea-hero-text"
                />
              </div>

              <div>
                <Label htmlFor="cta-text">Call-to-Action Button Text</Label>
                <Input
                  id="cta-text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Get Your Free Quote Today"
                  data-testid="input-cta-text"
                />
              </div>

              <div>
                <Label htmlFor="company-story">Company Story</Label>
                <Textarea
                  id="company-story"
                  value={companyStory}
                  onChange={(e) => setCompanyStory(e.target.value)}
                  placeholder="Tell your customers about your company's mission and values"
                  rows={4}
                  data-testid="textarea-company-story"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Configuration</CardTitle>
              <CardDescription>
                Set up your custom subdomain or connect your own domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="yourcompany"
                    className="flex-1"
                    data-testid="input-subdomain"
                  />
                  <span className="text-sm text-muted-foreground">.tpaplatform.com</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your customers will access your portal at: <strong>{subdomain || 'yourcompany'}.tpaplatform.com</strong>
                </p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                <Input
                  id="custom-domain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="insurance.yourcompany.com"
                  data-testid="input-custom-domain"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use your own domain for a fully branded experience. You'll need to configure DNS settings.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ssl-enabled"
                  checked={sslEnabled}
                  onCheckedChange={setSslEnabled}
                  data-testid="switch-ssl-enabled"
                />
                <Label htmlFor="ssl-enabled">Enable SSL Certificate</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDomainSetup}
                  disabled={setupDomainMutation.isPending}
                  data-testid="button-setup-domain"
                >
                  {setupDomainMutation.isPending ? 'Setting up...' : 'Configure Domain'}
                </Button>
              </div>

              {config?.domain?.domainStatus && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Domain Status</span>
                    <Badge variant={config.domain.domainStatus === 'active' ? 'default' : 'secondary'}>
                      {config.domain.domainStatus}
                    </Badge>
                  </div>
                  {config.domain.dnsCname && (
                    <p className="text-sm text-muted-foreground mt-2">
                      DNS CNAME: {config.domain.dnsCname}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Configuration</CardTitle>
              <CardDescription>
                Choose which products to offer and set your markup rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(productConfig).map(([key, product]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={product.enabled}
                        onCheckedChange={(enabled) => handleProductToggle(key, enabled)}
                        data-testid={`switch-product-${key}`}
                      />
                      <div>
                        <h4 className="font-medium">
                          {key === 'autoAdvantage' && 'Auto Advantage Program'}
                          {key === 'homeProtection' && 'Home Protection Plan'}
                          {key === 'allVehicle' && 'All-Vehicle Protection'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Commission: {product.commission}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`markup-${key}`} className="text-sm">Markup:</Label>
                      <Input
                        id={`markup-${key}`}
                        type="number"
                        value={product.markup}
                        onChange={(e) => handleProductMarkup(key, parseInt(e.target.value) || 0)}
                        className="w-20"
                        min="0"
                        max="100"
                        disabled={!product.enabled}
                        data-testid={`input-markup-${key}`}
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-6">
          <WidgetConfigurationSection resellerId={resellerId} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveConfiguration}
          disabled={updateConfigMutation.isPending}
          size="lg"
          data-testid="button-save-config"
        >
          {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}

function WidgetConfigurationSection({ resellerId }: { resellerId: string }) {
  const { data: widgetData } = useQuery({
    queryKey: [`/api/wholesale/white-label/quote-widget/${resellerId}`],
  });

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (widgetData?.widgetCode) {
      navigator.clipboard.writeText(widgetData.widgetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Embeddable Quote Widget</CardTitle>
          <CardDescription>
            Add this quote widget to any webpage to capture leads directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {widgetData && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Widget Code</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    data-testid="button-copy-widget-code"
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>
                <Textarea
                  value={widgetData.widgetCode}
                  readOnly
                  rows={10}
                  className="font-mono text-sm"
                  data-testid="textarea-widget-code"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Widget Preview URL</Label>
                  <Input
                    value={widgetData.previewUrl}
                    readOnly
                    className="text-sm"
                    data-testid="input-preview-url"
                  />
                </div>
                <div>
                  <Label>Documentation</Label>
                  <Input
                    value={widgetData.documentation}
                    readOnly
                    className="text-sm"
                    data-testid="input-documentation-url"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Integration Instructions:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Copy the widget code above</li>
                  <li>Paste it into your website's HTML where you want the quote form to appear</li>
                  <li>The widget will automatically match your branding configuration</li>
                  <li>Leads will be sent directly to your wholesale dashboard</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}