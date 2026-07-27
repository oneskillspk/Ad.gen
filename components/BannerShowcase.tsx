'use client';

import React, { useState } from 'react';
import { BannerAdData, AdCategory } from '@/lib/types';
import { BannerAd } from './BannerAd';
import { Download, Sparkles, Filter, CheckCircle2, Eye, Grid, ListFilter } from 'lucide-react';
import { toPng } from 'html-to-image';

interface BannerShowcaseProps {
  banners: BannerAdData[];
  selectedBannerId: string | null;
  onSelectBanner: (banner: BannerAdData) => void;
  isGenerating?: boolean;
}

export const BannerShowcase: React.FC<BannerShowcaseProps> = ({
  banners,
  selectedBannerId,
  onSelectBanner,
  isGenerating = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<AdCategory>('all');
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Filter banners based on category
  const filteredBanners = banners.filter((b) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'display')
      return ['medium_rectangle', 'leaderboard', 'large_skyscraper', 'wide_skyscraper', 'billboard', 'large_rectangle', 'hero_ultrawide'].includes(b.sizeId);
    if (activeCategory === 'social')
      return ['social_square', 'social_story', 'social_landscape', 'social_portrait'].includes(b.sizeId);
    if (activeCategory === 'mobile')
      return ['mobile_leaderboard', 'medium_rectangle', 'social_square'].includes(b.sizeId);
    return true;
  });

  const handleExportAll = async () => {
    setIsExportingAll(true);
    try {
      for (const banner of banners) {
        const el = document.getElementById(`banner-render-${banner.id}`);
        if (el) {
          const dataUrl = await toPng(el, { quality: 0.95, pixelRatio: 2 });
          const link = document.createElement('a');
          link.download = `${banner.brandName.toLowerCase().replace(/\s+/g, '-')}-${banner.sizeId}-${banner.width}x${banner.height}.png`;
          link.href = dataUrl;
          link.click();
          // Small timeout to prevent browser download lock
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    } catch (err) {
      console.error('Export all error:', err);
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Categories & Batch Export */}
      <div className="bg-[#0A0A0A] border-2 border-white/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs label-font">
          <span className="text-white/50 font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#C1FF72]" /> FILTER:
          </span>
          {[
            { id: 'all', label: `ALL SIZES (${banners.length})` },
            { id: 'display', label: 'DISPLAY ADS' },
            { id: 'social', label: 'SOCIAL MEDIA' },
            { id: 'mobile', label: 'MOBILE BANNERS' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as AdCategory)}
              className={`px-3 py-1.5 font-bold transition border ${
                activeCategory === cat.id
                  ? 'neo-green text-black font-black border-[#C1FF72]'
                  : 'bg-[#151515] text-white/70 hover:text-white border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Batch Export Button */}
        <button
          onClick={handleExportAll}
          disabled={isExportingAll || banners.length === 0}
          className="bg-white text-black hover:bg-[#C1FF72] label-font text-xs font-black py-2.5 px-4 border-2 border-white flex items-center gap-2 transition disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isExportingAll ? 'EXPORTING PNGS...' : 'EXPORT ALL (.ZIP/PNG)'}</span>
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.map((banner) => {
          const isSelected = selectedBannerId === banner.id;

          // Compute scale for thumbnail preview so large banners fit nicely
          let previewScale = 1;
          if (banner.width > 500) previewScale = 0.55;
          if (banner.width >= 900) previewScale = 0.42;
          if (banner.height >= 1000) previewScale = 0.28;

          return (
            <div
              key={banner.id}
              onClick={() => onSelectBanner(banner)}
              className={`group bg-[#151515] p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative ${
                isSelected
                  ? 'border-2 border-[#C1FF72] brutal-shadow bg-[#181818]'
                  : 'border border-white/20 hover:border-white/60'
              }`}
            >
              {/* Top Banner Header Info */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <h4 className="ad-font text-lg text-white flex items-center gap-2">
                    <span>{banner.sizeId.replace(/_/g, ' ').toUpperCase()}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#C1FF72]" />
                    )}
                  </h4>
                  <span className="label-font text-[10px] text-white/50">
                    {banner.width} × {banner.height} PX ({banner.aspectRatio})
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBanner(banner);
                  }}
                  className={`px-3 py-1 label-font text-[11px] font-bold border transition flex items-center gap-1 ${
                    isSelected
                      ? 'neo-green text-black border-[#C1FF72]'
                      : 'bg-[#0A0A0A] border-white/20 text-white/80 group-hover:border-[#C1FF72]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'EDITING' : 'EDIT'}</span>
                </button>
              </div>

              {/* Banner Render Stage */}
              <div className="flex-1 flex items-center justify-center p-3 bg-[#0A0A0A] border border-white/10 min-h-[220px] overflow-hidden">
                <BannerAd banner={banner} scale={previewScale} showDimensionsBadge />
              </div>

              {/* Footer specs */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between label-font text-[10px] text-white/60">
                <span className="truncate max-w-[180px]">HEADLINE: &quot;{banner.headline}&quot;</span>
                <span className="font-bold text-[#C1FF72] group-hover:translate-x-0.5 transition-transform">
                  EDIT →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
