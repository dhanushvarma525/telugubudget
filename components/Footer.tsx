import Link from "next/link";
import FooterAd from "@/components/FooterAd";

const footerLinks = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

const categories = [
  { name: "AI", href: "/ai" },
  { name: "Tech", href: "/tech" },
  { name: "How-To", href: "/how-to" },
  { name: "Apps", href: "/apps" },
  { name: "Security", href: "/security" },
  { name: "Explained", href: "/explained" },
];

export default function Footer() {
  return (
    <>
      {/* =====================================================
          FOOTER AD
          
          Desktop:
          728 × 90

          Mobile:
          300 × 250
      ====================================================== */}

      <FooterAd />

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">

          {/* =================================================
              MAIN FOOTER GRID
          ================================================= */}

          <div className="grid gap-12 md:grid-cols-3">

            {/* =================================================
                BRAND
            ================================================= */}

            <div>
              <Link
                href="/"
                className="inline-block"
                aria-label="AnantaGo Home"
              >
                <div className="text-2xl font-black tracking-tight text-black">
                  AnantaGo
                </div>

                <div className="mt-1 text-[9px] font-semibold tracking-[0.25em] text-gray-500">
                  AI • TECH • DIGITAL LIFE
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-600">
                Clear, useful stories about AI, technology, apps,
                security and the digital world — explained simply.
              </p>
            </div>

            {/* =================================================
                EXPLORE
            ================================================= */}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black">
                Explore
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4">
                {categories.map((category) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="text-sm text-gray-600 transition-colors duration-200 hover:text-black"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* =================================================
                COMPANY
            ================================================= */}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black">
                AnantaGo
              </h3>

              <div className="mt-5 flex flex-col gap-4">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors duration-200 hover:text-black"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* =================================================
              BOTTOM BAR
          ================================================= */}

          <div className="mt-14 border-t border-gray-200 pt-7">
            <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

              <p>
                © {new Date().getFullYear()} AnantaGo. All rights reserved.
              </p>

              <p>
                AI • Technology • Digital Life
              </p>

            </div>
          </div>

        </div>
      </footer>
    </>
  );
}