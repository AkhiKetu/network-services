"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Lottie, {
  type LottieRefCurrentProps,
} from "lottie-react";
import networkingAnimation from "./networking.json";

function NetworkingAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const visibleRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const syncPlayback = useCallback(() => {
    const player = lottieRef.current;

    if (!player) return;

    if (reducedMotionRef.current) {
      player.goToAndStop(0, true);
      return;
    }

    if (visibleRef.current && !document.hidden) {
      player.play();
    } else {
      player.pause();
    }
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const container = containerRef.current;

    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        syncPlayback();
      },
      {
        rootMargin: "100px 0px",
        threshold: 0.05,
      }
    );

    observer.observe(container);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [syncPlayback]);

  const handleReady = useCallback(() => {
    const player = lottieRef.current;

    if (!player) return;

    player.setSubframe(false);
    player.setSpeed(0.55);
    syncPlayback();
  }, [syncPlayback]);

  function handleAnimationReady(): void {
    syncPlayback();
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      <Lottie
  lottieRef={lottieRef}
  animationData={networkingAnimation}
  autoplay={false}
  loop
  onDOMLoaded={handleAnimationReady}
  rendererSettings={{
    preserveAspectRatio: "xMidYMid meet",
  }}
  style={{
    width: "100%",
    height: "100%",
  }}
/>
    </div>
  );
}

export default memo(NetworkingAnimation);