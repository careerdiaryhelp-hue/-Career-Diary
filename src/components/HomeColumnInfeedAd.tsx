"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import DirectAdSense from "./DirectAdSense";

interface HomeColumnInfeedAdProps {
  adId: string;
  adSlot?: string;
  fallbackAdSlot?: string;
  priority?: boolean;
}

type WidthBucket = "pending" | "too-narrow" | "fluid" | "300" | "wide";

const HomeColumnInfeedAd: React.FC<HomeColumnInfeedAdProps> = ({
  adId,
  adSlot = "1202522135",
  fallbackAdSlot = "7208581106",
  priority = false,
}) => {
  const activeSlot = adSlot || fallbackAdSlot || "1202522135";
  const liRef = useRef<HTMLLIElement>(null);
  const [widthBucket, setWidthBucket] = useState<WidthBucket>("pending");
  const [inView, setInView] = useState<boolean>(
    () => priority || typeof IntersectionObserver === "undefined"
  );
  const [isFilled, setIsFilled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Measure column width so we never request clipped ads inside narrow mobile 3-col cards (< 240px)
  useEffect(() => {
    const el = liRef.current;
    if (!el || typeof window === "undefined") return;

    const measure = () => {
      const target = liRef.current;
      if (!target) return;
      const w = Math.floor(target.getBoundingClientRect().width || target.offsetWidth || 0);
      if (w <= 0) return;

      const next: WidthBucket =
        w < 240 ? "too-narrow" : w >= 380 ? "wide" : w >= 296 ? "300" : "fluid";

      setWidthBucket((prev) => (prev === next ? prev : next));
    };

    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }

    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  const canActivateByWidth =
    widthBucket === "fluid" || widthBucket === "300" || widthBucket === "wide";

  // Lazy-activate below-the-fold cards as they approach the viewport
  useEffect(() => {
    if (priority || inView || !canActivateByWidth || isDismissed) return;
    const el = liRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "350px" }
    );
    io.observe(el);

    return () => io.disconnect();
  }, [priority, inView, canActivateByWidth, isDismissed]);

  const verifyVisibleFill = useCallback((): boolean => {
    const el = liRef.current;
    if (!el || typeof window === "undefined") return false;

    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.endsWith(".local")
    ) {
      const devBox = el.querySelector(".adsense-container") as HTMLElement | null;
      if (devBox && devBox.offsetHeight >= 30) {
        setIsFilled(true);
        return true;
      }
    }

    const ins = el.querySelector("ins.adsbygoogle") as HTMLElement | null;
    if (ins) {
      const status = ins.getAttribute("data-ad-status");
      const iframe = ins.querySelector("iframe") as HTMLIFrameElement | null;
      const insRect = ins.getBoundingClientRect();
      if (status === "filled" && iframe && insRect.height >= 50) {
        const style = window.getComputedStyle(iframe);
        const rect = iframe.getBoundingClientRect();
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.height >= 50 &&
          rect.width >= 150
        ) {
          setIsFilled(true);
          return true;
        }
      }
    }

    setIsFilled(false);
    return false;
  }, []);

  const shouldMountAd = canActivateByWidth && inView && !isDismissed;

  useEffect(() => {
    if (!shouldMountAd) return;
    const el = liRef.current;
    if (!el) return;

    const initCheck = setTimeout(() => {
      verifyVisibleFill();
    }, 200);

    const observer = new MutationObserver(() => {
      verifyVisibleFill();
    });
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-ad-status", "style", "class"],
      childList: true,
      subtree: true,
    });

    const poll = setInterval(() => {
      verifyVisibleFill();
    }, 400);

    // Collapse completely if AdSense does not deliver a real visible creative within 4.5s
    const watchdog = setTimeout(() => {
      if (!verifyVisibleFill()) {
        setIsDismissed(true);
        setIsFilled(false);
      }
    }, 4500);

    return () => {
      clearTimeout(initCheck);
      observer.disconnect();
      clearInterval(poll);
      clearTimeout(watchdog);
    };
  }, [shouldMountAd, verifyVisibleFill]);

  if (isDismissed || widthBucket === "too-narrow") {
    return null;
  }

  return (
    <li
      ref={liRef}
      className={
        isFilled
          ? "home-col-infeed-ad is-filled list-none flex flex-col items-center justify-center"
          : "home-col-infeed-ad list-none flex flex-col items-center justify-center"
      }
      style={
        isFilled
          ? undefined
          : { margin: 0, padding: 0, border: 0, minHeight: 0 }
      }
    >
      {shouldMountAd && (
        <DirectAdSense
          adId={adId}
          adSlot={activeSlot}
          width={widthBucket === "300" ? "300px" : "100%"}
          minWidth="0px"
          minHeight="0px"
          adFormat="rectangle"
          fullWidthResponsive={false}
          priority={priority}
          showLabel={true}
          compact={true}
          className="!my-0"
          onAdStatusChange={(status: string) => {
            if (status === "unfilled") {
              setIsDismissed(true);
              setIsFilled(false);
            } else if (status === "filled") {
              verifyVisibleFill();
              setTimeout(verifyVisibleFill, 250);
            }
          }}
        />
      )}
    </li>
  );
};

export default React.memo(HomeColumnInfeedAd);
