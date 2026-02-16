
import React from "react";

const MotivationBadge = ({ label = "Monday Motivation" }: { label?: string }) => (
  <div className="absolute top-3 right-3 text-white px-4 py-1 rounded-full shadow font-semibold text-sm animate-scale-in bg-cyan-500 z-10">
    {label}
  </div>
);

export default MotivationBadge;
