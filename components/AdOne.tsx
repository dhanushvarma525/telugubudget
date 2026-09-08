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
  const [shouldLoad, setShouldLoad] = useState(false);

  const adRef = useRef<HTMLDivElement | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
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
    const timer = window.setTimeout(() => {
      setShouldLoad(true);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad || loadedRef.current) {
      return;
    }

    const container = adRef.current;

    if (!container) {
      return;
    }

    loadedRef.current = true;

    const key = isMobile
      ? "7895ae40aafabc66215193a80161e143"
      : "b53e3e6d7e72e1f3b43e3f65c3f21ea3";

    const width = isMobile ? 300 : 728;
    const height = isMobile ? 250 : 90;

    window.atOptions = {
      key,
      format: "iframe",
      height,
      width,
      params: {},
    };

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
        `AnantaGo ${isMobile ? "mobile" : "desktop"} ad failed`
      );

      container.style.minHeight = "0";
      container.style.height = "0";
    };

    container.appendChild(script);

    return () => {
      script.remove();
    };
  }, [shouldLoad, isMobile]);

  if (isMobile) {
    return (
      <div
        className="flex w-full justify-center overflow-hidden"
        aria-label="Advertisement"
      >
        <div
          ref={adRef}
          className="flex w-[300px] min-w-[300px] items-center justify-center overflow-hidden"
          style={{
            width: "300px",
            height: "250px",
            minHeight: "250px",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex w-full justify-center overflow-hidden"
      aria-label="Advertisement"
    >
      <div
        ref={adRef}
        className="flex w-full max-w-[728px] items-center justify-center overflow-hidden"
        style={{
          width: "728px",
          maxWidth: "100%",
          height: "90px",
          minHeight: "90px",
        }}
      />
    </div>
  );
}