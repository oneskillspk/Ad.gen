'use client';

import React, { useState } from 'react';
import { BannerAdData, CampaignConfig, ImageModelOption, ImageResolutionOption, AspectRatioOption } from '@/lib/types';
import { CampaignForm } from '@/components/CampaignForm';
import { BannerShowcase } from '@/components/BannerShowcase';
import { BannerEditor } from '@/components/BannerEditor';
import { AdSimulators } from '@/components/AdSimulators';
import { Sparkles, Layers, Sliders, Monitor, Download, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function HomePage() {
  const [banners, setBanners] = useState<BannerAdData[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<BannerAdData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSingleImage, setIsGeneratingSingleImage] = useState(false);
  const [activeView, setActiveView] = useState<'showcase' | 'simulator'>('showcase');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Handle Full Campaign Generation
  const handleGenerateCampaign = async (config: CampaignConfig) => {
    setIsGenerating(true);
    setStatusMessage('Crafting ad copy with Gemini AI & rendering studio-quality visual assets...');
    try {
      const res = await fetch('/api/banner/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate campaign.');
      }

      if (data.banners && data.banners.length > 0) {
        setBanners(data.banners);
        setSelectedBanner(data.banners[0]); // Default select first banner
        setStatusMessage(null);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error generating campaign:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Regenerate Image for single banner
  const handleRegenerateImage = async (params: {
    bannerId: string;
    prompt: string;
    aspectRatio: AspectRatioOption;
    imageSize: ImageResolutionOption;
    model: ImageModelOption;
  }) => {
    setIsGeneratingSingleImage(true);
    try {
      const res = await fetch('/api/banner/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: params.prompt,
          aspectRatio: params.aspectRatio,
          imageSize: params.imageSize,
          model: params.model,
          productName: selectedBanner?.productName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        // Update both the banners array and the currently selected banner
        setBanners((prev) =>
          prev.map((b) =>
            b.id === params.bannerId
              ? { ...b, bgImageUrl: data.imageUrl, bgImagePrompt: params.prompt }
              : b
          )
        );

        if (selectedBanner && selectedBanner.id === params.bannerId) {
          setSelectedBanner({
            ...selectedBanner,
            bgImageUrl: data.imageUrl,
            bgImagePrompt: params.prompt,
          });
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Image generation failed: ${error.message}`);
    } finally {
      setIsGeneratingSingleImage(false);
    }
  };

  // Update single banner data
  const handleUpdateBanner = (updated: BannerAdData) => {
    setSelectedBanner(updated);
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  // Apply styles globally to all banners
  const handleApplyToAll = (updatedStyles: Partial<BannerAdData>) => {
    setBanners((prev) =>
      prev.map((b) => ({
        ...b,
        ...updatedStyles,
        colorScheme: {
          ...b.colorScheme,
          ...(updatedStyles.colorScheme || {}),
        },
      }))
    );
    if (selectedBanner) {
      setSelectedBanner({
        ...selectedBanner,
        ...updatedStyles,
        colorScheme: {
          ...selectedBanner.colorScheme,
          ...(updatedStyles.colorScheme || {}),
        },
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-sans pb-20 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl ad-font text-white tracking-tight">AD.GEN</span>
            <span className="label-font text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
              V2.0.4
            </span>
          </div>

          <div className="flex items-center gap-4 label-font text-[11px]">
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 bg-black/60 text-white font-mono">
              <span className="w-2 h-2 rounded-full bg-[#C1FF72] animate-pulse"></span>
              <span>GEMINI 3 PRO ENGINE</span>
            </span>
            <div className="neo-green px-3.5 py-1.5 font-bold text-black ad-font text-xs tracking-wider">
              STUDIO PRO
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 flex-1 w-full">
        {/* Campaign Input Section */}
        <section>
          <CampaignForm
            onGenerateCampaign={handleGenerateCampaign}
            isGenerating={isGenerating}
          />
        </section>

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-[#151515] border border-[#C1FF72] text-[#C1FF72] label-font text-xs p-4 rounded-none flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0 animate-pulse text-[#C1FF72]" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Generated Banners View Stage */}
        {banners.length > 0 && (
          <section className="space-y-6">
            {/* Navigation Bar for Generated Campaign */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl ad-font text-white flex items-center gap-3">
                  <Layers className="w-6 h-6 text-[#C1FF72]" />
                  <span>GENERATED ASSETS ({banners.length} SIZES)</span>
                </h2>
                <p className="label-font text-[11px] text-white/50 mt-1">
                  PRODUCT: <strong className="text-white">{banners[0]?.productName}</strong> | BRAND: <strong className="text-[#C1FF72]">{banners[0]?.brandName}</strong>
                </p>
              </div>

              {/* View Selector */}
              <div className="flex items-center gap-1 bg-[#151515] p-1 border border-white/20 text-xs label-font font-bold">
                <button
                  onClick={() => setActiveView('showcase')}
                  className={`px-4 py-2 transition flex items-center gap-1.5 ${
                    activeView === 'showcase' ? 'neo-green font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>GALLERY & EDITOR</span>
                </button>
                <button
                  onClick={() => setActiveView('simulator')}
                  className={`px-4 py-2 transition flex items-center gap-1.5 ${
                    activeView === 'simulator' ? 'neo-green font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>LIVE SIMULATOR</span>
                </button>
              </div>
            </div>

            {/* TAB 1: SHOWCASE & CUSTOMIZER EDITOR SIDE-BY-SIDE */}
            {activeView === 'showcase' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Gallery of Banners */}
                <div className="lg:col-span-7 space-y-6">
                  <BannerShowcase
                    banners={banners}
                    selectedBannerId={selectedBanner?.id || null}
                    onSelectBanner={(b) => setSelectedBanner(b)}
                  />
                </div>

                {/* Right Column: Sticky Banner Customizer Panel */}
                <div className="lg:col-span-5 lg:sticky lg:top-24">
                  {selectedBanner ? (
                    <BannerEditor
                      banner={selectedBanner}
                      onUpdateBanner={handleUpdateBanner}
                      onRegenerateImage={handleRegenerateImage}
                      onApplyToAll={handleApplyToAll}
                      isGeneratingImage={isGeneratingSingleImage}
                    />
                  ) : (
                    <div className="bg-[#151515] border border-white/10 p-8 text-center text-white/50 label-font text-xs">
                      SELECT ANY BANNER AD FROM THE GALLERY TO CUSTOMIZE COPY, STYLING, AND BACKGROUND IMAGES.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE CONTEXT SIMULATOR */}
            {activeView === 'simulator' && (
              <AdSimulators banners={banners} />
            )}
          </section>
        )}
      </div>

      {/* FOOTER STATUS BAR (Bold Typography Neo-Brutalist Theme) */}
      <footer className="fixed bottom-0 left-0 w-full h-9 neo-green text-black flex items-center justify-between px-6 label-font text-[10px] font-bold z-50 uppercase tracking-tight border-t-2 border-black">
        <div className="flex items-center gap-4">
          <span>AI ENGINE: GEMINI-3-PRO</span>
          <span className="opacity-40">|</span>
          <span>ESTIMATED RENDER TIME: 0.4s</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          <span>SYSTEMS OPERATIONAL</span>
        </div>
      </footer>
    </main>
  );
}
