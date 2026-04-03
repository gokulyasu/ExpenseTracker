// Google Gemini AI integration for financial insights
// Calls are made only from the Analytics screen with summarized data

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
  if (!GEMINI_API_KEY) {
    return "Gemini API key not configured. Add VITE_GEMINI_API_KEY to your environment.";
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return "Unable to generate insight at this time.";
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini fetch error:", error);
    return "Unable to connect to AI service.";
  }
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
