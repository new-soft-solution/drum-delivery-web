"use client";

import React from "react";
import styles from "./CircularProgress.module.scss";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 36,
  strokeWidth = 4,
  showLabel = true,
  className,
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

  return (
    <div
      className={`${styles.wrapper} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className={styles.svg}>
        <defs>
          <linearGradient id="progressGradient">
            <stop offset="0%" stopColor="var(--bs-primary)" />
            <stop offset="100%" stopColor="var(--bs-success)" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          className={styles.bg}
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Progress circle */}
        <circle
          className={styles.progress}
          strokeWidth={strokeWidth}
          stroke="url(#progressGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {showLabel && (
        <span className={styles.label}>{Math.round(normalizedValue)}%</span>
      )}
    </div>
  );
};

export default CircularProgress;
