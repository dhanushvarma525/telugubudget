"use client";

import { useEffect, useRef } from "react";

export default function FooterAd() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let desktopScript: HTMLScriptElement | null = null;
    let mobileScript: HTMLScriptElement | null = null;

    /*
     * Load desktop ad only on desktop
     */
    const loadDesktopAd = () => {
      if (!desktopRef.current) return;

      // Prevent duplicate loading
      if (desktopRef.current.dataset.loaded === "true") {
        return;
      }

      desktopRef.current.dataset.loaded = "true";

      const win = window as typeof window & {
        atOptions?: {
          key: string;
          format: string;
          height: number;
          width: number;
          params: Record<string, unknown>;
        };
      };

      win.atOptions = {
        key: "b53e3e6d7e72e1f3b43e3f65c3f21ea3",
        format: "iframe",
        height: 90,
        width: 728,
        params: {},
      };

      desktopScript = document.createElement("script");
      desktopScript.src =
        "https://www.highrevenueformat.com/b53e3e6d7e72e1f3b43e3f65c3f21ea3/invoke.js";
      desktopScript.async = true;

      desktopRef.current.appendChild(desktopScript);
    };

    /*
     * Load mobile ad only on mobile
     */
    const loadMobileAd = () => {
      if (!mobileRef.current) return;

      // Prevent duplicate loading
      if (mobileRef.current.dataset.loaded === "true") {
        return;
      }

      mobileRef.current.dataset.loaded = "true";

      const win = window as typeof window & {
        atOptions?: {
          key: string;
          format: string;
          height: number;
          width: number;
          params: Record<string, unknown>;
        };
      };

      win.atOptions = {
        key: "7895ae40aafabc66215193a80161e143",
        format: "iframe",
        height: 250,
        width: 300,
        params: {},
      };

      mobileScript = document.createElement("script");
      mobileScript.src =
        "https://www.highrevenueformat.com/7895ae40aafabc66215193a80161e143/invoke.js";
      mobileScript.async = true;

      mobileRef.current.appendChild(mobileScript);
    };

    /*
     * Use the actual screen size.
     *
     * Desktop: 768px and above
     * Mobile: below 768px
     */
    const loadCorrectAd = () => {
      if (window.innerWidth >= 768) {
        loadDesktopAd();
      } else {
        loadMobileAd();
      }
    };

    loadCorrectAd();

    return () => {
      if (desktopScript) {
        desktopScript.remove();
      }

      if (mobileScript) {
        mobileScript.remove();
      }
    };
  }, []);

  return (
    <section
      aria-label="Advertisement"
      className="w-full border-t border-zinc-200 bg-white"
    >
      <div className="mx-auto flex w-full justify-center px-3 py-8 sm:px-6 lg:px-8">
        {/* =========================================
            DESKTOP
            728 × 90
        ========================================== */}
        <div
          ref={desktopRef}
          className="hidden h-[90px] w-[728px] items-center justify-center overflow-hidden md:flex"
        />

        {/* =========================================
            MOBILE
            300 × 250
        ========================================== */}
        <div
          ref={mobileRef}
          className="flex h-[250px] w-[300px] items-center justify-center overflow-hidden md:hidden"
        />
      </div>
    </section>
  );
}