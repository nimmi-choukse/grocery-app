import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/* -------------------------------------------------------------------------- */
/* OpenRouter client                                                          */
/* -------------------------------------------------------------------------- */

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  timeout: 120000, // 120 seconds
});
/* -------------------------------------------------------------------------- */
/* Model fallback order                                                       */
/* -------------------------------------------------------------------------- */

const MODELS = [
  "google/gemma-4-26b-a4b-it:free"
];

type AutoFillResult = {
  description: string;
  category: string;
  brand: string;
  unit: string;
};

function buildPrompt(productName: string) {
  return `You are a grocery product data assistant for an Indian grocery delivery store called Shivam Traders.

Given only a product name, generate the missing catalog details.

Product name: "${productName}"

Return ONLY a raw JSON object (no markdown, no code fences, no explanation) with exactly these keys:
{
  "description": "a short, appealing 1-2 sentence product description suitable for an online grocery store listing",
  "category": "the single best grocery category for this product (e.g. Dairy & Eggs, Fruits & Vegetables, Snacks & Beverages, Grains & Pulses, Bakery, Personal Care, Household)",
  "brand": "the brand name if identifiable from the product name, otherwise a reasonable guess or 'Generic'",
  "unit": "the most likely selling unit for this product (e.g. 100g, 1kg, 500ml, 1L, 1 piece, pack of 6)"
}

Respond with ONLY the JSON object and nothing else.`;
}

function extractJson(raw: string): AutoFillResult | null {
  // Strip markdown code fences if the model added them despite instructions
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed.description === "string" &&
      typeof parsed.category === "string" &&
      typeof parsed.brand === "string" &&
      typeof parsed.unit === "string"
    ) {
      return parsed as AutoFillResult;
    }
    return null;
  } catch {
    // Try to find a JSON object embedded in extra text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      if (
        typeof parsed.description === "string" &&
        typeof parsed.category === "string" &&
        typeof parsed.brand === "string" &&
        typeof parsed.unit === "string"
      ) {
        return parsed as AutoFillResult;
      }
      return null;
    } catch {
      return null;
    }
  }
}

async function tryModel(model: string, productName: string): Promise<AutoFillResult | null> {
  const completion = await openrouter.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: buildPrompt(productName),
      },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) return null;

  return extractJson(raw);
}

/* -------------------------------------------------------------------------- */
/* Route handler                                                              */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Server is not configured with an OpenRouter API key." },
      { status: 500 }
    );
  }

  let productName: string;
  try {
    const body = await request.json();
    productName = typeof body?.productName === "string" ? body.productName.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!productName) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }

  let lastError: unknown = null;

  for (const model of MODELS) {
    try {
      const result = await tryModel(model, productName);
      if (result) {
        return NextResponse.json(result, { status: 200 });
      }
      lastError = new Error(`Model ${model} returned unparseable content.`);
    } catch (err) {
      lastError = err;
      // Try the next model in the fallback list
      continue;
    }
  }

  console.error("AI auto-fill failed for all models:", lastError);
  return NextResponse.json(
    { error: "Unable to generate details. Please try again." },
    { status: 502 }
  );
}