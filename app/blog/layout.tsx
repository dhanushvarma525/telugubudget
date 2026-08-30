import type { Metadata } from "next";

const title = "AnantaGo — AI, Tech & Digital Life";

const description =
  "AnantaGo covers AI, technology, apps, cybersecurity, how-to guides and easy-to-understand technology explainers.";

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