import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.anatago.com"),

  title: {
    default: "AnantaGo — AI, Tech & Digital Life",
    template: "%s | AnantaGo",
  },

  description:
    "AnantaGo covers AI, technology, apps, cybersecurity, how-to guides and easy-to-understand technology explainers.",

  keywords: [
    "AI",
    "Artificial Intelligence",
    "Technology",
    "Tech News",
    "How To",
    "Apps",
    "Cybersecurity",
    "AI Tools",
    "Technology Guides",
  ],

  authors: [
    {
      name: "AnantaGo",
      url: "https://www.anatago.com",
    },
  ],

  creator: "AnantaGo",
  publisher: "AnantaGo",

  applicationName: "AnantaGo",

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    type: "website",
    siteName: "AnantaGo",
    title: "AnantaGo — AI, Tech & Digital Life",
    description:
      "AnantaGo covers AI, technology, apps, cybersecurity, how-to guides and easy-to-understand technology explainers.",
    url: "https://www.anatago.com/",
    locale: "en_US",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AnantaGo",
    alternateName: "AnantaGo",
    url: "https://www.anatago.com/",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>

      <body className="min-h-screen bg-white text-gray-950">
        <div className="flex min-h-screen flex-col">
          <Header />

          <main className="flex-1">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}