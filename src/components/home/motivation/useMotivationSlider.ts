
import { useEffect, useState } from "react";
import { motivationData } from "./motivationData";

export const useMotivationSlider = () => {
  const [current, setCurrent] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);
  const [fade, setFade] = useState(true);

  const preloadImages = (srcs: string[], onComplete: () => void) => {
    let loaded = 0;
    srcs.forEach((src) => {
      const img = new window.Image();
      img.onload = () => {
        loaded += 1;
        if (loaded === srcs.length) onComplete();
      };
      img.onerror = () => {
        console.error("Failed to load image:", src);
        loaded += 1;
        if (loaded === srcs.length) onComplete();
      };
      img.src = src;
    });
  };

  useEffect(() => {
    const imagePaths = motivationData.map((d) => d.image);
    preloadImages(imagePaths, () => setLoadingImages(false));
  }, []);

  // Fade dissolve effect on slide change
  useEffect(() => {
    setFade(false);
    const to = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(to);
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % motivationData.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return {
    current,
    setCurrent,
    loadingImages,
    fade,
    currentData: motivationData[current]
  };
};
