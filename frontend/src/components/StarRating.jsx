import React, { useState } from "react";

// Display-only star rating
export const StarDisplay = ({ rating, size = "sm" }) => {
  const starSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  const filled = Math.round(rating || 0);

  return (
    <span className={`inline-flex gap-0.5 ${starSize}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= filled ? "text-amber-400" : "text-slate-200 dark:text-white/10"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
};

// Interactive picker
const StarRating = ({ value, onChange, disabled = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          className={`text-3xl transition-colors leading-none ${
            disabled
              ? "cursor-default"
              : "cursor-pointer hover:scale-110 transition-transform"
          } ${
            star <= (hovered || value)
              ? "text-amber-400"
              : "text-slate-200 dark:text-white/10"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
