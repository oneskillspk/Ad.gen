export type AdSizeId =
  | 'medium_rectangle'   // 300x250
  | 'leaderboard'        // 728x90
  | 'large_skyscraper'   // 300x600
  | 'wide_skyscraper'    // 160x600
  | 'mobile_leaderboard' // 320x50
  | 'billboard'          // 970x250
  | 'large_rectangle'    // 336x280
  | 'social_square'      // 1080x1080 (1:1)
  | 'social_story'       // 1080x1920 (9:16)
  | 'social_landscape'   // 1200x630 (16:9)
  | 'social_portrait'    // 1080x1350 (3:4)
  | 'hero_ultrawide';    // 1200x514 (21:9)

export type AdCategory = 'display' | 'social' | 'mobile' | 'all';

export type AspectRatioOption = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9' | '4:1' | '1:4';

export type ImageResolutionOption = '1K' | '2K' | '4K';

export type ImageModelOption = 'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview' | 'gemini-3.1-flash-lite-image';

export interface AdFormatSpec {
  id: AdSizeId;
  name: string;
  width: number;
  height: number;
  category: 'display' | 'social' | 'mobile';
  aspectRatio: AspectRatioOption;
  description: string;
  isPopular?: boolean;
}

export interface BannerAdData {
  id: string;
  sizeId: AdSizeId;
  width: number;
  height: number;
  aspectRatio: AspectRatioOption;
  headline: string;
  subheadline: string;
  badgeText: string; // e.g., "SPECIAL OFFER", "NEW ARRIVAL", "25% OFF"
  ctaText: string;   // e.g., "Shop Now", "Get Started", "Claim Offer"
  ctaUrl: string;
  brandName: string;
  brandLogoUrl?: string;
  bgImageUrl?: string;
  bgImagePrompt?: string;
  
  // Design settings
  colorScheme: {
    primary: string;     // e.g. CTA button color
    primaryText: string; // CTA text color
    background: string;  // Fallback background / overlay tint
    textColor: string;   // Main text color
    accentColor: string; // Badge / highlight color
    accentText: string;
    cardBg: string;      // Content box background (rgba or hex)
  };
  fontFamily: 'sans' | 'serif' | 'display' | 'mono';
  layoutStyle: 'overlay' | 'split-left' | 'split-right' | 'minimal' | 'bold-hero';
  overlayOpacity: number; // 0 to 100%
  borderRadius: number;  // 0 to 24px
  
  // Custom metadata
  productName: string;
  productDescription: string;
  productUrl: string;
}

export interface CampaignConfig {
  productName: string;
  productDescription: string;
  productUrl: string;
  brandName: string;
  campaignGoal: string;
  targetAudience: string;
  styleTone: 'modern' | 'minimalist' | 'luxury' | 'bold' | 'vibrant' | 'cyberpunk';
  customColors?: {
    primary?: string;
    accent?: string;
    background?: string;
  };

  // Image Settings (Affordances required by blocks)
  imageResolution: ImageResolutionOption; // 1K, 2K, 4K
  imageModel: ImageModelOption;           // gemini-3-pro-image-preview or gemini-3.1-flash-image-preview
  aspectRatio: AspectRatioOption;         // 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9
  includeProductCutout?: boolean;
}

export const AD_FORMAT_SPECS: AdFormatSpec[] = [
  {
    id: 'medium_rectangle',
    name: 'Medium Rectangle',
    width: 300,
    height: 250,
    category: 'display',
    aspectRatio: '4:3',
    description: 'Most popular display format for website content columns',
    isPopular: true,
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    width: 728,
    height: 90,
    category: 'display',
    aspectRatio: '4:1',
    description: 'Top banner ad on editorial, news, and SaaS sites',
    isPopular: true,
  },
  {
    id: 'large_skyscraper',
    name: 'Half Page / Large Skyscraper',
    width: 300,
    height: 600,
    category: 'display',
    aspectRatio: '1:4',
    description: 'High impact vertical sidebar hero ad with huge engagement',
    isPopular: true,
  },
  {
    id: 'wide_skyscraper',
    name: 'Wide Skyscraper',
    width: 160,
    height: 600,
    category: 'display',
    aspectRatio: '1:4',
    description: 'Standard narrow vertical skyscraper for side margins',
  },
  {
    id: 'billboard',
    name: 'Billboard',
    width: 970,
    height: 250,
    category: 'display',
    aspectRatio: '4:1',
    description: 'Premium ultra-wide header banner on high-traffic sites',
  },
  {
    id: 'mobile_leaderboard',
    name: 'Mobile Banner',
    width: 320,
    height: 50,
    category: 'mobile',
    aspectRatio: '4:1',
    description: 'Standard sticky mobile screen banner',
    isPopular: true,
  },
  {
    id: 'large_rectangle',
    name: 'Large Rectangle',
    width: 336,
    height: 280,
    category: 'display',
    aspectRatio: '4:3',
    description: 'Prominent inline post and article end banner',
  },
  {
    id: 'social_square',
    name: 'Social Square (1:1)',
    width: 1080,
    height: 1080,
    category: 'social',
    aspectRatio: '1:1',
    description: 'Instagram, Facebook & LinkedIn feed post banner',
    isPopular: true,
  },
  {
    id: 'social_story',
    name: 'Social Story / Reel (9:16)',
    width: 1080,
    height: 1920,
    category: 'social',
    aspectRatio: '9:16',
    description: 'Full screen vertical story for IG, TikTok, YouTube Shorts',
    isPopular: true,
  },
  {
    id: 'social_landscape',
    name: 'Social Feed / Web (16:9)',
    width: 1200,
    height: 630,
    category: 'social',
    aspectRatio: '16:9',
    description: 'Facebook, X (Twitter), and LinkedIn link preview banner',
    isPopular: true,
  },
  {
    id: 'social_portrait',
    name: 'Social Portrait (3:4)',
    width: 1080,
    height: 1350,
    category: 'social',
    aspectRatio: '3:4',
    description: 'Optimal portrait height for Instagram and Pinterest feeds',
  },
  {
    id: 'hero_ultrawide',
    name: 'Ultrawide Banner (21:9)',
    width: 1200,
    height: 514,
    category: 'display',
    aspectRatio: '21:9',
    description: 'Modern wide website hero header & desktop banner',
  },
];
