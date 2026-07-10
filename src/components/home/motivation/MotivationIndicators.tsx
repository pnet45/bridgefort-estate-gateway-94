
import React from "react";
import { motivationData } from "./motivationData";

interface MotivationIndicatorsProps {
  current: number;
  onSlideChange: (index: number) => void;
}

const MotivationIndicators = ({ current, onSlideChange }: MotivationIndicatorsProps) => (
  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
    {motivationData.map((_, idx) => (
      <button
        key={idx}
        onClick={() => onSlideChange(idx)}
        className={`mx-1 h-2 w-8 rounded-full ${
          current === idx ? "bg-estate-blue" : "bg-white/60"
        } transition-colors`}
        aria-label={`Go to slide ${idx + 1}`}
      />
    ))}
  </div>
);

export default MotivationIndicators;
