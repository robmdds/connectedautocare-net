import OpenAI from "openai";

interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
  confidence: number;
}

export class AIAssistantService {
  private openai: OpenAI;
  private knowledgeBase: Map<string, string>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    this.knowledgeBase = new Map();
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // Insurance knowledge base entries
    this.knowledgeBase.set('comprehensive_coverage', 
      'Comprehensive coverage protects against damage from events other than collisions, such as theft, vandalism, fire, and weather damage.');
    
    this.knowledgeBase.set('collision_coverage',
      'Collision coverage pays for damage to your vehicle from crashes with other vehicles or objects.');
    
    this.knowledgeBase.set('liability_coverage',
      'Liability coverage protects you financially if you cause an accident that injures others or damages their property.');
    
    this.knowledgeBase.set('deductible',
      'A deductible is the amount you pay out of pocket before your insurance coverage kicks in.');
    
    this.knowledgeBase.set('claim_process',
      'To file a claim: 1) Report the incident immediately, 2) Document everything with photos, 3) Provide all required information, 4) Work with your adjuster, 5) Review settlement offer.');
    
    this.knowledgeBase.set('premium_factors',
      'Insurance premiums are affected by vehicle age, mileage, driver history, location, coverage levels, and deductible amounts.');
  }

  async processMessage(message: string, context?: any): Promise<AIResponse> {
    try {
      // Check for specific knowledge base queries first
      const knowledgeResponse = this.searchKnowledgeBase(message);
      if (knowledgeResponse) {
        return {
          message: knowledgeResponse,
          confidence: 0.9,
          suggestions: this.getRelatedSuggestions(message),
        };
      }

      // Use OpenAI for complex queries
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an insurance assistant for a TPA platform. You help users with:
            - Policy information and comparisons
            - Claims guidance and process
            - Coverage explanations
            - Premium calculations
            - Regulatory compliance questions
            
            Always provide accurate, helpful information while adhering to insurance regulations.
            If asked about specific policy details, remind users to check their actual policy documents.
            Keep responses concise and actionable.`
          },
          {
            role: "user",
            content: `${message}\n\nContext: ${JSON.stringify(context || {})}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const aiResult = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: aiResult.message || "I'm here to help with your insurance questions. Can you please be more specific?",
        suggestions: aiResult.suggestions || this.getRelatedSuggestions(message),
        actions: this.generateActions(message, context),
        confidence: aiResult.confidence || 0.8,
      };

    } catch (error) {
      console.error('AI assistant error:', error);
      
      // Fallback response
      return {
        message: "I'm having trouble processing your request right now. Please try rephrasing your question or contact support for assistance.",
        confidence: 0.1,
        suggestions: [
          "How do I file a claim?",
          "What does comprehensive coverage include?",
          "How are premiums calculated?",
        ],
      };
    }
  }

  private searchKnowledgeBase(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Search for relevant knowledge base entries
    for (const [key, value] of this.knowledgeBase) {
      if (lowerMessage.includes(key.replace('_', ' ')) || 
          lowerMessage.includes(key)) {
        return value;
      }
    }

    // Check for common question patterns
    if (lowerMessage.includes('how to file') && lowerMessage.includes('claim')) {
      return this.knowledgeBase.get('claim_process') || null;
    }
    
    if (lowerMessage.includes('premium') && (lowerMessage.includes('why') || lowerMessage.includes('how'))) {
      return this.knowledgeBase.get('premium_factors') || null;
    }

    return null;
  }

  private getRelatedSuggestions(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('claim')) {
      return [
        "How long does claim processing take?",
        "What documents do I need for a claim?",
        "How do I track my claim status?",
      ];
    }
    
    if (lowerMessage.includes('coverage') || lowerMessage.includes('policy')) {
      return [
        "Compare different coverage options",
        "What's the difference between comprehensive and collision?",
        "How do deductibles work?",
      ];
    }
    
    if (lowerMessage.includes('premium') || lowerMessage.includes('cost')) {
      return [
        "How can I lower my premium?",
        "What factors affect my rate?",
        "Are there available discounts?",
      ];
    }
    
    return [
      "How do I file a claim?",
      "What coverage do I need?",
      "How are premiums calculated?",
      "What documents do I need?",
    ];
  }

  private generateActions(message: string, context?: any): Array<{ type: string; label: string; data?: any }> {
    const actions = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('claim') && lowerMessage.includes('file')) {
      actions.push({
        type: 'navigate',
        label: 'File New Claim',
        data: { route: '/claims/new' },
      });
    }
    
    if (lowerMessage.includes('policy') && context?.policyId) {
      actions.push({
        type: 'navigate',
        label: 'View Policy Details',
        data: { route: `/policies/${context.policyId}` },
      });
    }
    
    if (lowerMessage.includes('quote')) {
      actions.push({
        type: 'navigate',
        label: 'Get New Quote',
        data: { route: '/quotes/new' },
      });
    }
    
    if (lowerMessage.includes('document') || lowerMessage.includes('download')) {
      actions.push({
        type: 'navigate',
        label: 'View Documents',
        data: { route: '/documents' },
      });
    }
    
    return actions;
  }

  async analyzeClaim(claimData: any): Promise<string> {
    try {
      const prompt = `Analyze this insurance claim and provide recommendations:
      
      Claim Type: ${claimData.type}
      Description: ${claimData.description}
      Estimated Amount: $${claimData.estimatedAmount}
      Date of Loss: ${claimData.dateOfLoss}
      
      Provide analysis on:
      1. Claim validity indicators
      2. Potential red flags
      3. Recommended next steps
      4. Documentation needed
      
      Respond in JSON format with sections for each analysis point.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis.summary || "Claim analysis completed. Please review with adjuster.";
    } catch (error) {
      console.error('Claim analysis error:', error);
      return "Unable to analyze claim automatically. Please assign to adjuster for manual review.";
    }
  }

  async comparePolicies(policies: any[]): Promise<string> {
    try {
      const prompt = `Compare these insurance policies and highlight key differences:
      
      ${policies.map((p, i) => `
      Policy ${i + 1}:
      - Premium: $${p.premium}
      - Deductible: $${p.deductible}
      - Coverage: ${JSON.stringify(p.coverageDetails)}
      `).join('\n')}
      
      Provide a clear comparison focusing on value, coverage gaps, and recommendations.
      Respond in JSON format with comparison points and recommendation.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const comparison = JSON.parse(response.choices[0].message.content || '{}');
      return comparison.summary || "Policy comparison completed.";
    } catch (error) {
      console.error('Policy comparison error:', error);
      return "Unable to compare policies automatically. Please review manually.";
    }
  }
}
