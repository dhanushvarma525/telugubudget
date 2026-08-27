import type { Metadata } from "next";

const title = "Latest Technology Articles, Guides & Insights";

const description =
  "Explore the latest AI and technology stories, practical how-to guides, useful apps, cybersecurity tips, and simple technology explainers from AnantaGo.";

export const metadata: Metadata = {
  title,
  description,

  alternates: {
    canonical: "https://www.anatago.com/blog",
  },

  openGraph: {
    type: "website",
    title,
    description,
    url: "https://www.anatago.com/blog",
    siteName: "AnantaGo",
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}