'use client';

import React, { useState } from 'react';
import { BannerAdData } from '@/lib/types';
import { BannerAd } from './BannerAd';
import { Smartphone, Monitor, LayoutGrid, Globe, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

interface AdSimulatorsProps {
  banners: BannerAdData[];
}

export const AdSimulators: React.FC<AdSimulatorsProps> = ({ banners }) => {
  const [simulatorMode, setSimulatorMode] = useState<'website' | 'social' | 'mobile_app'>('website');

  // Find corresponding banners
  const leaderboard = banners.find((b) => b.sizeId === 'leaderboard') || banners[0];
  const billboard = banners.find((b) => b.sizeId === 'billboard') || leaderboard;
  const mediumRect = banners.find((b) => b.sizeId === 'medium_rectangle') || banners[0];
  const skyscraper = banners.find((b) => b.sizeId === 'large_skyscraper') || banners[0];
  const socialSquare = banners.find((b) => b.sizeId === 'social_square') || banners[0];
  const socialStory = banners.find((b) => b.sizeId === 'social_story') || banners[0];
  const mobileBanner = banners.find((b) => b.sizeId === 'mobile_leaderboard') || banners[0];

  return (
    <div className="bg-[#0A0A0A] border-2 border-white/20 p-6 text-white space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="ad-font text-xl text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#C1FF72]" />
            <span>LIVE AD CONTEXT SIMULATOR</span>
          </h3>
          <p className="label-font text-xs text-white/50">
            Preview how your generated banner ads fit inside real websites, mobile apps, and social feeds.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#151515] p-1 border border-white/20 text-xs label-font font-bold">
          <button
            onClick={() => setSimulatorMode('website')}
            className={`px-3 py-1.5 transition flex items-center gap-1.5 ${
              simulatorMode === 'website' ? 'neo-green text-black font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>WEB PUBLICATION</span>
          </button>
          <button
            onClick={() => setSimulatorMode('social')}
            className={`px-3 py-1.5 transition flex items-center gap-1.5 ${
              simulatorMode === 'social' ? 'neo-green text-black font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>SOCIAL FEED</span>
          </button>
          <button
            onClick={() => setSimulatorMode('mobile_app')}
            className={`px-3 py-1.5 transition flex items-center gap-1.5 ${
              simulatorMode === 'mobile_app' ? 'neo-green text-black font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>MOBILE APP</span>
          </button>
        </div>
      </div>

      {/* SIMULATOR MODE 1: WEBSITE PUBLICATION */}
      {simulatorMode === 'website' && (
        <div className="bg-[#151515] border border-white/20 p-4 md:p-6 space-y-6">
          {/* Mock Web Browser Bar */}
          <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-2 border border-white/20 text-xs text-white/50 label-font">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-500" />
              <div className="w-3 h-3 bg-amber-500" />
              <div className="w-3 h-3 bg-emerald-500" />
            </div>
            <div className="flex-1 bg-[#151515] px-3 py-1 text-center text-[11px] font-mono text-white/60 truncate border border-white/10">
              https://techdaily-news.com/article/future-of-technology
            </div>
          </div>

          {/* Top Leaderboard Ad Slot */}
          <div className="flex flex-col items-center justify-center p-3 bg-[#0A0A0A] border border-white/20">
            <span className="text-[10px] text-[#C1FF72] mb-2 font-mono label-font font-bold">
              ADVERTISEMENT • TOP LEADERBOARD (728 × 90)
            </span>
            <div className="overflow-x-auto max-w-full">
              {leaderboard && <BannerAd banner={leaderboard} scale={0.95} />}
            </div>
          </div>

          {/* Main Website Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Article Column */}
            <div className="md:col-span-2 space-y-4">
              <h1 className="ad-font text-2xl md:text-3xl text-white">
                THE NEXT GENERATION OF DIGITAL INNOVATION IN 2026
              </h1>
              <div className="label-font text-xs text-white/50 flex items-center gap-3 font-bold">
                <span>BY SARAH JENKINS</span>
                <span>•</span>
                <span>JULY 26, 2026</span>
                <span>•</span>
                <span>5 MIN READ</span>
              </div>
              <p className="text-white/80 text-xs md:text-sm leading-relaxed label-font">
                As the digital ecosystem evolves, businesses are scaling user acquisition through hyper-personalized, visual-first advertising campaigns. Combining high-resolution photography with clear value propositions drives dramatic conversion lifts.
              </p>

              {/* Inline Content Medium Rectangle Ad */}
              <div className="my-6 p-4 bg-[#0A0A0A] border border-white/20 flex flex-col items-center">
                <span className="text-[10px] text-[#C1FF72] font-mono label-font font-bold mb-2">
                  SPONSORED CONTENT (300 × 250)
                </span>
                {mediumRect && <BannerAd banner={mediumRect} scale={1} />}
              </div>

              <p className="text-white/80 text-xs md:text-sm leading-relaxed label-font">
                Whether deploying targeted display networks or social media placements, consistent visual styling and responsive dimensions ensure brand resonance across all consumer touchpoints.
              </p>
            </div>

            {/* Sidebar Column with Skyscraper Ad */}
            <div className="space-y-4">
              <div className="bg-[#0A0A0A] p-4 border border-white/20 flex flex-col items-center">
                <span className="text-[10px] text-[#C1FF72] font-mono label-font font-bold mb-3">
                  SIDEBAR ADVERT (300 × 600)
                </span>
                {skyscraper && <BannerAd banner={skyscraper} scale={0.85} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATOR MODE 2: SOCIAL FEED */}
      {simulatorMode === 'social' && (
        <div className="max-w-md mx-auto bg-[#151515] border-2 border-white/20 overflow-hidden brutal-shadow">
          {/* Social Feed Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 neo-green text-black flex items-center justify-center font-black text-xs ad-font border border-black">
                {socialSquare?.brandName?.[0] || 'B'}
              </div>
              <div>
                <span className="font-bold text-xs text-white block leading-none label-font">
                  {socialSquare?.brandName || 'Brand'}
                </span>
                <span className="text-[10px] text-[#C1FF72] label-font font-bold">SPONSORED • PROMOTED</span>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </div>

          {/* Social Square Ad Post */}
          <div className="w-full flex justify-center bg-[#0A0A0A] py-2 border-b border-white/20">
            {socialSquare && <BannerAd banner={socialSquare} scale={0.36} />}
          </div>

          {/* Social Actions */}
          <div className="p-4 space-y-3 bg-[#151515]">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Heart className="w-5 h-5 text-[#C1FF72] fill-[#C1FF72] cursor-pointer" />
                <MessageCircle className="w-5 h-5 cursor-pointer hover:text-[#C1FF72]" />
                <Share2 className="w-5 h-5 cursor-pointer hover:text-[#C1FF72]" />
              </div>
            </div>
            <p className="text-xs text-white/90 label-font">
              <span className="font-bold mr-1.5 text-[#C1FF72]">{socialSquare?.brandName}:</span>
              {socialSquare?.headline} - {socialSquare?.subheadline}
            </p>
          </div>
        </div>
      )}

      {/* SIMULATOR MODE 3: MOBILE APP */}
      {simulatorMode === 'mobile_app' && (
        <div className="max-w-sm mx-auto bg-[#0A0A0A] border-4 border-white/30 p-4 flex flex-col h-[550px] justify-between relative brutal-shadow">
          {/* Phone Speaker Notch */}
          <div className="w-24 h-3 bg-white/20 mx-auto mb-4" />

          {/* App Content */}
          <div className="space-y-3 text-white flex-1 overflow-y-auto pr-1">
            <div className="h-28 bg-[#151515] border border-white/20 p-3 flex flex-col justify-end">
              <span className="ad-font text-base text-white">FITNESS & PRODUCTIVITY PULSE</span>
              <span className="text-xs text-white/50 label-font">Daily goal tracking updated</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-20 bg-[#151515] border border-white/20 p-2 text-xs label-font font-bold text-[#C1FF72]">STEPS: 8,420</div>
              <div className="h-20 bg-[#151515] border border-white/20 p-2 text-xs label-font font-bold text-[#C1FF72]">CALORIES: 640</div>
            </div>
          </div>

          {/* Sticky Mobile Leaderboard Banner (320x50) */}
          <div className="pt-2 border-t border-white/20 flex flex-col items-center justify-center">
            <span className="text-[9px] text-[#C1FF72] label-font font-bold mb-1">STICKY BANNER (320 × 50)</span>
            {mobileBanner && <BannerAd banner={mobileBanner} scale={1} />}
          </div>
        </div>
      )}
    </div>
  );
};
