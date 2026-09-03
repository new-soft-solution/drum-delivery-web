import type { MenuItemType } from "@/types/menu.type";

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: "main",
    label: "Drum Tracer",
    label_nl: "Drum Tracer",
    isTitle: true,
  },
  {
    key: "dashboard",
    label: "Dashboard",
    label_nl: "Dashboard",
    url: "/",
    icon: "iconoir:home-simple",
  },
  {
    key: "orders",
    label: "Orders",
    label_nl: "Orders",
    url: "/orders",
    icon: "ri:clipboard-line",
  },
  {
    key: "shipments",
    label: "Shipments",
    label_nl: "Shipments",
    url: "/shipments",
    icon: "ri:ship-line",
  },
  {
    key: "truck-deliveries",
    label: "Truck Deliveries",
    label_nl: "Truck Deliveries",
    url: "/truck-deliveries",
    icon: "ri:truck-line",
  },
  {
    key: "drums",
    label: "Drums",
    label_nl: "Drums",
    url: "/drums",
    icon: "ri:box-3-line",
  },
  {
    key: "clients",
    label: "Clients",
    label_nl: "Clients",
    url: "/clients",
    icon: "ri:building-line",
  },
  {
    key: "sites",
    label: "Sites",
    label_nl: "Sites",
    url: "/sites",
    icon: "ri:map-pin-line",
  },
];
