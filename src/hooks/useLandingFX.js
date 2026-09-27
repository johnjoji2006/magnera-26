import { useEffect } from "react";
import { initLanding } from "../lib/landing.js";

// Runs the landing page's parallax/carousel/countdown/warp logic once the DOM
// it queries (built by LandingPage's JSX) has mounted. See src/lib/landing.js.
export function useLandingFX() {
  useEffect(() => {
    const dispose = initLanding();
    return dispose;
  }, []);
}
