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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white text-zinc-950 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* =====================================================
            LOGO
        ====================================================== */}

        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex shrink-0 flex-col"
        >
          <span className="text-2xl font-black tracking-[-0.04em] text-zinc-950 transition-colors group-hover:text-zinc-700">
            AnantaGo
          </span>

          <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-500">
            AI • TECH • DIGITAL LIFE
          </span>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-10 items-center rounded-lg px-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              {item.name}
            </Link>
          ))}

          {/* SEARCH BUTTON */}

          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-800 transition-all hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
          >
            <Search
              size={18}
              strokeWidth={2.2}
            />
          </Link>
        </nav>

        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={
            open
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={open}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-950 transition-all hover:border-zinc-950 hover:bg-zinc-950 hover:text-white lg:hidden"
        >
          {open ? (
            <X
              size={22}
              strokeWidth={2.3}
            />
          ) : (
            <Menu
              size={22}
              strokeWidth={2.3}
            />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}

      {open && (
        <div className="border-t border-zinc-200 bg-white lg:hidden">
          <nav
            aria-label="Mobile navigation"
            className="mx-auto max-w-7xl px-5 py-3 sm:px-6"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="flex min-h-[52px] items-center border-b border-zinc-100 text-base font-bold text-zinc-800 transition-colors hover:text-zinc-950"
              >
                {item.name}
              </Link>
            ))}

            {/* MOBILE SEARCH */}

            <Link
              href="/search"
              onClick={closeMobileMenu}
              className="mt-2 flex min-h-[52px] items-center gap-3 rounded-xl px-2 text-base font-bold text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Search
                size={19}
                strokeWidth={2.2}
              />

              <span>Search</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}