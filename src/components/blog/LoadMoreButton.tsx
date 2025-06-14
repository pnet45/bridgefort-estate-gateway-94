
import React from "react";

interface LoadMoreButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, disabled }) => (
  <div className="mt-12 text-center">
    <button
      className="bg-white border border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white font-medium py-2 px-6 rounded-lg transition duration-300"
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      Load More Posts
    </button>
  </div>
);

export default LoadMoreButton;
