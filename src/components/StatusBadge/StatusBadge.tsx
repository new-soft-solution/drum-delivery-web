"use client";

import React from "react";
import clsx from "clsx";
import styles from "./StatusBadge.module.scss";

export type Tone =
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "black"
  | "secondary";

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Raw status text like: "paid", "unpaid", "pending", "failed" ... */
  status: string;
  /** Override the shown label (otherwise derived from `status`) */
  label?: string;
  /** Rounded pill look (uses Bootstrap's .rounded-pill) */
  pill?: boolean;
  /** Softer "subtle" style (tinted bg, colored text & border) */
  soft?: boolean;
  /** Badge size */
  size?: "sm" | "md" | "lg";
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Custom background color (overrides tone) */
  bgColor?: string;
  /** Custom text color (overrides tone) */
  color?: string;
  /** Explicit tone override. If provided, this wins over status mapping. */
  tone?: Tone;
}

const STATUS_TO_TONE: Record<string, Tone> = {
  success: "green",
  ok: "green",
  paid: "green",
  completed: "green",
  accepted: "green",
  complete: "green",
  active: "green",
  delivered: "green",
  approved: "green",
  yes: "green",
  confirmed: "green",
  earned: "green",
  available: "green",
  sent: "green",
  // Restaurant publish lifecycle
  // `approved` (above) stays green = "ready to go live"; `published` /
  // `live` get teal so the live-to-customers state reads distinctly from
  // the merely-approved one, while still feeling positive and on-brand.
  published: "teal",
  live: "teal",

  // Onboarding pipeline progression
  registered: "secondary",
  agreement_sent: "indigo",
  agreement_signed: "cyan",
  profile_drafting: "indigo",
  awaiting_owner_review: "orange",
  pending_approval: "yellow",
  rejected: "red",

  unpaid: "red",
  draft: "secondary",
  open: "secondary",
  unknown: "black",
  inactive: "secondary",
  none: "secondary",
  occupied: "secondary",

  pending: "yellow",
  pending_confirmation: "yellow",
  awaiting_payment: "yellow",
  queued: "yellow",
  scheduled: "indigo",
  processing: "indigo",
  in_progress: "indigo",

  on_hold: "orange",
  hold: "orange",
  warning: "orange",

  failed: "red",
  error: "red",
  cancelled: "red",
  canceled: "red",
  declined: "red",
  not_accepted: "red",
  expired: "red",
  chargeback: "red",
  suspended: "red",
  no: "red",
  redeemed: "red",
  reserved: "red",

  refunded: "teal",
  partial_refund: "teal",

  info: "cyan",
  shipped: "blue",
  dispatched: "blue",
  voucher: "blue",

  no_payment_required: "cyan",
};

function prettifyLabel(s: string) {
  const st = String(s ?? "");
  return st
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function getToneFromStatus(status: string): Tone {
  const key = (String(status) || "").toLowerCase().trim();
  return STATUS_TO_TONE[key] ?? "secondary";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pill,
  soft,
  size = "sm",
  icon,
  bgColor,
  color,
  tone,
  className,
  style,
  ...rest
}) => {
  const effectiveTone: Tone = tone ?? getToneFromStatus(status);
  const text = label ?? prettifyLabel(status || "—");

  const customStyles: React.CSSProperties = {
    ...style,
    ...(bgColor && {
      ["--custom-badge-bg"]: bgColor,
      ["--custom-badge-border"]: soft ? bgColor : undefined,
    }),
    ...(color && {
      ["--custom-badge-color"]: color,
    }),
  };

  return (
    <span
      className={clsx(
        "badge", // keep Bootstrap base if you want its border-radius and baseline styles
        pill && "rounded-pill",
        styles.badgeRoot,
        styles[`tone-${effectiveTone}`],
        soft && styles.soft,
        // size classes — now explicit and high-specificity in SCSS
        size === "sm" && styles.sm,
        size === "md" && styles.md,
        size === "lg" && styles.lg,
        // custom color mask
        (bgColor || color) && styles.hasCustomColors,
        className,
      )}
      style={customStyles}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{text}</span>
    </span>
  );
};

export default StatusBadge;
