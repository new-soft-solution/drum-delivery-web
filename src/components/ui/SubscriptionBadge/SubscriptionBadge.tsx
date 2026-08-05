import clsx from "clsx";
import type { Restaurant } from "@/types/restaurant.type";
import React from "react";

const PLAN_BADGE_CLASS: Record<string, string> = {
  Basic: "badge-plan-basic",
  Standard: "badge-plan-standard",
  Premium: "badge-plan-premium",
  Gold: "badge-plan-gold",
};
interface SubscriptionBadgeProps {
  res: Restaurant;
  className?: string;
}
const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  res,
  className,
}) => {
  const activeSubscription = res?.active_subscriptions?.[0] || null;
  const currentPlanName = activeSubscription?.plan?.name ?? null;
  const getPlanBadgeClass = (planName?: string | null) =>
    PLAN_BADGE_CLASS[planName ?? ""] || "badge-plan-basic";
  return (
    <>
      {currentPlanName && (
        <span
          className={clsx(
            "badge fs-10",
            getPlanBadgeClass(currentPlanName),
            className,
          )}
        >
          {currentPlanName} Plan
        </span>
      )}
    </>
  );
};
export default SubscriptionBadge;
