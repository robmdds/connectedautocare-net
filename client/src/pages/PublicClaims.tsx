import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Shield,
  Camera,
  Receipt,
  UserCheck
} from "lucide-react";
import { Link } from "wouter";

export default function PublicClaims() {
  const claimSteps = [
    {
      step: 1,
      title: "Report Your Claim",
      description: "Contact us immediately after an incident",
      details: [
        "Call our 24/7 claims hotline",
        "Submit online through customer portal", 
        "Email claims department",
        "Have your policy number ready"
      ],
      icon: Phone
    },
    {
      step: 2,
      title: "Gather Documentation",
      description: "Collect necessary supporting documents",
      details: [
        "Take photos of damage",
        "Collect repair estimates",
        "Save all receipts",
        "Complete claim forms"
      ],
      icon: Camera
    },
    {
      step: 3,
      title: "Submit Required Documents",
      description: "Provide all documentation for review",
      details: [
        "Upload through secure portal",
        "Email to claims department",
        "Fax to claims office",
        "Mail original documents if required"
      ],
      icon: FileText
    },
    {
      step: 4,
      title: "Claim Review & Processing",
      description: "Our team reviews your claim",
      details: [
        "Initial review within 48 hours",
        "Adjuster assignment if needed",
        "Additional documentation requests",
        "Coverage verification"
      ],
      icon: UserCheck
    },
    {
      step: 5,
      title: "Resolution & Payment",
      description: "Claim approval and reimbursement",
      details: [
        "Claim decision notification",
        "Payment processing",
        "Direct deposit or check",
        "Claim closure documentation"
      ],
      icon: CheckCircle2
    }
  ];

  const productClaimInfo = [
    {
      product: "Auto Advantage (ADR)",
      description: "Deductible reimbursement for auto insurance claims",
      requirements: [
        "Valid auto insurance policy",
        "Proof of deductible payment to insurance company", 
        "Completed ADR claim form",
        "Copy of insurance claim settlement"
      ],
      timeframes: [
        "Report within 60 days of insurance claim",
        "Submit documentation within 90 days",
        "Processing time: 10-15 business days"
      ],
      maxBenefit: "Up to $500 per claim"
    },
    {
      product: "Home Protection Plan (HPP)",
      description: "Coverage for home repairs and emergency services",
      requirements: [
        "Photo documentation of damage/issue",
        "Service provider estimates or receipts",
        "Completed HPP claim form", 
        "Proof of covered incident"
      ],
      timeframes: [
        "Report emergency claims immediately",
        "Non-emergency claims within 30 days",
        "Processing time: 5-10 business days"
      ],
      maxBenefit: "$500 per occurrence, $1,000 annual cap"
    },
    {
      product: "All-Vehicle Protection (APS)",
      description: "Multi-vehicle mechanical repair reimbursement",
      requirements: [
        "Covered vehicle registration",
        "Mechanical repair receipts",
        "Completed APS claim form",
        "Proof of vehicle ownership"
      ],
      timeframes: [
        "Report within 30 days of repair",
        "Submit receipts within 45 days",
        "Processing time: 7-14 business days"
      ],
      maxBenefit: "20% of covered repair costs"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">File a Claim</h1>
            <p className="text-xl text-gray-600">Quick and easy claims process for all our insurance products</p>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-white border-b" aria-label="Breadcrumb">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">Claims</li>
          </ol>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Emergency Contact */}


        {/* Contact Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How to File Your Claim</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Phone className="mx-auto mb-3 h-8 w-8 text-blue-600" />
                <CardTitle>Call Claims Department</CardTitle>
                <CardDescription>Speak directly with a claims specialist</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-gray-900 mb-2">1-800-555-0123</p>
                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  24/7 Available
                </div>
                <Button className="w-full">Call Now</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="mx-auto mb-3 h-8 w-8 text-green-600" />
                <CardTitle>Email Claims</CardTitle>
                <CardDescription>Submit documentation electronically</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">claims@tpaplatform.com</p>
                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  Response within 4 hours
                </div>
                <Button variant="outline" className="w-full">Send Email</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-purple-600" />
                <CardTitle>Online Portal</CardTitle>
                <CardDescription>Access your customer account</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">Customer Portal</p>
                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  Available 24/7
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/api/login">Login to Portal</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Claims Process Steps */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Claims Process</h2>
          <div className="space-y-6">
            {claimSteps.map((step, index) => (
              <Card key={step.step}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <step.icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Badge className="mr-3">Step {step.step}</Badge>
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Product-Specific Information */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Product-Specific Requirements</h2>
          <div className="space-y-6">
            {productClaimInfo.map((product, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{product.product}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
                      <ul className="space-y-2">
                        {product.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start">
                            <Receipt className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Important Timeframes</h4>
                      <ul className="space-y-2">
                        {product.timeframes.map((timeframe, timeIndex) => (
                          <li key={timeIndex} className="flex items-start">
                            <Clock className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{timeframe}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Maximum Benefit</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-lg font-semibold text-green-800">{product.maxBenefit}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-blue-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Your Claim?</h2>
            <p className="text-gray-600 mb-6">Our claims specialists are here to guide you through every step of the process.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Call Claims Support
              </Button>
              <Button variant="outline" size="lg" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Questions
              </Button>
            </div>
            <Separator className="my-6" />
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Claims Department</h3>
                <p>Monday-Friday: 8 AM - 8 PM EST</p>
                <p>Saturday: 9 AM - 5 PM EST</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Emergency Hotline</h3>
                <p>24/7 Available</p>
                <p>For urgent claims only</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Response Times</h3>
                <p>Phone: Immediate</p>
                <p>Email: Within 4 hours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}