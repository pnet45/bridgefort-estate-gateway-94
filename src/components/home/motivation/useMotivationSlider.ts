import { useEffect, useMemo, useState } from "react";
import { homepageMotivationData } from "./motivationData";
import { useContentItems } from "@/hooks/useContentItems";

export const useMotivationSlider = () => {
  const [current, setCurrent] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);
  const [fade, setFade] = useState(true);
  const { items: cmsItems, loading: contentLoading } = useContentItems({
    page: "home",
    contentType: "motivation_slide",
  });

  const cmsMotivationData = useMemo(() => cmsItems
    .filter(item => Boolean(item.image_url))
    .map(item => ({
      title: item.title,
      text: item.body || item.excerpt || "",
      author: String(item.metadata?.author || "Bridgefort Homes"),
      image: item.image_url || "",
      link: item.link_url || undefined,
      badgeLabel: String(item.metadata?.badge_label || item.category || "Monday Motivation"),
    })), [cmsItems]);

  const activeMotivationData = !contentLoading && cmsMotivationData.length
    ? cmsMotivationData
    : homepageMotivationData;

  useEffect(() => {
    setCurrent(previous => activeMotivationData.length
      ? previous % activeMotivationData.length
      : 0);
    setLoadingImages(true);
    const imagePaths = activeMotivationData.map(item => item.image).filter(Boolean);
    if (!imagePaths.length) {
      setLoadingImages(false);
      return;
    }

    let active = true;
    Promise.all(imagePaths.map(src => new Promise<void>(resolve => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.error("Failed to load motivation image:", src);
        resolve();
      };
      img.src = src;
    }))).then(() => {
      if (active) setLoadingImages(false);
    });
    return () => { active = false; };
  }, [activeMotivationData]);

  useEffect(() => {
    setFade(false);
    const to = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(to);
  }, [current]);

  useEffect(() => {
    if (activeMotivationData.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(previous => (previous + 1) % activeMotivationData.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [activeMotivationData]);

  return {
    current,
    setCurrent,
    loadingImages,
    fade,
    currentData: activeMotivationData[current] || activeMotivationData[0],
  };
};
