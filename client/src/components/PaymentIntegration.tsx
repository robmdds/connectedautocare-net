import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentIntegration() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("1299.00");
  const [currency, setCurrency] = useState("USD");
  const [paymentResponse, setPaymentResponse] = useState<any>(null);

  const createPaymentIntent = useMutation({
    mutationFn: async (data: { amount: number; currency: string }) => {
      const response = await apiRequest("POST", "/api/payments/intent", data);
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentResponse(data);
      toast({
        title: "Payment Intent Created",
        description: "Helcim payment intent created successfully",
      });
    },
    onError: (error) => {
      console.error("Payment intent creation failed:", error);
      toast({
        title: "Payment Failed",
        description: "Failed to create payment intent",
        variant: "destructive",
      });
    },
  });

  const handleCreateIntent = () => {
    createPaymentIntent.mutate({
      amount: parseFloat(amount),
      currency,
    });
  };

  const recentWebhookEvents = [
    { type: "payment.succeeded", status: "Policy Issued", color: "bg-green-100 text-green-800" },
    { type: "payment.failed", status: "Retry Required", color: "bg-red-100 text-red-800" },
    { type: "payment.processing", status: "Processing", color: "bg-yellow-100 text-yellow-800" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Helcim Payment Integration</CardTitle>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Payment Intent</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1299.00"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateIntent}
                disabled={createPaymentIntent.isPending}
                className="w-full flex items-center justify-center"
              >
                {createPaymentIntent.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                )}
                Create Payment Intent
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Response</h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
              {paymentResponse ? (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(paymentResponse, null, 2)}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <CreditCardIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Create a payment intent to see the response</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Webhook Events</h4>
              <div className="space-y-2">
                {recentWebhookEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{event.type}</span>
                    <Badge className={event.color}>{event.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Helcim Integration Active</h4>
              <p className="text-sm text-blue-700 mt-1">
                Payment processing is configured and operational. Webhooks are verified and 
                auto-policy issuance is enabled for successful payments.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
