'use client';

import React, { useState } from 'react';
import { CampaignConfig, ImageModelOption, ImageResolutionOption, AspectRatioOption } from '@/lib/types';
import { Sparkles, Wand2, Link as LinkIcon, RefreshCw, Zap, Layers, Image as ImageIcon } from 'lucide-react';

interface CampaignFormProps {
  onGenerateCampaign: (config: CampaignConfig) => Promise<void>;
  isGenerating: boolean;
}

const PRESET_CAMPAIGNS = [
  {
    title: 'Ergonomic Keyboard',
    productName: 'ErgoType Pro Wireless Keyboard',
    productDescription: 'An ultra-slim split ergonomic wireless mechanical keyboard with customizable RGB backlighting, memory foam wrist rest, and 120-hour battery life.',
    productUrl: 'https://example.com/products/ergotype-pro',
    brandName: 'ErgoTech Labs',
    campaignGoal: 'Summer Tech Sale - 25% Off',
    targetAudience: 'Software Developers, Designers & Digital Nomads',
    styleTone: 'modern' as const,
  },
  {
    title: 'SaaS AI Studio',
    productName: 'CopyGenius AI Writing Suite',
    productDescription: 'The all-in-one generative AI suite for high-converting landing pages, ad headlines, email sequences, and social media campaigns.',
    productUrl: 'https://copygenius.ai',
    brandName: 'CopyGenius',
    campaignGoal: '14-Day Free Trial Launch',
    targetAudience: 'Growth Marketers, Agencies & Entrepreneurs',
    styleTone: 'cyberpunk' as const,
  },
  {
    title: 'Artisan Espresso Maker',
    productName: 'AromaCraft Pro Espresso Machine',
    productDescription: 'Precision temperature-controlled Italian espresso maker with dual boilers, built-in conical grinder, and velvety microfoam steam wand.',
    productUrl: 'https://example.com/aromacraft',
    brandName: 'AromaCraft',
    campaignGoal: 'Holiday Gift Promotion',
    targetAudience: 'Coffee Connoisseurs & Home Baristas',
    styleTone: 'luxury' as const,
  },
  {
    title: 'Organic Serum',
    productName: 'Radiance Glow Botanical Facial Serum',
    productDescription: '100% pure cold-pressed organic serum with Vitamin C, Hyaluronic Acid, and Rosehip Oil for smooth, luminous, hydrated skin.',
    productUrl: 'https://example.com/radiance-glow',
    brandName: 'Flora Botanicals',
    campaignGoal: 'New Product Launch - Free Shipping',
    targetAudience: 'Skincare Enthusiasts & Wellness Seekers',
    styleTone: 'vibrant' as const,
  },
];

