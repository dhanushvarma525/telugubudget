import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Technology Articles, Guides & Insights",

  description:
    "Explore the latest AI and technology stories, practical how-to guides, useful apps, cybersecurity tips, and simple technology explainers from AnantaGo.",

  alternates: {
    canonical: "https://www.anatago.com/blog",
  },

  openGraph: {
    type: "website",
    title: "Latest Technology Articles, Guides & Insights",
    description:
      "Explore the latest AI and technology stories, practical how-to guides, useful apps, cybersecurity tips, and simple technology explainers from AnantaGo.",
    url: "https://www.anatago.com/blog",
    siteName: "AnantaGo",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}