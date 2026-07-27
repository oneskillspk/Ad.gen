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

    const ai = getGeminiClient();

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

    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: targetAspectRatio as any,
            imageSize: imageSize as any, // "1K", "2K", "4K"
          },
        },
      });
    } catch (modelErr: any) {
      console.warn(`Attempt with ${targetModel} failed, trying fallback model...`, modelErr?.message);
      // Fallback model call
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: (targetAspectRatio === "16:9" || targetAspectRatio === "1:1" || targetAspectRatio === "9:16" || targetAspectRatio === "4:3" || targetAspectRatio === "3:4") 
              ? targetAspectRatio as any 
              : "16:9",
          },
        },
      });
    }

    let imageUrl: string | null = null;

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image data returned from Gemini image model.");
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      usedModel: targetModel,
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