export const CampaignForm: React.FC<CampaignFormProps> = ({
  onGenerateCampaign,
  isGenerating,
}) => {
  const [productName, setProductName] = useState('ErgoType Pro Wireless Keyboard');
  const [productDescription, setProductDescription] = useState(
    'An ultra-slim split ergonomic wireless mechanical keyboard with customizable RGB backlighting, memory foam wrist rest, and 120-hour battery life.'
  );
  const [productUrl, setProductUrl] = useState('https://example.com/products/ergotype-pro');
  const [brandName, setBrandName] = useState('ErgoTech Labs');
  const [campaignGoal, setCampaignGoal] = useState('Summer Tech Sale - 25% Off');
  const [targetAudience, setTargetAudience] = useState('Developers, Creators & Remote Workers');
  const [styleTone, setStyleTone] = useState<'modern' | 'minimalist' | 'luxury' | 'bold' | 'vibrant' | 'cyberpunk'>('modern');

  // Explicit Image Affordances (Required by prompt blocks!)
  const [imageResolution, setImageResolution] = useState<ImageResolutionOption>('1K');
  const [imageModel, setImageModel] = useState<ImageModelOption>('gemini-3-pro-image-preview');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9');

  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [analyzedBadge, setAnalyzedBadge] = useState(false);

  const handleAnalyzeUrl = async () => {
    if (!productUrl && !productDescription) return;
    setIsAnalyzingUrl(true);
    setAnalyzedBadge(false);

    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl, description: productDescription }),
      });
      const json = await res.json();
      if (json.data) {
        if (json.data.brandName) setBrandName(json.data.brandName);
        if (json.data.productName) setProductName(json.data.productName);
        if (json.data.summary) setProductDescription(json.data.summary);
        if (json.data.targetAudience) setTargetAudience(json.data.targetAudience);
        setAnalyzedBadge(true);
      }
    } catch (err) {
      console.error('URL analysis error:', err);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  const handleLoadPreset = (preset: (typeof PRESET_CAMPAIGNS)[0]) => {
    setProductName(preset.productName);
    setProductDescription(preset.productDescription);
    setProductUrl(preset.productUrl);
    setBrandName(preset.brandName);
    setCampaignGoal(preset.campaignGoal);
    setTargetAudience(preset.targetAudience);
    setStyleTone(preset.styleTone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateCampaign({
      productName,
      productDescription,
      productUrl,
      brandName,
      campaignGoal,
      targetAudience,
      styleTone,
      imageResolution,
      imageModel,
      aspectRatio,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0A0A0A] border-2 border-white/20 p-6 md:p-8 text-white space-y-6">
      {/* Header & Quick Sample Presets */}
      <div className="space-y-4 pb-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="label-font text-[11px] text-white/50 italic block mb-1">01. THE SOURCE</span>
            <h2 className="text-2xl sm:text-3xl ad-font text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#C1FF72] fill-[#C1FF72]" />
              <span>PRODUCT & CAMPAIGN DETAILS</span>
            </h2>
            <p className="label-font text-[11px] text-white/60 mt-1">
              ENTER PRODUCT LINK OR SPECIFICATIONS TO GENERATE ADS IN ALL STANDARD SIZES.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAnalyzeUrl}
              disabled={isAnalyzingUrl}
              className="bg-[#151515] hover:bg-white/10 text-[#C1FF72] border-2 border-[#C1FF72]/60 label-font text-xs font-bold px-4 py-2.5 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isAnalyzingUrl ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span>ANALYZE LINK WITH GEMINI</span>
            </button>
          </div>
        </div>

        {analyzedBadge && (
          <div className="bg-[#151515] border-2 border-[#C1FF72] text-[#C1FF72] label-font text-xs p-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C1FF72]" />
            <span>EXTRACTED SPECIFICATIONS, BRAND NAME, AND AUDIENCE PERSONA SUCCESSFULLY!</span>
          </div>
        )}

        {/* Preset Selector Chips */}
        <div className="pt-2">
          <span className="label-font text-[10px] text-white/50 uppercase tracking-widest block mb-2">
            QUICK LOAD SAMPLE PRESETS:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_CAMPAIGNS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className="bg-[#151515] hover:bg-[#C1FF72] hover:text-black text-white text-xs px-3.5 py-1.5 border border-white/20 transition label-font font-bold"
              >
                ⚡ {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Product URL */}
        <div className="md:col-span-2">
          <label className="label-font text-[11px] text-white/70 mb-2 flex items-center gap-1.5 font-bold">
            <LinkIcon className="w-3.5 h-3.5 text-[#C1FF72]" />
            <span>PRODUCT PAGE URL</span>
          </label>
          <input
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="w-full bg-[#151515] border border-white/20 p-3.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] transition"
            placeholder="https://yourstore.com/products/my-item"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="label-font text-[11px] text-white/70 mb-2 block font-bold">PRODUCT NAME</label>
          <input
            type="text"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-[#151515] border border-white/20 p-3.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] transition"
            placeholder="e.g., Wireless Noise Canceling Headphones"
          />
        </div>

        {/* Brand Name */}
        <div>
          <label className="label-font text-[11px] text-white/70 mb-2 block font-bold">BRAND / COMPANY NAME</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full bg-[#151515] border border-white/20 p-3.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] transition"
            placeholder="e.g., SoundLuxe"
          />
        </div>

        {/* Product Description */}
        <div className="md:col-span-2">
          <label className="label-font text-[11px] text-white/70 mb-2 block font-bold">
            PRODUCT DESCRIPTION & KEY VALUE PROPOSITIONS
          </label>
          <textarea
            rows={3}
            required
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="w-full bg-[#151515] border border-white/20 p-3.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] transition resize-none"
            placeholder="Describe key features, discount offers, warranty, or customer benefits..."
          />
        </div>

        {/* Campaign Goal */}
        <div>
          <label className="label-font text-[11px] text-white/70 mb-2 block font-bold">CAMPAIGN GOAL / OFFER TAG</label>
          <input
            type="text"
            value={campaignGoal}
            onChange={(e) => setCampaignGoal(e.target.value)}
            className="w-full bg-[#151515] border border-white/20 p-3.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] transition"
            placeholder="e.g., Summer Sale - 30% OFF, Free Shipping..."
          />
        </div>

        {/* Visual Style Tone */}
        <div>
          <label className="label-font text-[11px] text-white/70 mb-2 block font-bold">VISUAL DESIGN STYLE</label>
          <select
            value={styleTone}
            onChange={(e) => setStyleTone(e.target.value as any)}
            className="w-full bg-[#151515] border border-white/20 p-3.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] transition"
          >
            <option value="modern">Modern & Clean</option>
            <option value="luxury">Luxury & Premium Dark</option>
            <option value="cyberpunk">Cyberpunk Tech & Neon</option>
            <option value="minimalist">Minimalist Organic</option>
            <option value="vibrant">Vibrant & Playful</option>
            <option value="bold">Bold Discount & High Energy</option>
          </select>
        </div>
      </div>

      {/* Explicit Image Controls Section */}
      <div className="bg-[#151515] border border-white/20 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <ImageIcon className="w-4 h-4 text-[#C1FF72]" />
          <span className="ad-font text-sm text-white tracking-wider">
            GEMINI IMAGE ENGINE CONFIGURATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Resolution Affordance (1K, 2K, 4K) */}
          <div>
            <label className="label-font text-[10px] text-white/60 mb-2 block font-bold">
              RESOLUTION QUALITY
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['1K', '2K', '4K'] as ImageResolutionOption[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setImageResolution(res)}
                  className={`py-2 px-2 label-font text-xs font-bold transition border ${
                    imageResolution === res
                      ? 'neo-green font-black border-[#C1FF72]'
                      : 'bg-[#0A0A0A] border-white/20 text-white/70 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Image Model Affordance */}
          <div>
            <label className="label-font text-[10px] text-white/60 mb-2 block font-bold">IMAGE GENERATION MODEL</label>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value as ImageModelOption)}
              className="w-full bg-[#0A0A0A] border border-white/20 p-2 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72]"
            >
              <option value="gemini-3-pro-image-preview">
                gemini-3-pro-image-preview (Studio Quality)
              </option>
              <option value="gemini-3.1-flash-image-preview">
                gemini-3.1-flash-image-preview (Fast Flash)
              </option>
            </select>
          </div>

          {/* Aspect Ratio Affordance */}
          <div>
            <label className="label-font text-[10px] text-white/60 mb-2 block font-bold">BASE ASPECT RATIO</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatioOption)}
              className="w-full bg-[#0A0A0A] border border-white/20 p-2 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72]"
            >
              <option value="16:9">16:9 (Landscape Standard)</option>
              <option value="1:1">1:1 (Square Feed)</option>
              <option value="9:16">9:16 (Vertical Story)</option>
              <option value="4:3">4:3 (Classic Display)</option>
              <option value="3:4">3:4 (Portrait)</option>
              <option value="21:9">21:9 (Ultrawide Hero)</option>
              <option value="4:1">4:1 (Leaderboard)</option>
              <option value="1:4">1:4 (Skyscraper)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="neo-green w-full py-5 ad-font text-2xl hover:bg-white text-black transition-all transform active:scale-95 flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>GENERATING AD SUITE...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            <span>GENERATE ADS</span>
          </>
        )}
      </button>
    </form>
  );
};
