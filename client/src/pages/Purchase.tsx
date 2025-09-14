import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";

// Declare Helcim global function
declare global {
    interface Window {
        helcimProcess: () => Promise<string>;
    }
}

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
    const [customerInfo, setCustomerInfo] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(10);
    const [paymentError, setPaymentError] = useState('');
    const [helcimLoaded, setHelcimLoaded] = useState(false);

    const form = useForm<PurchaseForm>();

    // Prevent Helcim redirects during payment processing
    useEffect(() => {
        if (!isProcessing) return;

        console.log("🔒 Activating redirect prevention during payment...");

        // Block any navigation during payment processing
        const blockNavigation = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Payment is being processed...';
            return e.returnValue;
        };

        // Override location methods to prevent Helcim redirects
        const originalAssign = window.location.assign;
        const originalReplace = window.location.replace;
        const originalHref = window.location.href;

        window.location.assign = (url) => {
            console.log("🚫 Blocked navigation attempt to:", url);
            return undefined as any;
        };

        window.location.replace = (url) => {
            console.log("🚫 Blocked replace attempt to:", url);
            return undefined as any;
        };

        // Block form submissions
        const preventFormSubmission = (e: Event) => {
            console.log("🚫 Preventing form submission during payment");
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        document.addEventListener('submit', preventFormSubmission, true);
        window.addEventListener('beforeunload', blockNavigation);

        return () => {
            console.log("🔓 Removing redirect prevention...");
            // Restore original functions
            window.location.assign = originalAssign;
            window.location.replace = originalReplace;
            document.removeEventListener('submit', preventFormSubmission, true);
            window.removeEventListener('beforeunload', blockNavigation);
        };
    }, [isProcessing]);

    // Debug navigation attempts
    useEffect(() => {
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function(...args) {
            console.log("🔍 Navigation attempt (pushState):", args[2]); // URL is the 3rd argument
            return originalPushState.apply(this, args);
        };

        window.history.replaceState = function(...args) {
            console.log("🔍 Navigation attempt (replaceState):", args[2]);
            return originalReplaceState.apply(this, args);
        };

        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
        };
    }, []);

    // Check if Helcim is loaded
    useEffect(() => {
        const checkHelcimLoaded = () => {
            if (typeof window.helcimProcess === 'function') {
                console.log("✅ Helcim script loaded successfully");
                setHelcimLoaded(true);
                return true;
            }
            return false;
        };

        if (checkHelcimLoaded()) return;

        const interval = setInterval(() => {
            if (checkHelcimLoaded()) {
                clearInterval(interval);
            }
        }, 100);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            if (!helcimLoaded) {
                console.error("❌ Helcim script failed to load after 10 seconds");
                setPaymentError('Payment system is loading. Please wait a moment and try again.');
            }
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [helcimLoaded]);

    useEffect(() => {
        const savedCoverage = localStorage.getItem('selectedCoverage');
        if (savedCoverage) {
            const data = JSON.parse(savedCoverage);
            setSelectedCoverage(data.coverage);
            setVehicleInfo(data.vehicle);
            setCustomerInfo(data.customer);

            if (data.customer) {
                const nameParts = data.customer.name.split(' ');
                form.setValue('firstName', nameParts[0] || '');
                form.setValue('lastName', nameParts.slice(1).join(' ') || '');
                form.setValue('email', data.customer.email || '');
                form.setValue('address.zipCode', data.customer.zipcode || '');
            }
        } else {
            setLocation('/');
        }
    }, [setLocation, form]);

    // Auto-redirect countdown effect
    useEffect(() => {
        if (showSuccessModal && redirectCountdown > 0) {
            const timer = setTimeout(() => {
                setRedirectCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showSuccessModal && redirectCountdown === 0) {
            setLocation('/');
        }
    }, [showSuccessModal, redirectCountdown, setLocation]);

    // Create hidden fields that Helcim.js expects
    const createHelcimFields = (formData: PurchaseForm) => {
        const container = document.body;
        cleanupHelcimFields();

        const fields = [
            { id: 'token', value: 'de2a5120a337b055a082b5' },
            { id: 'amount', value: selectedCoverage?.price.toString() || '0' },
            { id: 'currency', value: 'USD' },
            { id: 'orderNumber', value: `VSC-${Date.now()}` },
            { id: 'cardNumber', value: formData.paymentMethod.cardNumber.replace(/\s/g, '') },
            { id: 'cardExpiry', value: formData.paymentMethod.expiryMonth + formData.paymentMethod.expiryYear },
            { id: 'cardCVV', value: formData.paymentMethod.cvv },
            { id: 'cardHolderName', value: `${formData.firstName} ${formData.lastName}` },
            { id: 'cardHolderAddress', value: formData.address.street },
            { id: 'cardHolderPostalCode', value: formData.address.zipCode },
            { id: 'billing_contactName', value: `${formData.firstName} ${formData.lastName}` },
            { id: 'billing_street1', value: formData.address.street },
            { id: 'billing_city', value: formData.address.city },
            { id: 'billing_province', value: formData.address.state },
            { id: 'billing_postalCode', value: formData.address.zipCode },
            { id: 'billing_country', value: 'US' },
            { id: 'billing_email', value: formData.email },
            { id: 'billing_phone', value: formData.phone },
        ];

        fields.forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.id = field.id;
            input.name = field.id;
            input.value = field.value;
            input.className = 'helcim-field';
            container.appendChild(input);
        });

        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'helcimResults';
        resultsDiv.style.display = 'none';
        resultsDiv.className = 'helcim-field';
        container.appendChild(resultsDiv);

        const formRef = document.createElement('form');
        formRef.id = 'helcimForm';
        formRef.name = 'helcimForm';
        formRef.style.display = 'none';
        formRef.className = 'helcim-field';
        container.appendChild(formRef);
    };

    const cleanupHelcimFields = () => {
        const helcimFields = document.querySelectorAll('.helcim-field');
        helcimFields.forEach(field => {
            if (field.parentNode) {
                field.parentNode.removeChild(field);
            }
        });
    };

    const handlePurchase = async (formData: PurchaseForm) => {
        console.log("🚀 Starting purchase process...");
        setIsProcessing(true);
        setPaymentError('');

        try {
            if (!helcimLoaded || typeof window.helcimProcess !== 'function') {
                throw new Error('Payment system is still loading. Please wait a moment and try again.');
            }

            console.log("💳 Starting payment process with Helcim...");
            createHelcimFields(formData);
            console.log("💳 Calling Helcim payment processor...");

            const helcimResult = await window.helcimProcess();
            console.log("💳 Helcim response received:", helcimResult);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = helcimResult;

            const responseField = tempDiv.querySelector('#response');
            const transactionIdField = tempDiv.querySelector('#transactionId');
            const approvalCodeField = tempDiv.querySelector('#approvalCode');
            const responseMessageField = tempDiv.querySelector('#responseMessage');

            console.log("💳 Payment response code:", responseField?.getAttribute('value'));
            console.log("💳 Transaction ID:", transactionIdField?.getAttribute('value'));
            console.log("💳 Response message:", responseMessageField?.getAttribute('value'));

            if (!responseField || responseField.getAttribute('value') !== '1') {
                const errorMessage = responseMessageField?.getAttribute('value') || 
                                'Payment was declined. Please check your payment information and try again.';
                
                console.log("❌ Payment declined:", errorMessage);
                throw new Error(errorMessage);
            }

            console.log("✅ Payment approved, creating policy...");

            const response = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: selectedCoverage.price,
                    coverage: selectedCoverage,
                    vehicle: vehicleInfo,
                    customer: {
                        ...formData,
                        helcimTransactionId: transactionIdField?.getAttribute('value'),
                        helcimApprovalCode: approvalCodeField?.getAttribute('value'),
                        helcimResponse: helcimResult
                    }
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log("✅ Policy created successfully");

                localStorage.removeItem('selectedCoverage');
                localStorage.removeItem('currentQuote');
                sessionStorage.removeItem('vscQuoteData');

                form.reset();

                setPurchaseComplete(true);
                setShowSuccessModal(true);
                setRedirectCountdown(10);
            } else {
                console.error("❌ Policy creation failed after successful payment:", result.error);
                throw new Error(result.error || 'Policy creation failed after payment. Please contact support with your transaction details.');
            }
        } catch (error) {
            console.error('💥 Purchase error:', error);
            
            const errorMessage = error instanceof Error ? error.message : 'Payment processing failed. Please try again.';
            
            console.log("🔍 Current URL after error:", window.location.href);
            setPaymentError(errorMessage);
            
            // Ensure we stay on the purchase page
            const currentPath = window.location.pathname;
            if (currentPath !== '/purchase') {
                console.log("🔄 Restoring URL to /purchase");
                window.history.replaceState(null, '', '/purchase');
            }
        } finally {
            cleanupHelcimFields();
            setIsProcessing(false);
            console.log("🏁 Purchase process completed");
        }
    };

    const handleGoToHome = () => {
        setShowSuccessModal(false);
        setLocation('/');
    };

    const PaymentErrorAlert = () => {
        if (!paymentError) return null;

        return (
            <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertDescription className="text-red-800">
                    <div className="space-y-2">
                        <div className="font-medium">Payment Failed</div>
                        <div>{paymentError}</div>
                        {paymentError.toLowerCase().includes('expired') && (
                            <div className="text-sm text-red-600 mt-2">
                                Please check your card expiration date and try again.
                            </div>
                        )}
                        {paymentError.toLowerCase().includes('declined') && (
                            <div className="text-sm text-red-600 mt-2">
                                Please verify your card information or try a different payment method.
                            </div>
                        )}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPaymentError('')}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    };

    const SuccessModal = () => (
        <Dialog open={showSuccessModal} onOpenChange={() => {}}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        Payment Successful!
                    </DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-4">
                    <div className="space-y-2">
                        <p className="text-gray-600 font-medium">
                            Your Vehicle Service Contract has been activated.
                        </p>
                        <p className="text-sm text-gray-500">
                            You will receive confirmation documents via email within 24 hours.
                        </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg text-left">
                        <h4 className="font-semibold text-green-800 mb-2">Transaction Summary</h4>
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                                <span>Coverage:</span>
                                <span className="font-medium">{selectedCoverage?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">${selectedCoverage?.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Vehicle:</span>
                                <span className="font-medium">
                                    {vehicleInfo?.year} {vehicleInfo?.make} {vehicleInfo?.model}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            Redirecting to home in <span className="font-bold">{redirectCountdown}</span> seconds...
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Button onClick={handleGoToHome} className="w-full" size="lg">
                            Go to Home Now
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full"
                        >
                            Stay on This Page
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    const HelcimLoadingAlert = () => {
        if (helcimLoaded) return null;

        return (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                        <span>Payment system is loading... Please wait before submitting payment.</span>
                    </div>
                </AlertDescription>
            </Alert>
        );
    };

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
            <SuccessModal />

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (!purchaseComplete && !isProcessing) {
                                setLocation('/vsc-quote');
                            } else {
                                setLocation('/');
                            }
                        }}
                        disabled={isProcessing}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {purchaseComplete ? 'Back to Home' : 'Back to Quote'}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Secure Checkout</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold mb-2">Vehicle</h4>
                                <p>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
                                <p className="text-sm text-gray-600">VIN: {vehicleInfo.vin}</p>
                                <p className="text-sm text-gray-600">Mileage: {vehicleInfo.mileage.toLocaleString()} miles</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold mb-2">{selectedCoverage.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Term: {selectedCoverage.termMonths} months</div>
                                    <div>Miles: {selectedCoverage.coverageMiles.toLocaleString()}</div>
                                    <div>Deductible: ${selectedCoverage.deductible}</div>
                                    <div>Tier: {selectedCoverage.tier}</div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total Amount:</span>
                                    <span className="text-2xl text-blue-600">${selectedCoverage.price.toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">One-time payment • No monthly fees</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <HelcimLoadingAlert />
                                <PaymentErrorAlert />

                                <div className="space-y-4">
                                    <h4 className="font-medium">Customer Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">First Name *</Label>
                                            <Input
                                                id="firstName"
                                                {...form.register("firstName", { required: true })}
                                                data-testid="input-first-name"
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Last Name *</Label>
                                            <Input
                                                id="lastName"
                                                {...form.register("lastName", { required: true })}
                                                data-testid="input-last-name"
                                                disabled={isProcessing}
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
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            {...form.register("phone", { required: true })}
                                            data-testid="input-phone"
                                            disabled={isProcessing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">Billing Address</h4>
                                    <div>
                                        <Label htmlFor="address.street">Street Address *</Label>
                                        <Input
                                            id="address.street"
                                            {...form.register("address.street", { required: true })}
                                            data-testid="input-address"
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <Label htmlFor="address.city">City *</Label>
                                            <Input
                                                id="address.city"
                                                {...form.register("address.city", { required: true })}
                                                data-testid="input-city"
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="address.state">State *</Label>
                                            <Input
                                                id="address.state"
                                                {...form.register("address.state", { required: true })}
                                                placeholder="CA"
                                                data-testid="input-state"
                                                disabled={isProcessing}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="address.zipCode">ZIP Code *</Label>
                                        <Input
                                            id="address.zipCode"
                                            {...form.register("address.zipCode", { required: true })}
                                            data-testid="input-zip"
                                            disabled={isProcessing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">Payment Method</h4>
                                    <div>
                                        <Label htmlFor="paymentMethod.cardNumber">Card Number *</Label>
                                        <Input
                                            id="paymentMethod.cardNumber"
                                            {...form.register("paymentMethod.cardNumber", { required: true })}
                                            placeholder="1234 5678 9012 3456"
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                if (value.replace(/\s/g, '').length <= 16) {
                                                    e.target.value = value;
                                                }
                                            }}
                                            data-testid="input-card-number"
                                            disabled={isProcessing}
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
                                                disabled={isProcessing}
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
                                                disabled={isProcessing}
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
                                                disabled={isProcessing}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        
                                        if (!isProcessing && !purchaseComplete && helcimLoaded) {
                                            form.handleSubmit(handlePurchase)(e);
                                        }
                                    }}
                                    className="w-full"
                                    size="lg"
                                    disabled={isProcessing || purchaseComplete || !helcimLoaded}
                                    data-testid="button-complete-purchase"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processing Payment...
                                        </div>
                                    ) : !helcimLoaded ? (
                                        <>Payment System Loading...</>
                                    ) : paymentError ? (
                                        <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Retry Payment - ${selectedCoverage.price.toLocaleString()}
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-4 w-4 mr-2" />
                                            Complete Purchase - ${selectedCoverage.price.toLocaleString()}
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    Your payment is processed securely by Helcim. By completing this purchase, you agree to our terms and conditions.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}