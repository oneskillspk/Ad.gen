import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-Q6FGZL9WCK';

export const metadata: Metadata = {
  title: 'AI Banner Ad Studio',
  description: 'Generate high-quality banner ads in all standard display and social sizes using Gemini AI.',
  verification: {
    google: 'google4d5c5e8bca4799fa',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

