import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      aspectRatio = "16:9",
      imageSize = "1K",
      model = "gemini-3-pro-image-preview",
      productName,
      styleTone = "modern",
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Image generation prompt is required." },
        { status: 400 }
      );
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      if (e.message?.includes("GEMINI_API_KEY")) {
        const seed = Math.floor(Math.random() * 1000);
        return NextResponse.json({
          success: true,
          imageUrl: `https://picsum.photos/seed/bg-${seed}/1200/800`,
          usedModel: "placeholder-fallback",
          resolution: imageSize,
          aspectRatio,
        });
      }
      throw e;
    }

    // Sanitize aspect ratio to supported API values or mapped standard
    let targetAspectRatio = aspectRatio;
    if (aspectRatio === "21:9") {
      targetAspectRatio = "16:9"; // 21:9 falls back gracefully to wide 16:9 if needed or custom
    } else if (aspectRatio === "2:3") {
      targetAspectRatio = "3:4";
    } else if (aspectRatio === "3:2") {
      targetAspectRatio = "4:3";
    }

    // Map model names to exact supported GenAI SDK model string
    let targetModel = model;
    if (model === "gemini-3-pro-image-preview" || model === "gemini-3-pro-image") {
      targetModel = "gemini-3-pro-image";
    } else if (model === "gemini-3.1-flash-image-preview" || model === "gemini-3.1-flash-image") {
      targetModel = "gemini-3.1-flash-image";
    } else {
      targetModel = "gemini-3.1-flash-lite-image";
    }

    const fullPrompt = `High quality digital commercial banner ad background aesthetic for ${productName || "a featured product"}. Style: ${styleTone}. ${prompt}. Professional studio lighting, commercial product photography background, elegant depth of field, high contrast advertising banner visual asset, clean composition without text burned in.`;

    const modelsToTry: string[] = [];
    if (model.includes("flash-lite")) {
      modelsToTry.push("gemini-3.1-flash-lite-image", "gemini-3.1-flash-image");
    } else if (model.includes("pro")) {
      modelsToTry.push("gemini-3.1-flash-image", "gemini-3.1-flash-lite-image", "gemini-3-pro-image");
    } else {
      modelsToTry.push("gemini-3.1-flash-image", "gemini-3.1-flash-lite-image");
    }

    let imageUrl: string | null = null;
    let successfulModel = targetModel;

    for (const currentModel of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: {
            parts: [{ text: fullPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: targetAspectRatio as any,
              imageSize: imageSize as any,
            },
          },
        });

        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";
              imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
              successfulModel = currentModel;
              break;
            }
          }
        }
        if (imageUrl) break;
      } catch {
        // Continue to next model in sequence silently
      }
    }

    if (!imageUrl) {
      // Fallback aesthetic image placeholder if all rate-limited
      const seed = Math.floor(Math.random() * 1000);
      imageUrl = `https://picsum.photos/seed/banner-${seed}/1200/800`;
      successfulModel = "placeholder-fallback";
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      usedModel: successfulModel,
      resolution: imageSize,
      aspectRatio: targetAspectRatio,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
