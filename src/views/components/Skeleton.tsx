import React from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  lines?: number; // when set, renders stacked text lines
  className?: string;
  ariaLabel?: string;
  variant?: "default" | "nk";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "0.9rem",
  lines,
  className = "",
  ariaLabel,
  variant = "default",
}) => {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2" aria-label={ariaLabel}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton ${
              variant === "nk" ? "skeleton-nk" : ""
            } skeleton-text ${className}`}
            style={{ width, height }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`skeleton ${variant === "nk" ? "skeleton-nk" : ""} ${
        height === "10rem" ? "skeleton-image" : "skeleton-text"
      } ${className}`}
      style={{ width, height }}
      aria-label={ariaLabel}
    />
  );
};
