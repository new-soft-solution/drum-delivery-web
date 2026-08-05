import { RestaurantFilterType, RestaurantTableConfig } from "@/types/restaurant.type";

export const restaurantStatusArray = [
  "pending_approval",
  "approved",
  "rejected",
  "suspended",
  "published",
  "publish_requirements_failed",
] as const;

export const statusOptions = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

// Which target statuses the API allows FROM each current status.
// Keep in sync with the backend transition rules — the row's
// Change Status menu renders every option, but disables the ones
// that aren't in this list for the restaurant's current status
// (surfaces the "invalid transition" 400 as a disabled state instead).
// "published" is never offered as a target — the only path to published
// is the owner-publish flow.
export const allowedStatusTransitions: Record<string, readonly string[]> = {
  pending_approval: ["approved", "rejected", "suspended"],
  approved: ["suspended"],
  published: ["suspended", "approved", "publish_requirements_failed"],
  publish_requirements_failed: ["approved", "suspended"],
  rejected: ["approved"],
  suspended: ["approved"],
};

export const statusFilters = [
  { value: "", label: "All" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "published", label: "Published" },
  {
    value: "publish_requirements_failed",
    label: "Publish Requirements Failed",
  },
];

export const defaultConfig: RestaurantTableConfig = {
  enableSelection: true,
  enableStatusChange: true,
  enableDetailsView: true,
  enableDelete: true,
};

export const initialFilters: RestaurantFilterType = {
  status: "",
  deleted: null,
};
