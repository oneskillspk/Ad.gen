'use client';

import React from 'react';
import { BannerAdData } from '@/lib/types';
import { ExternalLink, Tag } from 'lucide-react';

interface BannerAdProps {
  banner: BannerAdData;
  scale?: number; // Scaling factor for preview grid
  className?: string;
  onClick?: () => void;
  showDimensionsBadge?: boolean;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  banner,
  scale = 1,
  className = '',
  onClick,
  showDimensionsBadge = false,
}) => {
  const {
    width,
    height,
    headline,
    subheadline,
    badgeText,
    ctaText,
    ctaUrl,
    brandName,
    brandLogoUrl,
    bgImageUrl,
    colorScheme,
    fontFamily = 'sans',
    overlayOpacity = 40,
    borderRadius = 8,
  } = banner;

  // Font family mapping
  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'display'
      ? 'font-extrabold tracking-tight'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Format aspect metrics
  const isLeaderboard = width >= 600 && height <= 120;
  const isMobileBanner = width <= 350 && height <= 60;
  const isTallSkyscraper = height >= 500 && width <= 320;
  const isSquareOrCard = Math.abs(width - height) < 100;
  const isStory = height > width * 1.5;

  return (
    <div
      className={`relative inline-block select-none overflow-hidden group ${className}`}
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
      }}
      onClick={onClick}
    >
      {/* Container scaled down or rendered 1:1 */}
      <div
        id={`banner-render-${banner.id}`}
        className={`relative w-full h-full flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 ${fontClass}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: scale !== 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'top left',
          borderRadius: `${borderRadius}px`,
          backgroundColor: colorScheme.background,
        }}
      >
        {/* Background Image & Overlay */}
        {bgImageUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={bgImageUrl}
              alt={headline}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 transition-opacity"
              style={{
                backgroundColor: colorScheme.background,
                opacity: overlayOpacity / 100,
              }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              style={{ opacity: Math.max(0.3, overlayOpacity / 100) }}
            />
          </div>
        )}

        {/* --- Content Layout Variants --- */}

        {/* 1. HORIZONTAL LEADERBOARD / MOBILE BANNER LAYOUT */}
        {(isLeaderboard || isMobileBanner) ? (
          <div className="relative z-10 w-full h-full flex items-center justify-between px-4 py-2 gap-3 text-white">
            {/* Left: Brand + Badge */}
            <div className="flex items-center gap-3 shrink-0">
              {brandLogoUrl ? (
                <img
                  src={brandLogoUrl}
                  alt={brandName}
                  className="h-6 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  className="font-bold tracking-wider text-xs uppercase px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: colorScheme.cardBg,
                    color: colorScheme.textColor,
                  }}
                >
                  {brandName}
                </span>
              )}

              {badgeText && !isMobileBanner && (
                <span
                  className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full tracking-wide shadow-sm"
                  style={{
                    backgroundColor: colorScheme.accentColor,
                    color: colorScheme.accentText || '#000000',
                  }}
                >
                  {badgeText}
                </span>
              )}
            </div>

            {/* Center: Headline & Subheadline */}
            <div className="flex-1 min-w-0 px-2">
              <h3
                className={`font-bold leading-tight truncate ${
                  isMobileBanner ? 'text-xs' : 'text-sm md:text-base'
                }`}
                style={{ color: colorScheme.textColor }}
              >
                {headline}
              </h3>
              {!isMobileBanner && subheadline && (
                <p
                  className="text-xs truncate opacity-85"
                  style={{ color: colorScheme.textColor }}
                >
                  {subheadline}
                </p>
              )}
            </div>

            {/* Right: CTA Button */}
            <div className="shrink-0">
              <a
                href={ctaUrl || '#'}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 font-bold transition-all shadow-md hover:brightness-110 active:scale-95 ${
                  isMobileBanner ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3.5 py-1.5'
                }`}
                style={{
                  backgroundColor: colorScheme.primary,
                  color: colorScheme.primaryText,
                  borderRadius: `${Math.min(borderRadius, 12)}px`,
                }}
              >
                <span>{ctaText}</span>
                {!isMobileBanner && <ExternalLink className="w-3 h-3 opacity-80" />}
              </a>
            </div>
          </div>
        ) : isTallSkyscraper ? (
          /* 2. TALL VERTICAL SKYSCRAPER LAYOUT (300x600, 160x600) */
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-5 text-white">
            {/* Top: Brand Header & Badge */}
            <div className="flex flex-col items-start gap-3">
              <div
                className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm"
                style={{
                  backgroundColor: colorScheme.cardBg,
                  color: colorScheme.textColor,
                }}
              >
                {brandName}
              </div>

              {badgeText && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase rounded-full shadow-md"
                  style={{
                    backgroundColor: colorScheme.accentColor,
                    color: colorScheme.accentText || '#000000',
                  }}
                >
                  <Tag className="w-3 h-3" />
                  <span>{badgeText}</span>
                </div>
              )}
            </div>

            {/* Center: Main Headline & Subheadline */}
            <div className="my-auto py-4">
              <h2
                className={`font-black leading-tight mb-2 drop-shadow-md ${
                  width <= 180 ? 'text-lg' : 'text-2xl'
                }`}
                style={{ color: colorScheme.textColor }}
              >
                {headline}
              </h2>
              {subheadline && (
                <p
                  className="text-xs md:text-sm opacity-90 leading-relaxed drop-shadow"
                  style={{ color: colorScheme.textColor }}
                >
                  {subheadline}
                </p>
              )}
            </div>

            {/* Bottom: Big CTA Button */}
            <div className="w-full pt-2">
              <a
                href={ctaUrl || '#'}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 font-bold text-center text-sm py-3 px-4 transition-all shadow-lg hover:brightness-110 active:scale-95"
                style={{
                  backgroundColor: colorScheme.primary,
                  color: colorScheme.primaryText,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                <span>{ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* 3. SQUARE / STORY / LANDSCAPE CARD LAYOUT */
          <div
            className={`relative z-10 w-full h-full flex flex-col justify-between text-white ${
              isStory ? 'p-8 md:p-12' : 'p-5 md:p-6'
            }`}
          >
            {/* Top Bar: Brand + Badge */}
            <div className="flex items-center justify-between w-full">
              <span
                className="font-bold text-xs uppercase tracking-wider px-3 py-1 rounded shadow-sm backdrop-blur-md"
                style={{
                  backgroundColor: colorScheme.cardBg,
                  color: colorScheme.textColor,
                }}
              >
                {brandName}
              </span>

              {badgeText && (
                <span
                  className="px-3 py-1 text-xs font-black uppercase rounded-full shadow-md tracking-wide"
                  style={{
                    backgroundColor: colorScheme.accentColor,
                    color: colorScheme.accentText || '#000000',
                  }}
                >
                  {badgeText}
                </span>
              )}
            </div>

            {/* Middle: Content Box with Backdrop Blur styling */}
            <div
              className={`w-full rounded-xl p-4 my-auto backdrop-blur-sm border border-white/10 ${
                isStory ? 'space-y-4 p-6' : 'space-y-2'
              }`}
              style={{ backgroundColor: colorScheme.cardBg }}
            >
              <h2
                className={`font-black leading-snug ${
                  isStory
                    ? 'text-3xl md:text-4xl'
                    : width >= 400
                    ? 'text-2xl'
                    : 'text-lg'
                }`}
                style={{ color: colorScheme.textColor }}
              >
                {headline}
              </h2>
              {subheadline && (
                <p
                  className={`opacity-90 leading-relaxed ${
                    isStory ? 'text-base' : 'text-xs md:text-sm'
                  }`}
                  style={{ color: colorScheme.textColor }}
                >
                  {subheadline}
                </p>
              )}
            </div>

            {/* Bottom Bar: Action CTA */}
            <div className="w-full pt-2">
              <a
                href={ctaUrl || '#'}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 font-bold text-center transition-all shadow-xl hover:brightness-110 active:scale-95 ${
                  isStory ? 'py-4 text-lg' : 'py-3 text-sm'
                }`}
                style={{
                  backgroundColor: colorScheme.primary,
                  color: colorScheme.primaryText,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                <span>{ctaText}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Hover Dimension Tag */}
        {showDimensionsBadge && (
          <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none">
            {width} × {height}
          </div>
        )}
      </div>
    </div>
  );
};
