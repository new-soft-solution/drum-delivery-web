import type { MenuItemType } from "@/types/menu.type";
import { MODULE_PERMISSIONS } from "@/utils/permissions";

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
    key: "clients",
    label: "Clients",
    label_nl: "Clients",
    url: "/clients",
    icon: "ri:building-line",
    permission: MODULE_PERMISSIONS.clients.view,
  },
  {
    key: "sites",
    label: "Sites",
    label_nl: "Sites",
    url: "/sites",
    icon: "ri:map-pin-line",
    permission: MODULE_PERMISSIONS.sites.view,
  },
  {
    key: "orders",
    label: "Orders",
    label_nl: "Orders",
    url: "/orders",
    icon: "ri:clipboard-line",
    permission: MODULE_PERMISSIONS.orders.view,
  },
  {
    key: "drums",
    label: "Drums",
    label_nl: "Drums",
    url: "/drums",
    icon: "ri:box-3-line",
    permission: MODULE_PERMISSIONS.drums.view,
  },
  {
    key: "shipments",
    label: "Shipments",
    label_nl: "Shipments",
    url: "/shipments",
    icon: "ri:ship-line",
    permission: MODULE_PERMISSIONS.shipments.view,
  },
  {
    key: "truck-deliveries",
    label: "Truck Deliveries",
    label_nl: "Truck Deliveries",
    url: "/truck-deliveries",
    icon: "ri:truck-line",
    permission: MODULE_PERMISSIONS.truckDeliveries.view,
  },
  {
    key: "users",
    label: "Users",
    label_nl: "Users",
    url: "/users",
    icon: "ri:user-settings-line",
    permission: MODULE_PERMISSIONS.users.view,
  },
];
