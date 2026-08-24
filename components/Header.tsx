"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "AI", href: "/ai" },
  { name: "Tech", href: "/tech" },
  { name: "How-To", href: "/how-to" },
  { name: "Apps", href: "/apps" },
  { name: "Security", href: "/security" },
  { name: "Explained", href: "/explained" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  function closeMobileMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex flex-col"
        >
          <span className="text-2xl font-black tracking-tight text-black">
            AnantaGo
          </span>

          <span className="text-[9px] font-semibold tracking-[0.25em] text-gray-500">
            AI • TECH • DIGITAL LIFE
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-black"
            >
              {item.name}
            </Link>
          ))}

          <Link
            href="/search"
            aria-label="Search"
            className="rounded-full border border-gray-200 p-2.5 text-gray-700 transition hover:border-black hover:text-black"
          >
            <Search size={18} />
          </Link>
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={
            open ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={open}
          className="rounded-lg border border-gray-200 p-2 text-gray-800 transition hover:border-black lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {open && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-7xl flex-col px-5 py-3"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="border-b border-gray-100 py-4 text-base font-semibold text-gray-800 transition-colors hover:text-black"
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/search"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 py-4 font-semibold text-gray-800 transition-colors hover:text-black"
            >
              <Search size={18} />
              Search
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}