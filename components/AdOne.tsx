
"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

export default function AdOne() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const desktopAdRef = useRef<HTMLDivElement | null>(null);
  const mobileAdRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const container = isMobile
      ? mobileAdRef.current
      : desktopAdRef.current;

    if (!container) return;

    // Prevent loading the ad multiple times
    if (container.dataset.loaded === "true") {
      return;
    }

    container.dataset.loaded = "true";

    const key = isMobile
      ? "7895ae40aafabc66215193a80161e143"
      : "b53e3e6d7e72e1f3b43e3f65c3f21ea3";

    const width = isMobile ? 300 : 728;
    const height = isMobile ? 250 : 90;

    /*
     * Ad network configuration
     */
    window.atOptions = {
      key,
      format: "iframe",
      height,
      width,
      params: {},
    };

    /*
     * Create the ad script
     */
    const script = document.createElement("script");

    script.src = `https://www.highrevenueformat.com/${key}/invoke.js`;

    script.async = true;

    script.onload = () => {
      console.log(
        `AnantaGo ${isMobile ? "mobile" : "desktop"} ad loaded`
      );
    };

    script.onerror = () => {
      console.error(
        `AnantaGo ${isMobile ? "mobile" : "desktop"} ad failed to load`
      );

      /*
       * Remove empty ad space if the network fails.
       */
      container.style.minHeight = "0";
      container.style.height = "0";
    };

    container.appendChild(script);

    return () => {
      script.remove();
    };
  }, [mounted, isMobile]);

  /*
   * Don't render anything during SSR.
   */
  if (!mounted) {
    return null;
  }

  /*
   * MOBILE
   * 300 x 250
   */
  if (isMobile) {
    return (
      <div
        className="flex w-full justify-center overflow-hidden"
        aria-label="Advertisement"
      >
        <div
          ref={mobileAdRef}
          id="anantago-ad-mobile"
          className="flex w-[300px] items-center justify-center overflow-hidden"
          style={{
            width: "300px",
            minWidth: "300px",
            minHeight: "250px",
            height: "250px",
          }}
        />
      </div>
    );
  }

  /*
   * DESKTOP
   * 728 x 90
   */
  return (
    <div
      className="flex w-full justify-center overflow-hidden"
      aria-label="Advertisement"
    >
      <div
        ref={desktopAdRef}
        id="anantago-ad-desktop"
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: "728px",
          maxWidth: "100%",
          minHeight: "90px",
          height: "90px",
        }}
      />
    </div>
  );
}

