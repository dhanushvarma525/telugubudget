import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = "https://www.anatago.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "AnantaGo",
    template: "%s | AnantaGo",
  },

  description:
    "AnantaGo covers AI, technology, apps, cybersecurity, how-to guides, and simple technology explainers.",

  applicationName: "AnantaGo",

  keywords: [
    "AI",
    "Artificial Intelligence",
    "Technology",
    "Tech News",
    "How-To Guides",
    "Apps",
    "Cybersecurity",
    "Technology Explained",
    "AnantaGo",
  ],

  authors: [
    {
      name: "AnantaGo",
      url: siteUrl,
    },
  ],

  creator: "AnantaGo",
  publisher: "AnantaGo",

  alternates: {
    canonical: siteUrl,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AnantaGo",

    title: "AnantaGo",

    description:
      "AI, technology, apps, cybersecurity, how-to guides, and simple technology explainers.",
  },

  twitter: {
    card: "summary_large_image",

    title: "AnantaGo",

    description:
      "AI, technology, apps, cybersecurity, how-to guides, and simple technology explainers.",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",

  name: "AnantaGo",
  url: siteUrl,

  description:
    "AnantaGo covers AI, technology, apps, cybersecurity, how-to guides, and simple technology explainers.",

  publisher: {
    "@type": "Organization",
    name: "AnantaGo",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Website Structured Data */}

        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              websiteSchema
            ),
          }}
        />
      </head>

      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}