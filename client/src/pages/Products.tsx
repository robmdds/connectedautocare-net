import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Car, Home, Download, CheckCircle, Phone, Globe } from "lucide-react";
import { Link } from "wouter";

export default function Products() {
  const products = [
    {
      id: "auto-advantage",
      name: "Auto Advantage Program (ADR)",
      category: "Vehicle Protection",
      description: "Comprehensive auto protection with deductible reimbursement and identity theft restoration",
      features: [
        "Deductible Reimbursement Coverage",
        "Identity Theft Restoration Services", 
        "Warranty Vault Documentation",
        "Emergency Travel Assistance",
        "24/7 Customer Support"
      ],
      termOptions: "1-7 Years",
      targetAudience: "Insurance Agents, Financial Institutions, Auto Customers",
      benefits: [
        "Up to $500 deductible reimbursement per claim",
        "Complete identity monitoring and restoration",
        "Secure warranty document storage",
        "Travel expense coverage during repairs"
      ],
      brochureUrl: "/brochures/auto-advantage-program.pdf",
      icon: Car,
      color: "blue"
    },
    {
      id: "home-protection-plan", 
      name: "Home Protection Plan (HPP)",
      category: "Home Protection",
      description: "Comprehensive home protection with appliance coverage and emergency assistance",
      features: [
        "Deductible Reimbursement",
        "Glass Breakage Coverage", 
        "Emergency Lockout Assistance",
        "Appliance & Electronics Repair",
        "Emergency Lodging Coverage"
      ],
      termOptions: "1-5 Years",
      targetAudience: "Homeowners, Property Managers, Real Estate Professionals",
      benefits: [
        "$200 per glass breakage claim",
        "$100 emergency lockout assistance", 
        "$500 per repair occurrence",
        "$1,000 annual coverage cap",
        "Emergency lodging up to 3 nights"
      ],
      brochureUrl: "/brochures/home-protection-plan.pdf",
      icon: Home,
      color: "green"
    },
    {
      id: "all-vehicle-protection",
      name: "All-Vehicle Protection (APS)", 
      category: "Multi-Vehicle",
      description: "Universal protection for cars, motorcycles, ATVs, boats, and RVs",
      features: [
        "Multi-Vehicle Coverage",
        "20% Mechanical Repair Reimbursement",
        "Emergency Travel Assistance", 
        "Identity Theft Protection",
        "Warranty Vault Services"
      ],
      termOptions: "1-5 Years",
      targetAudience: "Multi-Vehicle Owners, Dealers, Fleet Managers",
      benefits: [
        "Covers cars, motorcycles, ATVs, boats, RVs",
        "20% reimbursement on covered mechanical repairs",
        "Travel assistance for breakdowns",
        "Complete identity protection suite"
      ],
      brochureUrl: "/brochures/all-vehicle-protection.pdf", 
      icon: Shield,
      color: "purple"
    }
  ];

  const getIconComponent = (IconComponent: any, color: string) => {
    const colorClasses = {
      blue: "text-blue-600",
      green: "text-green-600", 
      purple: "text-purple-600"
    };
    return <IconComponent className={`h-8 w-8 ${colorClasses[color as keyof typeof colorClasses]}`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Insurance Products</h1>
            <p className="text-xl text-gray-600">Comprehensive protection solutions for vehicles and homes</p>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-white border-b" aria-label="Breadcrumb">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">Products</li>
          </ol>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Products Grid */}
        <div className="space-y-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {getIconComponent(product.icon, product.color)}
                    <div>
                      <CardTitle className="text-2xl">{product.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={product.brochureUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Brochure
                    </a>
                  </Button>
                </div>
                <CardDescription className="text-lg mt-2">{product.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* What It Covers */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">What It Covers</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits & Limits */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Benefits & Limits</h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-700 border-l-2 border-blue-200 pl-3">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Term Options:</span>
                        <p className="text-sm text-gray-900">{product.termOptions}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Who It's For:</span>
                        <p className="text-sm text-gray-900">{product.targetAudience}</p>
                      </div>
                      <div className="flex space-x-4 pt-2">
                        <Button size="sm" className="flex-1">
                          Get Quote
                        </Button>
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help Choosing?</h2>
            <p className="text-gray-600 mb-6">Our insurance experts are here to help you find the right protection for your needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Call 1-800-555-0123
              </Button>
              <Button variant="outline" size="lg" className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Contact Online
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}