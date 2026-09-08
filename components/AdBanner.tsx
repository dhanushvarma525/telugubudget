
"use client";

import { useEffect, useRef } from "react";

type AdPosition = "top" | "footer";

type AdBannerProps = {
  position?: AdPosition;
};

export default function AdBanner({
  position = "top",
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = adRef.current;

    if (!container) {
      return;
    }

    // Prevent duplicate loading
    if (container.dataset.loaded === "true") {
      return;
    }

    container.dataset.loaded = "true";

    const isMobile = window.innerWidth < 768;

    /*
     * =====================================================
     * MOBILE
     * 300 × 250
     * =====================================================
     */

    if (isMobile) {
      const optionsScript =
        document.createElement("script");

      optionsScript.type = "text/javascript";

      optionsScript.text = `
        atOptions = {
          'key' : '7895ae40aafabc66215193a80161e143',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;

      const invokeScript =
        document.createElement("script");

      invokeScript.type = "text/javascript";
      invokeScript.src =
        "https://www.highrevenueformat.com/7895ae40aafabc66215193a80161e143/invoke.js";
      invokeScript.async = true;

      container.appendChild(optionsScript);
      container.appendChild(invokeScript);

      return;
    }

    /*
     * =====================================================
     * DESKTOP
     * 728 × 90
     * =====================================================
     */

    const optionsScript =
      document.createElement("script");

    optionsScript.type = "text/javascript";

    optionsScript.text = `
      atOptions = {
        'key' : 'b53e3e6d7e72e1f3b43e3f65c3f21ea3',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const invokeScript =
      document.createElement("script");

    invokeScript.type = "text/javascript";
    invokeScript.src =
      "https://www.highrevenueformat.com/b53e3e6d7e72e1f3b43e3f65c3f21ea3/invoke.js";
    invokeScript.async = true;

    container.appendChild(optionsScript);
    container.appendChild(invokeScript);

    return () => {
      if (container) {
        container.innerHTML = "";
        delete container.dataset.loaded;
      }
    };
  }, []);

  /*
   * =====================================================
   * TOP HOMEPAGE AD
   * =====================================================
   */

  if (position === "top") {
    return (
      <section
        aria-label="Advertisement"
        className="
          w-full
          border-y
          border-zinc-100
          bg-white
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            items-center
            justify-center
            overflow-hidden
            px-3
            py-6
            sm:px-6
            sm:py-8
            lg:px-8
          "
        >
          <div
            ref={adRef}
            className="
              flex
              h-[250px]
              w-[300px]
              items-center
              justify-center
              overflow-hidden

              md:h-[90px]
              md:w-[728px]
            "
          />
        </div>
      </section>
    );
  }

  /*
   * =====================================================
   * FOOTER POSITION
   *
   * Kept for compatibility.
   * Your actual footer currently uses FooterAd.tsx.
   * =====================================================
   */

  return (
    <section
      aria-label="Advertisement"
      className="w-full bg-white"
    >
      <div className="mx-auto flex w-full justify-center px-3 py-6">
        <div
          ref={adRef}
          className="
            flex
            h-[250px]
            w-[300px]
            items-center
            justify-center
            overflow-hidden

            md:h-[90px]
            md:w-[728px]
          "
        />
      </div>
    </section>
  );
}

