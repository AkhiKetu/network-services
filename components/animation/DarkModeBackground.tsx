"use client";

import dynamic from "next/dynamic";
import earthAnimation from "./Global.json";

const Lottie = dynamic(
  () => import("lottie-react").then((module) => module.default),
  { ssr: false }
);

export default function DarkModeLandingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black"
    >
      {/*
        BACKGROUND ANIMATION:
        Light mode uses invert so the white animation becomes dark.
        Change opacity-20 and dark:opacity-40 to control visibility.
      */}
      <div className="absolute inset-0 opacity-20 invert dark:opacity-40 dark:invert-0">
        <Lottie
          animationData={earthAnimation}
          autoplay
          loop
          rendererSettings={{
            preserveAspectRatio: "xMidYMid slice",
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/*
        BACKGROUND OVERLAY:
        Lower these values to make the animation clearer.
        Increase them to make the background softer.
      */}
      <div className="absolute inset-0 bg-white/55 dark:bg-black/55" />
    </div>
  );
}