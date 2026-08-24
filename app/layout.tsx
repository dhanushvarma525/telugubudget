import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.anantago.com"),

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

  authors: [{ name: "AnantaGo" }],
  creator: "AnantaGo",
  publisher: "AnantaGo",

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
      "AI, technology, apps, cybersecurity, how-to guides and technology explainers.",
    url: "https://www.anantago.com",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}