"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">

      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-orange-500"
        >
          TeluguBudget
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 font-semibold">

          <Link href="/" className="hover:text-orange-500">
            Home
          </Link>

          <Link
            href="/categories/todays-deals"
            className="hover:text-orange-500"
          >
            Today's Deals
          </Link>

          <Link
            href="/categories"
            className="hover:text-orange-500"
          >
            Categories
          </Link>

          <Link
            href="/contact"
            className="hover:text-orange-500"
          >
            Contact
          </Link>

        </div>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 max-w-md mx-8"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-l-full px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button
            type="submit"
            className="bg-orange-500 text-white px-5 rounded-r-full hover:bg-orange-600"
          >
            🔍
          </button>
        </form>

        {/* Desktop Contact Button */}
        <Link
          href="/contact"
          className="hidden lg:block bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600"
        >
          Contact
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (

        <div className="lg:hidden border-t bg-white">

          {/* Mobile Search */}
          <form
            onSubmit={handleSearch}
            className="p-4"
          >
            <div className="flex">

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border rounded-l-lg px-4 py-3"
              />

              <button
                type="submit"
                className="bg-orange-500 text-white px-5 rounded-r-lg"
              >
                🔍
              </button>

            </div>
          </form>

          {/* Mobile Links */}
          <div className="flex flex-col">

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 border-b hover:bg-gray-100"
            >
              🏠 Home
            </Link>

            <Link
              href="/categories"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 border-b hover:bg-gray-100"
            >
              📂 Categories
            </Link>


<Link
  href="/favorites"
  onClick={() => setMenuOpen(false)}
  className="px-5 py-4 border-b hover:bg-gray-100"
>
  ❤️ Favorites
</Link>

  <Link
              href="/categories/todays-deals"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 border-b hover:bg-gray-100"
            >
              🔥 Today's Deals
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-4 hover:bg-gray-100"
            >
              📞 Contact
            </Link>

          </div>

        </div>

      )}

    </nav>
  );
}