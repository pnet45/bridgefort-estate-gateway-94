import React from 'react';

interface BrandIconProps {
  size?: number;
  className?: string;
}

/**
 * lucide-react (the icon set used throughout this app) doesn't include an "X"
 * mark for the rebranded Twitter, or a TikTok mark at all. These two are drawn
 * from scratch in the same minimal stroke style as the rest of the icon set
 * (24x24 viewBox, currentColor, 2px rounded strokes) rather than reproducing
 * either platform's official logo artwork, so they drop in as a like-for-like
 * replacement for <Facebook />, <Instagram />, etc.
 */

export const XIcon: React.FC<BrandIconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

export const TikTokIcon: React.FC<BrandIconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 18a4 4 0 1 0 4-4V3" />
    <path d="M13 6c0 2.5 2 4 4.5 4" />
  </svg>
);
