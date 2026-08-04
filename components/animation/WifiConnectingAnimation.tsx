"use client"

import Lottie from "lottie-react"
import wifiConnectingAnimation from "./wifi-connecting.json"

export default function WifiConnectingAnimation() {
  return (
    <div
      role="img"
      aria-label="Animated Wi-Fi connection signal"
      className="h-full w-full"
    >
      <Lottie
        animationData={wifiConnectingAnimation}
        autoplay
        loop
        className="h-full w-full"
      />
    </div>
  )
}