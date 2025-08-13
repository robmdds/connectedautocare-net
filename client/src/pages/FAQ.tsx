import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronUp, Phone, Mail, HelpCircle } from "lucide-react";
import { Link } from "wouter";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: "adr-what-is",
    question: "What is Deductible Reimbursement (ADR)?",
    answer: "Deductible Reimbursement (ADR) reimburses you for out-of-pocket deductibles paid when filing covered insurance claims. Available with Auto Advantage Program and Home Protection Plan, ADR helps reduce the financial impact of unexpected repairs and damages.",
    category: "Auto Advantage (ADR)",
    tags: ["deductible", "reimbursement", "auto", "claims"]
  },
  {
    id: "adr-how-much",
    question: "How much deductible reimbursement can I receive?",
    answer: "Auto Advantage Program provides up to $500 deductible reimbursement per claim. The exact amount depends on your plan level and the deductible you paid to your insurance company for covered repairs.",
    category: "Auto Advantage (ADR)",
    tags: ["deductible", "amount", "limit", "coverage"]
  },
  {
    id: "hpp-glass-coverage",
    question: "What does the glass breakage coverage include in HPP?",
    answer: "Home Protection Plan includes up to $200 per claim for glass breakage coverage. This covers windows, sliding glass doors, mirrors, and other glass fixtures in your home. Coverage is subject to annual limits and specific terms.",
    category: "Home Protection Plan (HPP)",
    tags: ["glass", "windows", "home", "coverage"]
  },
  {
    id: "hpp-repair-limits",
    question: "What are the repair coverage limits for HPP?",
    answer: "Home Protection Plan provides up to $500 per repair occurrence with a $1,000 annual coverage cap. This includes appliance repairs, electronics coverage, and emergency services within the plan terms.",
    category: "Home Protection Plan (HPP)",
    tags: ["repair", "limits", "appliance", "electronics"]
  },
  {
    id: "aps-vehicles-covered",
    question: "What vehicles are covered under All-Vehicle Protection?",
    answer: "All-Vehicle Protection (APS) covers cars, motorcycles, ATVs, boats, and RVs under a single plan. This multi-vehicle coverage includes 20% mechanical repair reimbursement and emergency travel assistance for all covered vehicles.",
    category: "All-Vehicle Protection (APS)",
    tags: ["vehicles", "motorcycle", "boat", "rv", "atv"]
  },
  {
    id: "aps-repair-reimbursement",
    question: "How does the 20% mechanical repair reimbursement work?",
    answer: "All-Vehicle Protection reimburses 20% of covered mechanical repair costs. Submit your repair receipts, and we'll reimburse 20% of the covered repair amount directly to you, helping offset unexpected maintenance costs.",
    category: "All-Vehicle Protection (APS)",
    tags: ["mechanical", "repair", "reimbursement", "20%"]
  },
  {
    id: "claims-how-to-file",
    question: "How do I file a claim?",
    answer: "To file a claim: 1) Call our claims hotline at 1-800-555-0123, 2) Submit online through your customer portal, or 3) Email required documents to claims@tpaplatform.com. Have your policy number, incident details, and supporting documentation ready.",
    category: "Claims Process",
    tags: ["claims", "file", "process", "documentation"]
  },
  {
    id: "claims-required-docs",
    question: "What documents do I need for a claim?",
    answer: "Required documents vary by claim type but typically include: policy number, proof of loss (receipts, estimates), photos of damage, insurance claim documentation (for ADR), and completed claim forms. Specific requirements are provided when you start your claim.",
    category: "Claims Process",
    tags: ["documents", "receipts", "proof", "requirements"]
  },
  {
    id: "coverage-term-lengths",
    question: "What term lengths are available?",
    answer: "Term lengths vary by product: Auto Advantage Program offers 1-7 year terms, Home Protection Plan offers 1-5 year terms, and All-Vehicle Protection offers 1-5 year terms. Longer terms often provide better value and extended protection.",
    category: "Coverage Terms",
    tags: ["terms", "length", "years", "duration"]
  },
  {
    id: "coverage-eligibility",
    question: "What are the eligibility requirements?",
    answer: "Eligibility varies by product and includes factors like vehicle age, mileage, home age, and location. Auto products typically require vehicles under 15 years old with less than 150,000 miles. Contact us for specific eligibility verification.",
    category: "Coverage Terms",
    tags: ["eligibility", "requirements", "age", "mileage"]
  },
  {
    id: "billing-payment-options",
    question: "What payment options are available?",
    answer: "We accept major credit cards, bank transfers, and offer flexible payment plans. Most customers choose pay-in-full for maximum savings, but monthly payment options are available for qualified applicants.",
    category: "Billing & Payments",
    tags: ["payment", "billing", "credit card", "monthly"]
  },
  {
    id: "billing-refund-policy",
    question: "What is your refund policy?",
    answer: "We offer a 30-day money-back guarantee for new policies. Cancellations after 30 days may be subject to cancellation fees and pro-rated refunds based on policy terms and usage. Contact customer service for specific cancellation terms.",
    category: "Billing & Payments",
    tags: ["refund", "cancellation", "money-back", "guarantee"]
  }
];

const categories = Array.from(new Set(faqData.map(faq => faq.category)));

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">Find answers to common questions about our insurance products and services</p>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-white border-b" aria-label="Breadcrumb">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">FAQ</li>
          </ol>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <HelpCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-600">Try adjusting your search terms or selecting a different category.</p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <Collapsible open={openItems.includes(faq.id)} onOpenChange={() => toggleItem(faq.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">{faq.category}</Badge>
                            {faq.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        {openItems.includes(faq.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">Our customer support team is here to help you with any additional questions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Call 1-800-555-0123
              </Button>
              <Button variant="outline" size="lg" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Customer service hours: Monday-Friday 8 AM - 8 PM EST
            </p>
          </div>
        </div>
      </main>

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": filteredFAQs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })
      }} />
    </div>
  );
}