import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { url, description } = await req.json();

    if (!url && !description) {
      return NextResponse.json(
        { error: "Please provide either a product URL or description." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const prompt = `Analyze the following product details and URL to extract high-converting advertising marketing copy and visual direction for digital banner ads.

Product URL: ${url || "N/A"}
Product Description: ${description || "N/A"}

Please generate:
1. Concise Brand Name and Product Title
2. Target Audience persona summary
3. Top 3 Unique Value Propositions (short points)
4. 4 Catchy Banner Ad Headlines (high urgency, high conversion, under 8 words each)
5. 4 Action-oriented CTA button labels (e.g., "Shop 20% Off", "Get Free Trial", "Claim Your Deal")
6. A 3-color palette (primary hex, accent hex, background hex) matching the product vibe.
7. A prompt description for studio-quality product hero background image generation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            productName: { type: Type.STRING },
            summary: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            sellingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedHeadlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedCTAs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                accent: { type: Type.STRING },
                background: { type: Type.STRING },
              },
            },
            heroImagePrompt: { type: Type.STRING },
          },
          required: [
            "brandName",
            "productName",
            "summary",
            "suggestedHeadlines",
            "suggestedCTAs",
            "colors",
            "heroImagePrompt",
          ],
        },
      },
    });

    const jsonText = response.text?.trim() || "{}";
    const parsedData = JSON.parse(jsonText);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error analyzing URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze product details" },
      { status: 500 }
    );
  }
}
