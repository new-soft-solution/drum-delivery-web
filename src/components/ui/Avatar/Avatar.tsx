"use client";
import React from "react";

const PALETTE = [
  { bg: "#e7f5f0", fg: "#0f7a63" }, // teal
  { bg: "#eaf0ff", fg: "#3355c9" }, // blue
  { bg: "#fdeef7", fg: "#b6297f" }, // pink
  { bg: "#fff4e5", fg: "#b46a12" }, // amber
  { bg: "#eee9fd", fg: "#6b3fd4" }, // violet
  { bg: "#e8f7ea", fg: "#1e8e3e" }, // green
];

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
  imageSrc?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 36, className, imageSrc }) => {
  const palette = PALETTE[hashString(name || "?") % PALETTE.length];

  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatars are
      // remote, user-controlled URLs; next/image would need a wildcard
      // remotePatterns entry we can't guess ahead of a real backend domain.
      <img
        src={imageSrc}
        alt={name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: palette.bg,
        color: palette.fg,
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {initialsOf(name)}
    </span>
  );
};

export default Avatar;
