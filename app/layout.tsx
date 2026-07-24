import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AnantaGo - Best Budget Deals & Buying Guides",
    template: "%s | AnantaGo",
  },

  description:
    "AnantaGo helps you discover best budget products, Amazon deals, Flipkart offers, buying guides and useful recommendations.",

  keywords: [
    "AnantaGo",
    "budget products",
    "Amazon deals",
    "Flipkart deals",
    "best gadgets",
    "buying guides",
    "tech deals",
  ],

  authors: [
    {
      name: "AnantaGo",
    },
  ],

  creator: "AnantaGo",

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  openGraph: {
    title: "AnantaGo - Best Budget Deals & Buying Guides",
    description:
      "Discover affordable products, deals and buying guides curated for smart shoppers.",
    url: "https://anantago.com",
    siteName: "AnantaGo",
    type: "website",
  },

  alternates: {
    canonical: "https://anantago.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://anantago.com";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="
          min-h-full
          flex
          flex-col
          pb-20
          bg-gray-100
          text-gray-900
          antialiased
        "
      >
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-TRKKZ0DQC5"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TRKKZ0DQC5');
          `}
        </Script>

        {/* Navbar */}
        <Navbar />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AnantaGo",
              url: siteUrl,
              logo: `${siteUrl}/icon.png`,
              description:
                "AnantaGo provides budget product recommendations, deals and buying guides.",
            }),
          }}
        />

        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AnantaGo",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {children}

        {/* Bottom Navigation */}
        <BottomNavigation />
      </body>
    </html>
  );
}