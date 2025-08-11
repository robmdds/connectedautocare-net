import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { VSCQuoteWidget } from '@/components/VSCQuoteWidget';

export default function ConnectedAutoCarePage() {
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const { toast } = useToast();

  const handleQuoteSelect = (quote: any) => {
    setSelectedQuote(quote);
    toast({
      title: "Coverage Selected",
      description: `Selected ${quote.productName} for $${quote.totalPremium.toLocaleString()}`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Connected Auto Care VSC</h1>
        <p className="text-xl text-gray-600 mb-4">
          Premium vehicle service contracts with comprehensive coverage
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <span className="text-blue-600 font-semibold text-sm">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Administrator Information</h3>
              <p className="text-sm text-blue-700">
                <strong>Ascent Administration Services, LLC</strong><br />
                360 South Smith Road, Tempe, Arizona 85281<br />
                Phone: 866-660-7003 | Roadside: 877-626-0880
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Efficient Quote Widget */}
      <VSCQuoteWidget onQuoteSelect={handleQuoteSelect} />

      {/* Selected Quote Details */}
      {selectedQuote && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Selected Quote Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">{selectedQuote.productName}</h3>
                <p className="text-green-700">
                  Total Premium: <span className="font-bold">${selectedQuote.totalPremium.toLocaleString()}</span>
                </p>
                <p className="text-green-700">
                  Monthly Payment: <span className="font-bold">${selectedQuote.monthlyPremium}/month</span>
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {selectedQuote.termLength} • {selectedQuote.coverageMiles} miles • ${selectedQuote.deductible} deductible
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}