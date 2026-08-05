
import { useEffect, useState } from "react";
import { homepageMotivationData } from "./motivationData";

export const useMotivationSlider = () => {
  const [current, setCurrent] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);
  const [fade, setFade] = useState(true);

  const activeMotivationData = homepageMotivationData;

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
    const imagePaths = activeMotivationData.map((d) => d.image);
    if (imagePaths.length === 0) {
      setLoadingImages(false);
      return;
    }
    preloadImages(imagePaths, () => setLoadingImages(false));
  }, [activeMotivationData]);

  useEffect(() => {
    setFade(false);
    const to = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(to);
  }, [current]);

  useEffect(() => {
    if (activeMotivationData.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeMotivationData.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [activeMotivationData]);

  return {
    current,
    setCurrent,
    loadingImages,
    fade,
    currentData: activeMotivationData[current] || activeMotivationData[0]
  };
};
