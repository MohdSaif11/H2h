import { GoogleGenAI } from "@google/genai";
import { Customer, Ticket, Insight } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const modelName = 'gemini-3-flash-preview';

export const processNaturalLanguageQuery = async (query: string, customers: Customer[]) => {
  const prompt = `
    You are a data analyst for a networking hardware company. 
    User Query: "${query}"
    
    Data available: A list of 200 customers with fields: name, region, planTier, npsScore, deviceInventoryCount, avgMonthlyUsage.
    
    Instructions:
    1. Translate the natural language query into a filtering logic for the data.
    2. If the user asks for a specific customer, find them.
    3. If the user asks for a summary (e.g., "how many customers in Asia"), provide the count.
    4. If the user asks for analytical insights, suggest what to look at.
    
    Return a JSON response with:
    {
      "results": Customer[], // filtered list if applicable
      "answer": "string", // direct textual answer
      "summary": { "count": number, "totalUsage": number } // optional
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    // In a real app, we would process the filtered results based on the AI's logic.
    // For this demo, we'll let Gemini return the answer and we can mock the search on the frontend.
    return JSON.parse(response.text);
  } catch (error) {
    console.error('AI Query failed:', error);
    return { answer: "Sorry, I couldn't process that query." };
  }
};

export const generateEmailSummary = async (customer: Customer, tickets: Ticket[], insight: Insight) => {
  const prompt = `
    Generate a professional weekly account review email for a customer.
    Customer: ${JSON.stringify(customer)}
    Open Tickets: ${JSON.stringify(tickets.filter(t => t.status !== 'Closed'))}
    AI Insights: ${JSON.stringify(insight)}
    
    Tone: Professional, proactive, hardware-networking focused.
    Include: Health score mention, churn risk if high (delicately), and summary of support status.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error('Email generation failed:', error);
    return "Error generating email summary.";
  }
};

export const predictChurnFactors = async (customer: Customer, tickets: Ticket[]) => {
  const prompt = `
    Analyze this customer and predict their churn risk.
    Customer: ${JSON.stringify(customer)}
    Support Tickets: ${JSON.stringify(tickets)}
    
    Return a JSON with:
    {
      "risk": "Low" | "Medium" | "High",
      "probability": number (0-1),
      "factors": string[],
      "explanation": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Churn prediction failed:', error);
    return null;
  }
};
