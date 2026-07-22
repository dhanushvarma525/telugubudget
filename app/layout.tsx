import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "TeluguBudget - Best Budget Deals & Buying Guides",
    template: "%s | TeluguBudget",
  },


  description:
    "TeluguBudget helps you discover best budget products, Amazon deals, Flipkart offers, buying guides and useful recommendations in Telugu.",


  keywords: [
    "TeluguBudget",
    "budget products",
    "Amazon deals",
    "Flipkart deals",
    "best gadgets",
    "buying guides",
    "Telugu tech",
  ],


  authors:[
    {
      name:"TeluguBudget"
    }
  ],


  creator:"TeluguBudget",


  openGraph:{

    title:
    "TeluguBudget - Best Budget Deals & Buying Guides",


    description:
    "Discover affordable products, deals and buying guides curated for Telugu users.",


    type:"website",

    siteName:"TeluguBudget"

  },


  robots:{

    index:true,

    follow:true

  }

};







export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {


const siteUrl =
process.env.NEXT_PUBLIC_SITE_URL ||
"http://localhost:3000";



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



{/* Navbar */}

<Navbar />






{/* Google Organization Schema */}


<script

type="application/ld+json"

dangerouslySetInnerHTML={{

__html:JSON.stringify({

"@context":"https://schema.org",

"@type":"Organization",

"name":"TeluguBudget",

"url":siteUrl,


"description":
"TeluguBudget provides budget product recommendations, deals and buying guides."

})

}}

/>







{/* Website Schema */}


<script

type="application/ld+json"

dangerouslySetInnerHTML={{

__html:JSON.stringify({

"@context":"https://schema.org",

"@type":"WebSite",

"name":"TeluguBudget",

"url":siteUrl,


"potentialAction":{

"@type":"SearchAction",

"target":
`${siteUrl}/search?q={search_term_string}`,


"query-input":
"required name=search_term_string"

}

})

}}

/>







{children}






{/* Mobile Bottom Navigation */}

<BottomNavigation />




</body>


</html>


);

}