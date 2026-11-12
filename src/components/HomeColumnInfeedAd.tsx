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
      if (status !== "unfilled" && iframe) {
        const style = window.getComputedStyle(iframe);
        const rect = iframe.getBoundingClientRect();
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.height >= 35 &&
          rect.width >= 150
        ) {
          setIsFilled(true);
          return true;
        }
      }
    }

    return false;
  }, []);

  const shouldMountAd = canActivateByWidth && inView && !isDismissed;

  useEffect(() => {
    if (!shouldMountAd) return;
    const el = liRef.current;
    if (!el) return;

    const initCheck = setTimeout(() => {
      verifyVisibleFill();
    }, 100);

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
    }, 500);

    // Collapse cleanly only if AdSense neither fills nor responds within 16s
    const watchdog = setTimeout(() => {
      if (!verifyVisibleFill()) {
        setIsDismissed(true);
        setIsFilled(false);
      }
    }, 16000);

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

  const isExact300Box = widthBucket === "300";

  return (
    <li
      ref={liRef}
      className={
        isFilled
          ? "home-col-infeed-ad is-filled my-1.5 py-2 px-0 list-none flex flex-col items-center justify-center border-y border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 rounded-md"
          : "home-col-infeed-ad my-1 py-1 px-0 border-0 list-none flex flex-col items-center justify-center"
      }
      style={shouldMountAd ? { minHeight: "250px" } : { minHeight: "1px" }}
    >
      {shouldMountAd && (
        <DirectAdSense
          adId={adId}
          adSlot={activeSlot}
          width={isExact300Box ? "300px" : "100%"}
          height={isExact300Box ? "250px" : undefined}
          minWidth={isExact300Box ? "300px" : "240px"}
          minHeight="250px"
          adFormat="auto"
          fullWidthResponsive={widthBucket === "wide"}
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
              setTimeout(verifyVisibleFill, 300);
            }
          }}
        />
      )}
    </li>
  );
};

export default React.memo(HomeColumnInfeedAd);
