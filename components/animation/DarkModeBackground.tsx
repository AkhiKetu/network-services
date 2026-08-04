"use client";

import { memo } from "react";

function DarkModeLandingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black"
    >
      {/*
        Static background for maximum performance.
        No Lottie, canvas, SVG animation, filter invert, or full-screen blur.
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.10),transparent_34%),radial-gradient(circle_at_12%_62%,rgba(6,182,212,0.08),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(99,102,241,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_12%_62%,rgba(6,182,212,0.10),transparent_31%),radial-gradient(circle_at_88%_72%,rgba(99,102,241,0.12),transparent_31%)]" />

      <div className="absolute inset-0 bg-white/45 dark:bg-black/35" />
    </div>
  );
}

export default memo(DarkModeLandingBackground);