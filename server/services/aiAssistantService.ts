import OpenAI from "openai";

export class AIAssistantService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyzeClaimData(claimData: any): Promise<any> {
    try {
      const prompt = `Analyze this insurance claim data and provide insights:
      
      Claim Details:
      - Description: ${claimData.description}
      - Incident Date: ${claimData.incidentDate}
      - Estimated Amount: ${claimData.estimatedAmount || 'Not specified'}
      - Location: ${claimData.incidentLocation || 'Not specified'}
      
      Please provide:
      1. Risk assessment (low/medium/high)
      2. Potential fraud indicators
      3. Recommended next steps
      4. Similar claim patterns to watch for
      
      Respond in JSON format with these fields: riskLevel, fraudIndicators, recommendations, similarPatterns`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert insurance claim analyst. Provide detailed, professional analysis in JSON format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI claim analysis error:', error);
      throw new Error('Failed to analyze claim data');
    }
  }

  async answerCustomerQuestion(question: string, context?: any): Promise<string> {
    try {
      const contextInfo = context ? `
      
      Customer Context:
      - Policy Number: ${context.policyNumber || 'N/A'}
      - Coverage Type: ${context.coverageType || 'N/A'}
      - Policy Status: ${context.policyStatus || 'N/A'}
      ` : '';

      const prompt = `You are a helpful insurance customer service assistant. Answer this customer question professionally and accurately:
      
      Question: ${question}${contextInfo}
      
      Provide a clear, helpful response that addresses their concern. If you need additional information to provide a complete answer, ask for it politely.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a knowledgeable and helpful insurance customer service representative." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.content || 'I apologize, but I was unable to generate a response. Please try again or contact support.';
    } catch (error) {
      console.error('AI customer service error:', error);
      throw new Error('Failed to process customer question');
    }
  }

  async generatePolicyRecommendations(customerProfile: any): Promise<any> {
    try {
      const prompt = `Based on this customer profile, recommend appropriate insurance products and coverage levels:
      
      Customer Profile:
      - Age: ${customerProfile.age || 'Not specified'}
      - Location: ${customerProfile.location || 'Not specified'}
      - Vehicle Type: ${customerProfile.vehicleType || 'Not specified'}
      - Driving History: ${customerProfile.drivingHistory || 'Not specified'}
      - Current Coverage: ${customerProfile.currentCoverage || 'None'}
      
      Provide recommendations in JSON format with:
      1. recommendedProducts: array of product recommendations
      2. coverageLevels: suggested coverage amounts
      3. discounts: applicable discounts
      4. explanation: reasoning for recommendations`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert insurance advisor. Provide personalized product recommendations in JSON format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI recommendation error:', error);
      throw new Error('Failed to generate policy recommendations');
    }
  }

  async summarizeClaimHistory(claims: any[]): Promise<string> {
    try {
      const claimsData = claims.map(claim => ({
        date: claim.incidentDate,
        type: claim.type,
        amount: claim.estimatedAmount,
        status: claim.status
      }));

      const prompt = `Summarize this customer's claim history and provide insights:
      
      Claims: ${JSON.stringify(claimsData, null, 2)}
      
      Provide a professional summary including:
      - Overall claim frequency
      - Common claim types
      - Risk patterns
      - Recommendations for the customer`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an insurance analyst providing customer claim history summaries." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400
      });

      return response.choices[0].message.content || 'Unable to generate claim history summary.';
    } catch (error) {
      console.error('AI claim summary error:', error);
      throw new Error('Failed to summarize claim history');
    }
  }

  async detectAnomalies(data: any, dataType: 'claim' | 'policy' | 'payment'): Promise<any> {
    try {
      const prompt = `Analyze this ${dataType} data for anomalies or unusual patterns:
      
      Data: ${JSON.stringify(data, null, 2)}
      
      Look for:
      - Unusual amounts or values
      - Timing irregularities
      - Pattern deviations
      - Potential fraud indicators
      
      Respond in JSON format with: anomalies (array), riskScore (0-1), explanation`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a data analyst specializing in insurance fraud detection and anomaly detection." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI anomaly detection error:', error);
      throw new Error('Failed to detect anomalies');
    }
  }
}