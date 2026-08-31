"use client";

import { useEffect, useRef } from "react";

type AdPosition = "top" | "footer";

type AdBannerProps = {
  position?: AdPosition;
};

const AD_CONFIG = {
  top: {
    width: 728,
    height: 90,
    key: "b53e3e6d7e72e1f3b43e3f65c3f21ea3",
  },

  footer: {
    width: 728,
    height: 90,
    key: "b53e3e6d7e72e1f3b43e3f65c3f21ea3",
  },
} as const;

export default function AdBanner({
  position = "top",
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const config = AD_CONFIG[position];

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (container.dataset.loaded === "true") {
      return;
    }

    container.dataset.loaded = "true";

    /*
     * Adsterra options
     */
    const optionsScript = document.createElement("script");

    optionsScript.type = "text/javascript";

    optionsScript.text = `
      var atOptions = {
        'key': '${config.key}',
        'format': 'iframe',
        'height': ${config.height},
        'width': ${config.width},
        'params': {}
      };
    `;

    /*
     * Adsterra invoke script
     */
    const adScript = document.createElement("script");

    adScript.type = "text/javascript";
    adScript.src =
      `https://www.highrevenueformat.com/${config.key}/invoke.js`;

    adScript.async = false;

    container.appendChild(optionsScript);
    container.appendChild(adScript);

    return () => {
      container.innerHTML = "";
      delete container.dataset.loaded;
    };
  }, []);

  return (
    <section
      className={`ad-wrapper ad-${position}`}
      aria-label="Advertisement"
    >
      <div className="ad-label">
        Advertisement
      </div>

      <div className="ad-viewport">
        <div
          ref={containerRef}
          className="ad-slot"
        />
      </div>

      <style jsx>{`
        .ad-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 32px auto;
          overflow: hidden;
        }

        .ad-label {
          margin-bottom: 8px;
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #a1a1aa;
        }

        .ad-viewport {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .ad-slot {
          width: 728px;
          height: 90px;
          min-width: 728px;
          min-height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .ad-slot iframe {
          display: block;
          border: 0;
        }

        /*
         * MOBILE
         *
         * The actual Adsterra unit remains 728x90.
         * We only scale it visually so it fits the
         * phone screen.
         */
        @media (max-width: 767px) {
          .ad-wrapper {
            margin: 24px auto;
            padding: 0 10px;
          }

          .ad-viewport {
            height: 90px;
          }

          .ad-slot {
            transform: scale(
              min(
                1,
                calc((100vw - 20px) / 728)
              )
            );

            transform-origin: center center;
          }
        }

        /*
         * VERY SMALL PHONES
         */
        @media (max-width: 380px) {
          .ad-wrapper {
            padding: 0 5px;
          }

          .ad-slot {
            transform: scale(
              min(
                1,
                calc((100vw - 10px) / 728)
              )
            );
          }
        }
      `}</style>
    </section>
  );
}