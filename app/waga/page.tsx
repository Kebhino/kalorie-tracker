"use client";
import dynamic from "next/dynamic";

// Update the import path below if your WagaTracker component is located elsewhere
const WagaTracker = dynamic(() => import("../components/WagaTracker"), {
  ssr: false,
});

export default function StronaWagi() {
  return <WagaTracker />;
}
