// Google Gemini AI integration for financial insights
// Calls are made only from the Analytics screen with summarized data
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface AISummary {
  totalCredit: number;
  totalDebit: number;
  prevDebit?: number;
  breakdown: Record<string, number>;
  budget?: number;
  spent?: number;
}

const insightCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): string | null {
  const cached = insightCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  insightCache.delete(key);
  return null;
}

function setCache(key: string, data: string) {
  insightCache.set(key, { data, timestamp: Date.now() });
}

async function callGemini(prompt: string): Promise<string> {
  let text;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      // throw new Error("Invalid response from Gemini API");
      text = "Invalid response from AI";
    }

    const response = await result.response;
    text = response.text();

    if (!text) {
      text = "Empty response from AI";
      // throw new Error("Empty response from Gemini");
    }



  } catch (error: any) {
    console.error("Gemini Error:", error?.message || error);
    // throw new Error("Failed to fetch response from Gemini");
    text = "Failed to fetch response from AI";
  }
  return text;
}

export async function getMonthlyInsight(summary: AISummary): Promise<string> {
  const cacheKey = `monthly-${summary.totalCredit}-${summary.totalDebit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const breakdownStr = Object.entries(summary.breakdown)
    .map(([k, v]) => `${k}: ₹${v}`)
    .join(", ");

  const prompt = `You are a financial analyst. Analyze this monthly data concisely.

Income: ₹${summary.totalCredit}
Expense: ₹${summary.totalDebit}
Previous Month Expense: ₹${summary.prevDebit || 0}
Category Breakdown: ${breakdownStr}

Return in this format:
- Trend: (% change from previous month)
- Top Category: (highest spending category)
- Insight: (one sentence observation)
- Suggestions: (2 actionable tips)

Keep response under 150 words. Use bullet points.`;

  const result = await callGemini(prompt);
  setCache(cacheKey, result);
  return result;
}

export async function getWeeklyInsight(current: number, previous: number): Promise<string> {
  const cacheKey = `weekly-${current}-${previous}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const prompt = `You are a financial advisor. Compare weekly spending concisely.

Current Week: ₹${current}
Previous Week: ₹${previous}

Return:
- % Change: (increase or decrease)
- Status: (good/caution/warning)
- Suggestion: (one actionable tip)

Keep response under 80 words.`;

  const result = await callGemini(prompt);
  setCache(cacheKey, result);
  return result;
}

export async function getBudgetInsight(budget: number, spent: number): Promise<string> {
  const cacheKey = `budget-${budget}-${spent}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const prompt = `You are a budget advisor. Analyze this budget status concisely.

Monthly Budget: ₹${budget}
Amount Spent: ₹${spent}
Remaining: ₹${budget - spent}

Return:
- Usage: (percentage used)
- Status: (on track / caution / critical / exceeded)
- Action: (one specific recommendation)

Keep response under 80 words.`;

  const result = await callGemini(prompt);
  setCache(cacheKey, result);
  return result;
}

export async function chatWithAI(question: string, summary: AISummary): Promise<string> {
  const prompt = `You are a helpful financial assistant. Use ONLY the data provided below to answer. If data is insufficient, say "Not enough data to answer this question."

Financial Summary:
- Total Income: ₹${summary.totalCredit}
- Total Expenses: ₹${summary.totalDebit}
- Balance: ₹${summary.totalCredit - summary.totalDebit}
- Category Breakdown: ${JSON.stringify(summary.breakdown)}
${summary.budget ? `- Monthly Budget: ₹${summary.budget}` : ""}
${summary.spent !== undefined ? `- Budget Spent: ₹${summary.spent}` : ""}

User Question: ${question}

Keep response concise and actionable. Under 120 words.`;

  return callGemini(prompt);
}
