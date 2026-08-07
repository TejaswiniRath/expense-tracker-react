import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function analyzeExpenses(expenses) {
  const prompt = `
You are a financial advisor.

Analyze the following expense data and give:
1. Spending summary
2. Biggest spending category
3. Savings advice
4. Budget tips
5. 3 actionable suggestions

Expense Data:
${JSON.stringify(expenses, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text;
}