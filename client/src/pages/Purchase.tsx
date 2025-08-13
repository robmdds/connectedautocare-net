import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";

interface PurchaseForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
}

export default function Purchase() {
  const [, setLocation] = useLocation();
  const [selectedCoverage, setSelectedCoverage] = useState<any>(null);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const form = useForm<PurchaseForm>();

  useEffect(() => {
    const savedCoverage = localStorage.getItem('selectedCoverage');
    if (savedCoverage) {
      const data = JSON.parse(savedCoverage);
      setSelectedCoverage(data.coverage);
      setVehicleInfo(data.vehicle);
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const handlePurchase = async (data: PurchaseForm) => {
    setIsProcessing(true);
    
    try {
      // Process payment via Helcim
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedCoverage.price,
          coverage: selectedCoverage,
          vehicle: vehicleInfo,
          customer: data,
        }),
      });

      if (response.ok) {
        setPurchaseComplete(true);
        // Clear stored data
        localStorage.removeItem('selectedCoverage');
        localStorage.removeItem('currentQuote');
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Purchase Complete!</h2>
            <p className="text-gray-600 mb-4">
              Your Vehicle Service Contract has been activated.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will receive confirmation documents via email within 24 hours.
            </p>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedCoverage || !vehicleInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert>
            <AlertDescription>
              No coverage selected. Please start a new quote.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setLocation('/')} className="mt-4">
            Start New Quote
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => setLocation('/vsc-quote')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quote
          </Button>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">Secure Checkout</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Vehicle</h4>
                <p>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
                <p className="text-sm text-gray-600">VIN: {vehicleInfo.vin}</p>
                <p className="text-sm text-gray-600">Mileage: {vehicleInfo.mileage.toLocaleString()} miles</p>
              </div>

              {/* Coverage Details */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedCoverage.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Term: {selectedCoverage.termMonths} months</div>
                  <div>Miles: {selectedCoverage.coverageMiles.toLocaleString()}</div>
                  <div>Deductible: ${selectedCoverage.deductible}</div>
                  <div>Tier: {selectedCoverage.tier}</div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-2xl text-blue-600">${selectedCoverage.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">One-time payment • No monthly fees</p>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handlePurchase)} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName"
                        {...form.register("firstName", { required: true })}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName"
                        {...form.register("lastName", { required: true })}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      type="email"
                      {...form.register("email", { required: true })}
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      {...form.register("phone", { required: true })}
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <h4 className="font-medium">Billing Address</h4>
                  <div>
                    <Label htmlFor="address.street">Street Address *</Label>
                    <Input 
                      id="address.street"
                      {...form.register("address.street", { required: true })}
                      data-testid="input-address"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="address.city">City *</Label>
                      <Input 
                        id="address.city"
                        {...form.register("address.city", { required: true })}
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address.state">State *</Label>
                      <Input 
                        id="address.state"
                        {...form.register("address.state", { required: true })}
                        placeholder="CA"
                        data-testid="input-state"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address.zipCode">ZIP Code *</Label>
                    <Input 
                      id="address.zipCode"
                      {...form.register("address.zipCode", { required: true })}
                      data-testid="input-zip"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Method</h4>
                  <div>
                    <Label htmlFor="paymentMethod.cardNumber">Card Number *</Label>
                    <Input 
                      id="paymentMethod.cardNumber"
                      {...form.register("paymentMethod.cardNumber", { required: true })}
                      placeholder="1234 5678 9012 3456"
                      data-testid="input-card-number"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="paymentMethod.expiryMonth">Month *</Label>
                      <Input 
                        id="paymentMethod.expiryMonth"
                        {...form.register("paymentMethod.expiryMonth", { required: true })}
                        placeholder="MM"
                        maxLength={2}
                        data-testid="input-expiry-month"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod.expiryYear">Year *</Label>
                      <Input 
                        id="paymentMethod.expiryYear"
                        {...form.register("paymentMethod.expiryYear", { required: true })}
                        placeholder="YY"
                        maxLength={2}
                        data-testid="input-expiry-year"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod.cvv">CVV *</Label>
                      <Input 
                        id="paymentMethod.cvv"
                        {...form.register("paymentMethod.cvv", { required: true })}
                        placeholder="123"
                        maxLength={4}
                        data-testid="input-cvv"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing}
                  data-testid="button-complete-purchase"
                >
                  {isProcessing ? (
                    <>Processing Payment...</>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Purchase - ${selectedCoverage.price.toLocaleString()}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your payment is processed securely. By completing this purchase, you agree to our terms and conditions.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}