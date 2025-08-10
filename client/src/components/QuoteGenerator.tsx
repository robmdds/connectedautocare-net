import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CalculatorIcon, CarIcon, MapPinIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const quoteSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  vehicleVin: z.string().optional(),
  vehicleYear: z.string().min(4, "Valid year required"),
  vehicleMake: z.string().min(1, "Make is required"),
  vehicleModel: z.string().min(1, "Model is required"),
  vehicleMileage: z.string().optional(),
  coverageComprehensive: z.boolean().default(false),
  coverageCollision: z.boolean().default(false),
  coverageLiability: z.boolean().default(true),
  deductible: z.string().default("500"),
  address: z.object({
    street: z.string().min(1, "Street address required"),
    city: z.string().min(1, "City required"),
    state: z.string().min(2, "State required"),
    zipCode: z.string().min(5, "Zip code required"),
  }),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export default function QuoteGenerator() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [vinDecodeData, setVinDecodeData] = useState<any>(null);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      coverageLiability: true,
      deductible: "500",
    },
  });

  const vinDecodeMutation = useMutation({
    mutationFn: async (vin: string) => {
      const response = await apiRequest("POST", "/api/vehicles/decode", { vin });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setVinDecodeData(data);
        form.setValue("vehicleYear", data.year?.toString() || "");
        form.setValue("vehicleMake", data.make || "");
        form.setValue("vehicleModel", data.model || "");
        toast({
          title: "VIN Decoded Successfully",
          description: `${data.year} ${data.make} ${data.model}`,
        });
      } else {
        toast({
          title: "VIN Decode Failed",
          description: "Please enter vehicle details manually",
          variant: "destructive",
        });
      }
    },
  });

  const generateQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response.json();
    },
    onSuccess: (data) => {
      setQuoteResult(data);
      setCurrentStep(4);
      toast({
        title: "Quote Generated",
        description: `Quote ${data.quoteNumber} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: (error) => {
      toast({
        title: "Quote Generation Failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
    },
  });

  const handleVinDecode = () => {
    const vin = form.getValues("vehicleVin");
    if (vin && vin.length === 17) {
      vinDecodeMutation.mutate(vin);
    } else {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: QuoteFormData) => {
    const quoteData = {
      tenantId: "default", // Would be dynamic in real app
      productId: products?.[0]?.id || "default",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerAddress: data.address,
      coverageSelections: {
        comprehensive: data.coverageComprehensive,
        collision: data.coverageCollision,
        liability: data.coverageLiability,
        deductible: data.deductible,
      },
      vehicleData: {
        vin: data.vehicleVin,
        year: parseInt(data.vehicleYear),
        make: data.vehicleMake,
        model: data.vehicleModel,
        mileage: data.vehicleMileage ? parseInt(data.vehicleMileage) : undefined,
      },
    };

    generateQuoteMutation.mutate(quoteData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  {...form.register("customerName")}
                  placeholder="John Smith"
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.customerName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...form.register("customerEmail")}
                  placeholder="john@example.com"
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.customerEmail.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  {...form.register("customerPhone")}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
            
            {/* VIN Decoder */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <Label htmlFor="vehicleVin">VIN (Optional - Auto-fills vehicle details)</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="vehicleVin"
                  {...form.register("vehicleVin")}
                  placeholder="1HGBH41JXMN109186"
                  maxLength={17}
                />
                <Button
                  type="button"
                  onClick={handleVinDecode}
                  disabled={vinDecodeMutation.isPending}
                  variant="outline"
                >
                  {vinDecodeMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <>
                      <CarIcon className="w-4 h-4 mr-2" />
                      Decode
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vehicleYear">Year *</Label>
                <Input
                  id="vehicleYear"
                  {...form.register("vehicleYear")}
                  placeholder="2020"
                />
                {form.formState.errors.vehicleYear && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.vehicleYear.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="vehicleMake">Make *</Label>
                <Input
                  id="vehicleMake"
                  {...form.register("vehicleMake")}
                  placeholder="Toyota"
                />
                {form.formState.errors.vehicleMake && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.vehicleMake.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="vehicleModel">Model *</Label>
                <Input
                  id="vehicleModel"
                  {...form.register("vehicleModel")}
                  placeholder="Camry"
                />
                {form.formState.errors.vehicleModel && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.vehicleModel.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="vehicleMileage">Mileage</Label>
              <Input
                id="vehicleMileage"
                {...form.register("vehicleMileage")}
                placeholder="50000"
              />
            </div>

            {vinDecodeData && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">VIN Decode Result</h4>
                <p className="text-sm text-green-700">
                  {vinDecodeData.year} {vinDecodeData.make} {vinDecodeData.model}
                  {vinDecodeData.trim && ` ${vinDecodeData.trim}`}
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Coverage & Address</h3>
            
            {/* Address */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address.street">Street Address *</Label>
                  <Input
                    id="address.street"
                    {...form.register("address.street")}
                    placeholder="123 Main St"
                  />
                  {form.formState.errors.address?.street && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.street.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address.city">City *</Label>
                  <Input
                    id="address.city"
                    {...form.register("address.city")}
                    placeholder="Los Angeles"
                  />
                  {form.formState.errors.address?.city && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address.state">State *</Label>
                  <Input
                    id="address.state"
                    {...form.register("address.state")}
                    placeholder="CA"
                  />
                  {form.formState.errors.address?.state && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.state.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address.zipCode">Zip Code *</Label>
                  <Input
                    id="address.zipCode"
                    {...form.register("address.zipCode")}
                    placeholder="90210"
                  />
                  {form.formState.errors.address?.zipCode && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.zipCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Coverage Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Coverage Options</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coverageLiability"
                    checked={form.watch("coverageLiability")}
                    onCheckedChange={(checked) => form.setValue("coverageLiability", !!checked)}
                  />
                  <Label htmlFor="coverageLiability">Liability Coverage (Required)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coverageComprehensive"
                    checked={form.watch("coverageComprehensive")}
                    onCheckedChange={(checked) => form.setValue("coverageComprehensive", !!checked)}
                  />
                  <Label htmlFor="coverageComprehensive">Comprehensive Coverage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coverageCollision"
                    checked={form.watch("coverageCollision")}
                    onCheckedChange={(checked) => form.setValue("coverageCollision", !!checked)}
                  />
                  <Label htmlFor="coverageCollision">Collision Coverage</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="deductible">Deductible</Label>
                <Select
                  value={form.watch("deductible")}
                  onValueChange={(value) => form.setValue("deductible", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="250">$250</SelectItem>
                    <SelectItem value="500">$500</SelectItem>
                    <SelectItem value="1000">$1,000</SelectItem>
                    <SelectItem value="2500">$2,500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quote Generated</h3>
            {quoteResult && (
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="flex items-center mb-4">
                  <CalculatorIcon className="w-6 h-6 text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-green-900">
                    Quote #{quoteResult.quoteNumber}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Base Premium:</p>
                    <p className="font-semibold">${parseFloat(quoteResult.basePremium).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Taxes & Fees:</p>
                    <p className="font-semibold">
                      ${(parseFloat(quoteResult.taxes) + parseFloat(quoteResult.fees)).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-green-200">
                    <p className="text-gray-600">Total Premium:</p>
                    <p className="text-xl font-bold text-green-900">
                      ${parseFloat(quoteResult.totalPremium).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <Button className="flex-1">
                    Purchase Policy
                  </Button>
                  <Button variant="outline">
                    Email Quote
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const steps = ["Customer Info", "Vehicle Details", "Coverage & Address", "Quote Result"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalculatorIcon className="w-5 h-5 mr-2" />
          Quote Generator
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center space-x-4 mt-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index < steps.length - 1 ? "flex-1" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 === currentStep
                    ? "bg-primary text-white"
                    : index + 1 < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">{step}</span>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-gray-200">
                  <div
                    className={`h-full ${
                      index + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {renderStep()}
          
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || currentStep === 4}
            >
              Previous
            </Button>
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : currentStep === 3 ? (
              <Button
                type="submit"
                disabled={generateQuoteMutation.isPending}
              >
                {generateQuoteMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                Generate Quote
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setQuoteResult(null);
                  form.reset();
                }}
              >
                New Quote
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
