import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Car, 
  Home, 
  Ship, 
  Truck, 
  Star, 
  CheckCircle, 
  Phone, 
  Globe,
  ArrowRight,
  Users,
  Award,
  Clock
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const [quoteData, setQuoteData] = useState({
    year: "",
    make: "",
    model: "",
    miles: "",
    zip: "",
    email: "",
    phone: ""
  });

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would process the quote
    console.log("Quote submitted:", quoteData);
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">TPA Platform</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/products" className="text-gray-600 hover:text-blue-600">Products</Link>
              <Link href="/claims" className="text-gray-600 hover:text-blue-600">Claims</Link>
              <Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link>
              <Button onClick={handleLogin} variant="outline" size="sm">
                Partner Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Protect Against Surprise Repairs + Deductible Hits
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Professional insurance solutions with comprehensive vehicle service contracts, 
                home protection plans, and deductible reimbursement programs.
              </p>
              
              {/* Partner Logos/Proof */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">4.8/5</span>
                  <span className="text-sm text-blue-200 ml-2">(2,500+ reviews)</span>
                </div>
                <div className="text-sm text-blue-200">
                  Trusted by 50,000+ customers nationwide
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                  Get Instant Quote
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Phone className="h-4 w-4 mr-2" />
                  Call 1-800-555-0123
                </Button>
              </div>
            </div>

            {/* Instant Quote Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
              <h3 className="text-2xl font-bold mb-4">Get Your Free Quote</h3>
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 25}, (_, i) => 2024 - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Make" 
                    value={quoteData.make}
                    onChange={(e) => setQuoteData({...quoteData, make: e.target.value})}
                  />
                </div>
                <Input 
                  placeholder="Model" 
                  value={quoteData.model}
                  onChange={(e) => setQuoteData({...quoteData, model: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Current Miles" 
                    value={quoteData.miles}
                    onChange={(e) => setQuoteData({...quoteData, miles: e.target.value})}
                  />
                  <Input 
                    placeholder="ZIP Code" 
                    value={quoteData.zip}
                    onChange={(e) => setQuoteData({...quoteData, zip: e.target.value})}
                  />
                </div>
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  value={quoteData.email}
                  onChange={(e) => setQuoteData({...quoteData, email: e.target.value})}
                />
                <Input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={quoteData.phone}
                  onChange={(e) => setQuoteData({...quoteData, phone: e.target.value})}
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Get My Quote
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Free quotes • No obligation • Instant results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Protection Solutions</h2>
            <p className="text-xl text-gray-600">Choose from our industry-leading protection plans</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader className="text-center">
                <Car className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-xl">Auto Advantage Program</CardTitle>
                <Badge className="mx-auto">Deductible Reimbursement</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">Up to $500 deductible reimbursement</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">Identity theft restoration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">Emergency travel assistance</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/products">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-500 transition-colors">
              <CardHeader className="text-center">
                <Home className="mx-auto mb-4 h-12 w-12 text-green-600" />
                <CardTitle className="text-xl">Home Protection Plan</CardTitle>
                <Badge className="mx-auto" variant="secondary">Emergency Coverage</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">$200 glass breakage coverage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">Emergency lockout assistance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">Appliance repair coverage</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/products">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-500 transition-colors">
              <CardHeader className="text-center">
                <Shield className="mx-auto mb-4 h-12 w-12 text-purple-600" />
                <CardTitle className="text-xl">All-Vehicle Protection</CardTitle>
                <Badge className="mx-auto" variant="outline">Multi-Vehicle</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">Cars, motorcycles, ATVs, boats, RVs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">20% mechanical repair reimbursement</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                    <span className="text-sm">Emergency travel assistance</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/products">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple process to get protected</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Get Your Quote</h3>
              <p className="text-sm text-gray-600">Enter your vehicle or home details for an instant quote</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-sm text-gray-600">Select from our comprehensive protection options</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Protected</h3>
              <p className="text-sm text-gray-600">Instant coverage activation and policy documents</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">File Claims Easy</h3>
              <p className="text-sm text-gray-600">24/7 claims support with fast reimbursement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">Satisfied Customers</p>
            </div>
            
            <div>
              <Award className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">4.8/5</h3>
              <p className="text-gray-600">Customer Rating</p>
            </div>
            
            <div>
              <Clock className="mx-auto mb-4 h-12 w-12 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Claims Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Protected?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust our comprehensive protection plans. 
            Get your free quote in less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
              Get Free Quote Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Phone className="h-4 w-4 mr-2" />
              Call 1-800-555-0123
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400 mr-3" />
                <span className="text-xl font-bold">TPA Platform</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional insurance administration for vehicle and home protection nationwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products" className="hover:text-white">Auto Advantage</Link></li>
                <li><Link href="/products" className="hover:text-white">Home Protection</Link></li>
                <li><Link href="/products" className="hover:text-white">All-Vehicle Protection</Link></li>
                <li><Link href="/hero-vsc" className="hover:text-white">Hero VSC</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/claims" className="hover:text-white">File a Claim</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><a href="tel:+1-800-555-0123" className="hover:text-white">1-800-555-0123</a></li>
                <li><a href="mailto:support@tpaplatform.com" className="hover:text-white">Contact Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><Link href="/api/login" className="hover:text-white">Partner Login</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 TPA Insurance Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}