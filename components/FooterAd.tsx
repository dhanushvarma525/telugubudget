
"use client";

import { useEffect, useRef } from "react";

const MOBILE_KEY =
  "7895ae40aafabc66215193a80161e143";

const DESKTOP_KEY =
  "b53e3e6d7e72e1f3b43e3f65c3f21ea3";

export default function FooterAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = adRef.current;

    if (!container) {
      return;
    }

    /*
     * Prevent duplicate loading
     */
    if (container.dataset.loaded === "true") {
      return;
    }

    container.dataset.loaded = "true";

    /*
     * Detect screen size
     */
    const isMobile = window.innerWidth < 768;

    const key = isMobile
      ? MOBILE_KEY
      : DESKTOP_KEY;

    const width = isMobile
      ? 300
      : 728;

    const height = isMobile
      ? 250
      : 90;

    /*
     * Create Adsterra options
     *
     * IMPORTANT:
     * atOptions must be created BEFORE
     * invoke.js is loaded.
     */
    const optionsScript =
      document.createElement("script");

    optionsScript.type = "text/javascript";

    optionsScript.text = `
      var atOptions = {
        'key': '${key}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    `;

    /*
     * Create invoke script
     */
    const invokeScript =
      document.createElement("script");

    invokeScript.type = "text/javascript";

    invokeScript.src =
      `https://www.highrevenueformat.com/${key}/invoke.js`;

    /*
     * Do NOT make this async.
     *
     * The options script must execute first.
     */
    invokeScript.async = false;

    /*
     * Add options first
     */
    container.appendChild(optionsScript);

    /*
     * Add invoke second
     */
    container.appendChild(invokeScript);

    /*
     * Cleanup
     */
    return () => {
      if (container) {
        container.innerHTML = "";
        delete container.dataset.loaded;
      }
    };
  }, []);

  return (
    <section
      aria-label="Advertisement"
      className="w-full border-t border-zinc-200 bg-white"
    >
      <div
        className="
          mx-auto
          flex
          w-full
          justify-center
          overflow-hidden
          px-3
          py-8
          sm:px-6
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

