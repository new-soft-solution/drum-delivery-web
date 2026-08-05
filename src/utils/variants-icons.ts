import type {
  KanbanSectionType,
  CustomerType,
  KanbanTaskTag,
  PriorityType,
  ProductType,
} from "@/types/data.type";

export const getProductStatusVariant = (status: ProductType["status"]) => {
  let statusVariant = "primary";
  if (status === "Out of Stock") statusVariant = "danger";
  else if (status === "Inactive") statusVariant = "warning";
  else if (status === "Published") statusVariant = "info";
  return statusVariant;
};

export const getCustomerStatusVariant = (status: CustomerType["status"]) => {
  let statusVariant = "info";
  if (status === "Inactive") statusVariant = "danger";
  else if (status === "Repeat") statusVariant = "blue";
  return statusVariant;
};

export const getProductStatusIcon = (status: ProductType["status"]) => {
  let statusIcon = "fa-solid:check";
  if (status === "Out of Stock") statusIcon = "fa6-solid:xmark";
  else if (status === "Inactive") statusIcon = "fa6-solid:xmark";
  else if (status === "In Stock") statusIcon = "fa6-solid:box-archive";
  return statusIcon;
};

export const getKanbanSectionVariant = (title: KanbanSectionType["title"]) => {
  let variant = "primary";
  if (title === "To Do") variant = "pink";
  else if (title === "In Progress") variant = "warning";
  else if (title === "Review") variant = "success";
  else if (title === "Done") variant = "info";
  return variant;
};

export const getKanbanTaskPriorityVariant = (priority: PriorityType) => {
  let variant = "warning";
  if (priority === "High") variant = "danger";
  else if (priority === "Medium") variant = "info";
  return variant;
};

export const getKanbanTaskTagVariant = (tag: KanbanTaskTag) => {
  let variant = "primary";
  if (tag === "API") variant = "primary";
  else if (tag === "Form Submit") variant = "info";
  else if (tag === "Responsive") variant = "danger";
  return variant;
};

// New added functions
export const getRestaurantStatusVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "success";
    case "pending_approval":
      return "warning";
    case "rejected":
      return "danger";
    case "suspended":
      return "secondary";
    default:
      return "primary";
  }
};

export const getRestaurantStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return "mdi:check-circle-outline";
    case "pending_approval":
      return "mdi:clock-outline";
    case "rejected":
      return "mdi:close-circle-outline";
    case "suspended":
      return "mdi:pause-circle-outline";
    default:
      return "mdi:help-circle-outline";
  }
};
