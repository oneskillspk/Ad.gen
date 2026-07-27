'use client';

import React, { useState } from 'react';
import { BannerAdData, ImageModelOption, ImageResolutionOption, AspectRatioOption } from '@/lib/types';
import { Sparkles, RefreshCw, Wand2, Image as ImageIcon, Sliders, Palette, Type as TypeIcon, Link as LinkIcon, Download, Copy, Check } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';

interface BannerEditorProps {
  banner: BannerAdData;
  onUpdateBanner: (updated: BannerAdData) => void;
  onRegenerateImage: (params: {
    bannerId: string;
    prompt: string;
    aspectRatio: AspectRatioOption;
    imageSize: ImageResolutionOption;
    model: ImageModelOption;
  }) => Promise<void>;
  onApplyToAll?: (updated: Partial<BannerAdData>) => void;
  isGeneratingImage?: boolean;
}

export const BannerEditor: React.FC<BannerEditorProps> = ({
  banner,
  onUpdateBanner,
  onRegenerateImage,
  onApplyToAll,
  isGeneratingImage = false,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'image' | 'export'>('content');
  const [imagePrompt, setImagePrompt] = useState(banner.bgImagePrompt || `Studio visual background for ${banner.productName || 'product'}`);
  const [selectedResolution, setSelectedResolution] = useState<ImageResolutionOption>('1K');
  const [selectedModel, setSelectedModel] = useState<ImageModelOption>('gemini-3-pro-image-preview');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption>(banner.aspectRatio || '16:9');
  
  // Refine copy modal/loading
  const [isRefiningCopy, setIsRefiningCopy] = useState(false);
  const [copyVariations, setCopyVariations] = useState<{
    headlines: string[];
    subheadlines: string[];
    ctas: string[];
  } | null>(null);

  // Copy state for export HTML/CSS
  const [copiedCode, setCopiedCode] = useState(false);

  // Color preset handlers
  const COLOR_PRESETS = [
    { name: 'Neo Brutalist', primary: '#C1FF72', accent: '#ffffff', bg: '#0A0A0A', text: '#000000' },
    { name: 'Electric Blue', primary: '#2563eb', accent: '#f59e0b', bg: '#0f172a', text: '#ffffff' },
    { name: 'Neon Purple', primary: '#9333ea', accent: '#ec4899', bg: '#18181b', text: '#ffffff' },
    { name: 'Emerald Luxe', primary: '#059669', accent: '#fbbf24', bg: '#064e3b', text: '#ffffff' },
    { name: 'Sunset Warmth', primary: '#ea580c', accent: '#facc15', bg: '#451a03', text: '#ffffff' },
    { name: 'Minimal Dark', primary: '#ffffff', accent: '#38bdf8', bg: '#000000', text: '#ffffff' },
  ];

  const handleRefineCopy = async () => {
    setIsRefiningCopy(true);
    try {
      const res = await fetch('/api/banner/refine-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: banner.productName,
          productDescription: banner.productDescription,
          currentHeadline: banner.headline,
          currentCta: banner.ctaText,
        }),
      });
      const data = await res.json();
      if (data.variations) {
        setCopyVariations(data.variations);
      }
    } catch (err) {
      console.error('Error refining copy:', err);
    } finally {
      setIsRefiningCopy(false);
    }
  };

  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    const element = document.getElementById(`banner-render-${banner.id}`);
    if (!element) return;
    try {
      const downloadFn = format === 'png' ? toPng : toJpeg;
      const dataUrl = await downloadFn(element, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${banner.brandName.toLowerCase().replace(/\s+/g, '-')}-${banner.sizeId}-${banner.width}x${banner.height}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const generateEmbedHtml = () => {
    return `<a href="${banner.ctaUrl}" target="_blank" rel="nofollow" style="display:inline-block; text-decoration:none;">
  <div style="width:${banner.width}px; height:${banner.height}px; position:relative; overflow:hidden; border-radius:${banner.borderRadius}px; background-color:${banner.colorScheme.background}; font-family:sans-serif;">
    ${banner.bgImageUrl ? `<img src="${banner.bgImageUrl}" style="width:100%; height:100%; object-fit:cover; position:absolute; inset:0;" />` : ''}
    <div style="position:relative; z-index:10; padding:16px; color:${banner.colorScheme.textColor}; display:flex; flex-direction:column; justify-content:space-between; height:100%;">
      <div>
        <span style="background:${banner.colorScheme.cardBg}; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold; text-transform:uppercase;">${banner.brandName}</span>
        <h2 style="font-size:18px; font-weight:800; margin:8px 0;">${banner.headline}</h2>
        <p style="font-size:12px; opacity:0.9;">${banner.subheadline}</p>
      </div>
      <button style="background:${banner.colorScheme.primary}; color:${banner.colorScheme.primaryText}; border:none; padding:8px 16px; border-radius:${banner.borderRadius}px; font-weight:bold; cursor:pointer;">${banner.ctaText}</button>
    </div>
  </div>
</a>`;
  };

  return (
    <div className="bg-[#0A0A0A] border-2 border-white/20 p-5 text-white flex flex-col h-full max-h-[800px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div>
          <h3 className="ad-font text-xl text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#C1FF72]" />
            <span>BANNER EDITOR</span>
          </h3>
          <p className="label-font text-[10px] text-white/50">
            {banner.width} × {banner.height} ({banner.sizeId})
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#151515] p-1 border border-white/20 text-xs label-font font-bold">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 transition ${
              activeTab === 'content' ? 'neo-green text-black font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            COPY
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`px-3 py-1.5 transition ${
              activeTab === 'design' ? 'neo-green text-black font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            DESIGN
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3 py-1.5 transition flex items-center gap-1 ${
              activeTab === 'image' ? 'neo-green text-black font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>IMAGE</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 transition flex items-center gap-1 ${
              activeTab === 'export' ? 'neo-green text-black font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {/* --- TAB 1: COPY & CONTENT --- */}
        {activeTab === 'content' && (
          <div className="space-y-4 text-xs">
            {/* Headline */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">HEADLINE</label>
              <input
                type="text"
                value={banner.headline}
                onChange={(e) => onUpdateBanner({ ...banner, headline: e.target.value })}
                className="w-full bg-[#151515] border border-white/20 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#C1FF72]"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">SUBHEADLINE / BODY</label>
              <textarea
                rows={2}
                value={banner.subheadline}
                onChange={(e) => onUpdateBanner({ ...banner, subheadline: e.target.value })}
                className="w-full bg-[#151515] border border-white/20 p-2.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Badge Text */}
              <div>
                <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">BADGE TAG</label>
                <input
                  type="text"
                  value={banner.badgeText}
                  onChange={(e) => onUpdateBanner({ ...banner, badgeText: e.target.value })}
                  className="w-full bg-[#151515] border border-white/20 p-2 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72]"
                  placeholder="20% OFF, NEW..."
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">BRAND NAME</label>
                <input
                  type="text"
                  value={banner.brandName}
                  onChange={(e) => onUpdateBanner({ ...banner, brandName: e.target.value })}
                  className="w-full bg-[#151515] border border-white/20 p-2 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72]"
                />
              </div>
            </div>

            {/* CTA Label & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">CTA BUTTON TEXT</label>
                <input
                  type="text"
                  value={banner.ctaText}
                  onChange={(e) => onUpdateBanner({ ...banner, ctaText: e.target.value })}
                  className="w-full bg-[#151515] border border-white/20 p-2 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72]"
                />
              </div>

              <div>
                <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">CTA LINK URL</label>
                <input
                  type="text"
                  value={banner.ctaUrl}
                  onChange={(e) => onUpdateBanner({ ...banner, ctaUrl: e.target.value })}
                  className="w-full bg-[#151515] border border-white/20 p-2 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72]"
                />
              </div>
            </div>

            {/* AI Copy Refiner Assistant */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={handleRefineCopy}
                disabled={isRefiningCopy}
                className="w-full bg-[#151515] hover:bg-white/10 text-[#C1FF72] border border-[#C1FF72]/60 py-2 px-3 label-font text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {isRefiningCopy ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>GENERATE ALTERNATIVE COPY WITH GEMINI</span>
              </button>

              {copyVariations && (
                <div className="mt-3 bg-[#151515] p-3 border border-white/20 space-y-3">
                  <span className="label-font text-[11px] font-bold text-[#C1FF72] block uppercase">
                    SUGGESTED VARIATIONS:
                  </span>

                  <div>
                    <span className="label-font text-[10px] text-white/50 block mb-1">HEADLINES:</span>
                    <div className="space-y-1">
                      {copyVariations.headlines.map((h, idx) => (
                        <button
                          key={idx}
                          onClick={() => onUpdateBanner({ ...banner, headline: h })}
                          className="w-full text-left text-xs bg-[#0A0A0A] hover:bg-[#C1FF72] hover:text-black p-2 border border-white/10 text-white transition truncate label-font font-bold"
                        >
                          &quot;{h}&quot;
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="label-font text-[10px] text-white/50 block mb-1">CTA BUTTONS:</span>
                    <div className="flex flex-wrap gap-1">
                      {copyVariations.ctas.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => onUpdateBanner({ ...banner, ctaText: c })}
                          className="text-xs bg-[#0A0A0A] hover:bg-[#C1FF72] hover:text-black px-2.5 py-1 border border-white/10 text-white transition label-font font-bold"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: DESIGN SYSTEM & STYLING --- */}
        {activeTab === 'design' && (
          <div className="space-y-4 text-xs">
            {/* Color Palette Presets */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-2 block font-bold">COLOR PALETTE PRESETS</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onUpdateBanner({
                        ...banner,
                        colorScheme: {
                          ...banner.colorScheme,
                          primary: preset.primary,
                          accentColor: preset.accent,
                          background: preset.bg,
                          textColor: preset.text,
                        },
                      })
                    }
                    className="p-2 bg-[#151515] border border-white/20 hover:border-[#C1FF72] transition text-left flex flex-col gap-1.5"
                  >
                    <span className="label-font text-[9px] font-bold text-white truncate">{preset.name}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-none border border-white/20" style={{ backgroundColor: preset.primary }} />
                      <div className="w-3.5 h-3.5 rounded-none border border-white/20" style={{ backgroundColor: preset.accent }} />
                      <div className="w-3.5 h-3.5 rounded-none border border-white/20" style={{ backgroundColor: preset.bg }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="label-font text-[10px] text-white/60 mb-1 block">CTA BUTTON COLOR</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={banner.colorScheme.primary}
                    onChange={(e) =>
                      onUpdateBanner({
                        ...banner,
                        colorScheme: { ...banner.colorScheme, primary: e.target.value },
                      })
                    }
                    className="w-8 h-8 bg-transparent cursor-pointer border border-white/20"
                  />
                  <span className="text-white font-mono text-xs">{banner.colorScheme.primary}</span>
                </div>
              </div>

              <div>
                <label className="label-font text-[10px] text-white/60 mb-1 block">BADGE ACCENT COLOR</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={banner.colorScheme.accentColor}
                    onChange={(e) =>
                      onUpdateBanner({
                        ...banner,
                        colorScheme: { ...banner.colorScheme, accentColor: e.target.value },
                      })
                    }
                    className="w-8 h-8 bg-transparent cursor-pointer border border-white/20"
                  />
                  <span className="text-white font-mono text-xs">{banner.colorScheme.accentColor}</span>
                </div>
              </div>
            </div>

            {/* Typography Selection */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">TYPOGRAPHY FONT FAMILY</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'SANS', value: 'sans' },
                  { label: 'SERIF', value: 'serif' },
                  { label: 'DISPLAY', value: 'display' },
                  { label: 'MONO', value: 'mono' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onUpdateBanner({ ...banner, fontFamily: f.value as any })}
                    className={`py-1.5 px-2 label-font text-xs font-bold border transition ${
                      banner.fontFamily === f.value
                        ? 'neo-green text-black border-[#C1FF72]'
                        : 'bg-[#151515] border-white/20 text-white/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Overlay Opacity & Border Radius */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between label-font text-[10px] text-white/70 mb-1">
                  <span>DARK OVERLAY TINT</span>
                  <span>{banner.overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={banner.overlayOpacity}
                  onChange={(e) => onUpdateBanner({ ...banner, overlayOpacity: Number(e.target.value) })}
                  className="w-full accent-[#C1FF72] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between label-font text-[10px] text-white/70 mb-1">
                  <span>CORNER BORDER RADIUS</span>
                  <span>{banner.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={banner.borderRadius}
                  onChange={(e) => onUpdateBanner({ ...banner, borderRadius: Number(e.target.value) })}
                  className="w-full accent-[#C1FF72] cursor-pointer"
                />
              </div>
            </div>

            {/* Apply To All Banners Button */}
            {onApplyToAll && (
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() =>
                    onApplyToAll({
                      colorScheme: banner.colorScheme,
                      fontFamily: banner.fontFamily,
                      overlayOpacity: banner.overlayOpacity,
                      borderRadius: banner.borderRadius,
                    })
                  }
                  className="w-full bg-[#151515] hover:bg-white text-white hover:text-black label-font py-2.5 text-xs font-bold border border-white/20 transition"
                >
                  APPLY STYLING TO ALL BANNERS
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: AI IMAGE GENERATOR CONTROLS --- */}
        {activeTab === 'image' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#151515] border border-[#C1FF72]/40 p-3">
              <span className="text-[#C1FF72] label-font font-bold block mb-1 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-[#C1FF72]" />
                GEMINI AI IMAGE GENERATOR
              </span>
              <p className="text-[11px] text-white/70 leading-relaxed label-font">
                Generate high-resolution visual art specifically formatted for this banner format or aspect ratio.
              </p>
            </div>

            {/* Prompt input */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">CUSTOM IMAGE PROMPT</label>
              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full bg-[#151515] border border-white/20 p-2.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72] resize-none"
                placeholder="Describe product studio lighting, colors, backdrop scene..."
              />
            </div>

            {/* Model Selection (Affordance requirement) */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">IMAGE MODEL</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ImageModelOption)}
                className="w-full bg-[#151515] border border-white/20 p-2.5 text-white label-font text-xs focus:outline-none focus:border-[#C1FF72]"
              >
                <option value="gemini-3-pro-image-preview">
                  gemini-3-pro-image-preview (Studio Quality Pro)
                </option>
                <option value="gemini-3.1-flash-image-preview">
                  gemini-3.1-flash-image-preview (Ultra-Fast Flash)
                </option>
                <option value="gemini-3.1-flash-lite-image">
                  gemini-3.1-flash-lite-image (Lite)
                </option>
              </select>
            </div>

            {/* Resolution Selector (1K, 2K, 4K Affordance requirement) */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">RESOLUTION AFFORDANCE</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as ImageResolutionOption[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setSelectedResolution(res)}
                    className={`py-2 px-3 border label-font text-xs font-bold transition ${
                      selectedResolution === res
                        ? 'neo-green text-black border-[#C1FF72]'
                        : 'bg-[#151515] border-white/20 text-white/60 hover:text-white'
                    }`}
                  >
                    {res} RES
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector (Affordance requirement) */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-1 block font-bold">ASPECT RATIO CONTROL</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'] as AspectRatioOption[]).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ar)}
                    className={`py-1.5 px-2 border label-font text-[11px] font-bold transition ${
                      selectedAspectRatio === ar
                        ? 'neo-green text-black border-[#C1FF72]'
                        : 'bg-[#151515] border-white/20 text-white/60 hover:text-white'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Regenerate Button */}
            <button
              onClick={() =>
                onRegenerateImage({
                  bannerId: banner.id,
                  prompt: imagePrompt,
                  aspectRatio: selectedAspectRatio,
                  imageSize: selectedResolution,
                  model: selectedModel,
                })
              }
              disabled={isGeneratingImage}
              className="w-full neo-green hover:bg-white text-black label-font font-black py-3 px-4 border-2 border-[#C1FF72] flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>GENERATING BACKGROUND ({selectedResolution})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GENERATE BACKGROUND IMAGE</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* --- TAB 4: EXPORT & CODE --- */}
        {activeTab === 'export' && (
          <div className="space-y-4 text-xs">
            {/* Quick Image Download Buttons */}
            <div>
              <label className="label-font text-[10px] text-white/70 mb-2 block font-bold">EXPORT IMAGE FILE</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadImage('png')}
                  className="neo-green hover:bg-white text-black label-font font-black py-2.5 px-3 border-2 border-[#C1FF72] flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PNG</span>
                </button>
                <button
                  onClick={() => handleDownloadImage('jpeg')}
                  className="bg-[#151515] hover:bg-white/10 text-white label-font font-bold py-2.5 px-3 border border-white/20 flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD JPEG</span>
                </button>
              </div>
            </div>

            {/* Embeddable HTML/CSS */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label-font text-[10px] text-white/70 font-bold">EMBEDDABLE HTML/CSS CODE</label>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateEmbedHtml());
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="text-[#C1FF72] hover:underline label-font font-bold flex items-center gap-1 text-[11px]"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#C1FF72]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
              </div>
              <textarea
                rows={8}
                readOnly
                value={generateEmbedHtml()}
                className="w-full bg-[#151515] font-mono border border-white/20 p-2.5 text-[10px] text-white/80 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
