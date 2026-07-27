import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { productName, productDescription, currentHeadline, currentCta, targetTone } = await req.json();

    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      if (e.message?.includes("GEMINI_API_KEY")) {
        return NextResponse.json({
          success: true,
          variations: {
            headlines: [
              `DISCOVER ${productName ? productName.toUpperCase() : "PREMIUM QUALITY"}`,
              `UPGRADE YOUR EXPERIENCE TODAY`,
              `LIMITED TIME DEAL ON ${productName ? productName.toUpperCase() : "THIS PRODUCT"}`,
            ],
            subheadlines: [
              "Exclusive promotional offer available for a limited time.",
              "Engineered for maximum efficiency and modern aesthetic.",
              "Claim special instant savings before stock runs out.",
            ],
            ctas: ["SHOP 20% OFF", "CLAIM YOUR DEAL", "GET STARTED NOW"],
          },
        });
      }
      throw e;
    }

    const prompt = `Generate 3 high-converting creative ad copy variations for a banner ad.
Product: ${productName}
Description: ${productDescription || "N/A"}
Current Headline: ${currentHeadline || "N/A"}
Current CTA: ${currentCta || "N/A"}
Tone: ${targetTone || "punchy, urgent, high conversion"}

Provide:
- 3 alternative headlines (under 7 words each)
- 3 alternative subheadlines (under 12 words each)
- 3 alternative CTA button labels (under 4 words each)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            subheadlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ctas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["headlines", "subheadlines", "ctas"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return NextResponse.json({ success: true, variations: parsed });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Failed to refine copy" },
      { status: 500 }
    );
  }
}
