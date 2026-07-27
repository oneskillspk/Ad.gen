import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { AD_FORMAT_SPECS, BannerAdData, CampaignConfig, AspectRatioOption } from "@/lib/types";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const config: CampaignConfig = await req.json();

    if (!config.productName && !config.productDescription) {
      return NextResponse.json(
        { error: "Product name or description is required." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // 1. Generate Banner Ad Copy System using gemini-3.6-flash
    const copyPrompt = `You are a world-class digital advertising copywriter and marketing director.
Generate high-converting digital banner ad copy variations and styling specs for the product below:

Product Name: ${config.productName || "Featured Product"}
Description: ${config.productDescription}
URL: ${config.productUrl || ""}
Brand Name: ${config.brandName || config.productName || "Brand"}
Campaign Goal: ${config.campaignGoal || "Increase Conversions & Sales"}
Target Audience: ${config.targetAudience || "General Consumers"}
Visual Style Tone: ${config.styleTone || "modern"}

Return JSON containing tailored copy and style variations for:
1. Short Horizontal Banners (e.g., Leaderboard 728x90, Mobile 320x50, Billboard 970x250)
2. Tall Vertical Banners (e.g., Half Page 300x600, Wide Skyscraper 160x600, Story 1080x1920)
3. Compact Square/Rectangle Banners (e.g., Medium Rectangle 300x250, Social Square 1080x1080, Social Portrait 1080x1350)

Also specify:
- Primary CTA Button Label (e.g., "Shop Now - 25% Off", "Get Started", "Try Free")
- Badge offer tag (e.g., "LIMITED TIME", "NEW RELEASE", "SAVE 30%")
- 3 Color hex codes matching brand vibe (primary, accent, background, text)
- Image background prompts tailored for Horizontal, Vertical, and Square aspect ratios.`;

    const copyResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: copyPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            badgeText: { type: Type.STRING },
            ctaText: { type: Type.STRING },
            horizontalCopy: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
              },
              required: ["headline", "subheadline"],
            },
            verticalCopy: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
              },
              required: ["headline", "subheadline"],
            },
            squareCopy: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
              },
              required: ["headline", "subheadline"],
            },
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                primaryText: { type: Type.STRING },
                accent: { type: Type.STRING },
                background: { type: Type.STRING },
                textColor: { type: Type.STRING },
                cardBg: { type: Type.STRING },
              },
              required: ["primary", "accent", "background", "textColor"],
            },
            imagePrompts: {
              type: Type.OBJECT,
              properties: {
                horizontal: { type: Type.STRING },
                vertical: { type: Type.STRING },
                square: { type: Type.STRING },
              },
              required: ["horizontal", "vertical", "square"],
            },
          },
          required: [
            "brandName",
            "badgeText",
            "ctaText",
            "horizontalCopy",
            "verticalCopy",
            "squareCopy",
            "colors",
            "imagePrompts",
          ],
        },
      },
    });

    const parsedCopy = JSON.parse(copyResponse.text?.trim() || "{}");

    // Override colors if user provided custom colors
    const primaryColor = config.customColors?.primary || parsedCopy.colors?.primary || "#2563eb";
    const accentColor = config.customColors?.accent || parsedCopy.colors?.accent || "#f59e0b";
    const backgroundColor = config.customColors?.background || parsedCopy.colors?.background || "#0f172a";
    const textColor = parsedCopy.colors?.textColor || "#ffffff";
    const primaryText = parsedCopy.colors?.primaryText || "#ffffff";
    const cardBg = parsedCopy.colors?.cardBg || "rgba(15, 23, 42, 0.75)";

    // 2. Generate Base Images for key aspect ratios using user's requested model & resolution
    const imagePromises = [
      generateImageHelper(ai, {
        prompt: parsedCopy.imagePrompts?.horizontal || `Studio commercial background for ${config.productName}`,
        aspectRatio: "16:9",
        imageSize: config.imageResolution || "1K",
        model: config.imageModel || "gemini-3-pro-image-preview",
        styleTone: config.styleTone,
      }),
      generateImageHelper(ai, {
        prompt: parsedCopy.imagePrompts?.vertical || `Vertical studio product background for ${config.productName}`,
        aspectRatio: "9:16",
        imageSize: config.imageResolution || "1K",
        model: config.imageModel || "gemini-3-pro-image-preview",
        styleTone: config.styleTone,
      }),
      generateImageHelper(ai, {
        prompt: parsedCopy.imagePrompts?.square || `Square studio product hero shot for ${config.productName}`,
        aspectRatio: "1:1",
        imageSize: config.imageResolution || "1K",
        model: config.imageModel || "gemini-3-pro-image-preview",
        styleTone: config.styleTone,
      }),
    ];

    const [horizontalBgUrl, verticalBgUrl, squareBgUrl] = await Promise.all(imagePromises);

    // 3. Map specifications into full list of BannerAdData
    const generatedBanners: BannerAdData[] = AD_FORMAT_SPECS.map((spec) => {
      let isVertical = spec.height > spec.width * 1.2;
      let isHorizontal = spec.width > spec.height * 1.5;
      
      let copy = parsedCopy.squareCopy;
      let bgUrl = squareBgUrl;
      let imgPrompt = parsedCopy.imagePrompts?.square;
      let layoutStyle: 'overlay' | 'split-left' | 'split-right' | 'minimal' | 'bold-hero' = 'overlay';

      if (isHorizontal) {
        copy = parsedCopy.horizontalCopy;
        bgUrl = horizontalBgUrl;
        imgPrompt = parsedCopy.imagePrompts?.horizontal;
        layoutStyle = spec.width >= 728 ? 'split-right' : 'overlay';
      } else if (isVertical) {
        copy = parsedCopy.verticalCopy;
        bgUrl = verticalBgUrl;
        imgPrompt = parsedCopy.imagePrompts?.vertical;
        layoutStyle = spec.height >= 1200 ? 'bold-hero' : 'overlay';
      } else {
        layoutStyle = 'overlay';
      }

      return {
        id: `banner-${spec.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sizeId: spec.id,
        width: spec.width,
        height: spec.height,
        aspectRatio: spec.aspectRatio,
        headline: copy.headline || `${config.productName}`,
        subheadline: copy.subheadline || config.productDescription.slice(0, 80),
        badgeText: parsedCopy.badgeText || "SPECIAL OFFER",
        ctaText: parsedCopy.ctaText || "Shop Now",
        ctaUrl: config.productUrl || "https://example.com",
        brandName: parsedCopy.brandName || config.brandName || "Brand",
        bgImageUrl: bgUrl || undefined,
        bgImagePrompt: imgPrompt,
        colorScheme: {
          primary: primaryColor,
          primaryText: primaryText,
          background: backgroundColor,
          textColor: textColor,
          accentColor: accentColor,
          accentText: "#000000",
          cardBg: cardBg,
        },
        fontFamily: 'sans',
        layoutStyle: layoutStyle,
        overlayOpacity: 45,
        borderRadius: 8,
        productName: config.productName,
        productDescription: config.productDescription,
        productUrl: config.productUrl,
      };
    });

    return NextResponse.json({
      success: true,
      banners: generatedBanners,
      campaignInfo: {
        productName: config.productName,
        brandName: parsedCopy.brandName,
        modelUsed: config.imageModel || "gemini-3-pro-image-preview",
        resolutionUsed: config.imageResolution || "1K",
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error generating campaign:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate banner ad campaign" },
      { status: 500 }
    );
  }
}

async function generateImageHelper(
  ai: any,
  params: {
    prompt: string;
    aspectRatio: string;
    imageSize: string;
    model: string;
    styleTone: string;
  }
): Promise<string | undefined> {
  try {
    let targetModel = "gemini-3-pro-image";
    if (params.model.includes("flash-image")) {
      targetModel = "gemini-3.1-flash-image";
    } else if (params.model.includes("flash-lite")) {
      targetModel = "gemini-3.1-flash-lite-image";
    }

    const fullPrompt = `Commercial product advertisement background for ${params.prompt}. Style: ${params.styleTone}. Clean background art, vivid studio colors, cinematic lighting, high-end commercial photo asset.`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio,
          imageSize: params.imageSize,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.warn(`Fallback image generation for ${params.aspectRatio}:`, e);
    // Standard high quality aesthetic placeholder fallback from picsum with seed
    const seed = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/ad-${seed}/1200/800`;
  }
  return undefined;
}
