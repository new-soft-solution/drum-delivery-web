import { useMemo } from "react";
import { useSessionStore } from "@/store/useSessionStore";

export type PermissionAction = "add" | "change" | "delete" | "view";

export const permCode = (
  appLabel: string,
  model: string,
  action: PermissionAction,
): string => `${appLabel}.${action}_${model}`;

export const customPermCode = (appLabel: string, codename: string): string =>
  `${appLabel}.${codename}`;

export const hasPermission = (
  permissions: string[] | undefined,
  permission: string,
): boolean => (permissions ?? []).includes(permission);

export const hasAnyPermission = (
  permissions: string[] | undefined,
  perms: string[],
): boolean => perms.some((p) => hasPermission(permissions, p));

export const hasAllPermissions = (
  permissions: string[] | undefined,
  perms: string[],
): boolean => perms.every((p) => hasPermission(permissions, p));

export const MODULE_PERMISSIONS = {
  clients: {
    add: permCode("clients", "client", "add"),
    change: permCode("clients", "client", "change"),
    delete: permCode("clients", "client", "delete"),
    view: permCode("clients", "client", "view"),
  },
  drums: {
    add: permCode("drums", "drum", "add"),
    change: permCode("drums", "drum", "change"),
    delete: permCode("drums", "drum", "delete"),
    view: permCode("drums", "drum", "view"),
  },
  orders: {
    add: permCode("orders", "order", "add"),
    change: permCode("orders", "order", "change"),
    delete: permCode("orders", "order", "delete"),
    view: permCode("orders", "order", "view"),
  },
  shipments: {
    add: permCode("shipments", "shipment", "add"),
    change: permCode("shipments", "shipment", "change"),
    delete: permCode("shipments", "shipment", "delete"),
    view: permCode("shipments", "shipment", "view"),
  },
  shipmentDrums: {
    add: permCode("shipments", "shipmentdrum", "add"),
    change: permCode("shipments", "shipmentdrum", "change"),
    delete: permCode("shipments", "shipmentdrum", "delete"),
    view: permCode("shipments", "shipmentdrum", "view"),
  },
  sites: {
    add: permCode("sites", "site", "add"),
    change: permCode("sites", "site", "change"),
    delete: permCode("sites", "site", "delete"),
    view: permCode("sites", "site", "view"),
  },
  truckDeliveries: {
    add: permCode("truck_deliveries", "truckdelivery", "add"),
    change: permCode("truck_deliveries", "truckdelivery", "change"),
    delete: permCode("truck_deliveries", "truckdelivery", "delete"),
    view: permCode("truck_deliveries", "truckdelivery", "view"),
  },
  users: {
    add: permCode("users", "user", "add"),
    change: permCode("users", "user", "change"),
    delete: permCode("users", "user", "delete"),
    view: permCode("users", "user", "view"),
  },
} as const;

export type ModuleKey = keyof typeof MODULE_PERMISSIONS;

export const getCurrentPermissions = (): string[] =>
  useSessionStore.getState().session?.user?.permissions ?? [];

const EMPTY_PERMISSIONS: string[] = [];

export const usePermissions = () => {
  const permissions = useSessionStore(
    (s) => s.session?.user?.permissions ?? EMPTY_PERMISSIONS,
  );
  return useMemo(
    () => ({
      permissions,
      has: (permission: string) => hasPermission(permissions, permission),
      hasAny: (perms: string[]) => hasAnyPermission(permissions, perms),
      hasAll: (perms: string[]) => hasAllPermissions(permissions, perms),
    }),
    [permissions],
  );
};

export const ROLES = {
  Admin: "Admin",
  Shipper: "Shipper",
  Client: "Client",
} as const;

export const isClientRole = (role: string | undefined | null): boolean =>
  (role ?? "").toLowerCase() === "client";

/** True when the signed-in user has the read-only Client role. */
export const useIsClient = (): boolean =>
  useSessionStore((s) => isClientRole(s.session?.user?.role));

export const isShipperRole = (role: string | undefined | null): boolean =>
  (role ?? "").toLowerCase() === "shipper";

/** Client and Shipper users can view only: no create/edit/delete. */
export const isReadOnlyRole = (role: string | undefined | null): boolean =>
  isClientRole(role) || isShipperRole(role);

export const useIsReadOnly = (): boolean =>
  useSessionStore((s) => isReadOnlyRole(s.session?.user?.role));

/** Modules a Client user may open (read-only, scoped to their company). */
const CLIENT_VISIBLE_MODULES: readonly ModuleKey[] = [
  "orders",
  "shipments",
  "shipmentDrums",
  "truckDeliveries",
];

export const useModulePermissions = (moduleKey: ModuleKey) => {
  const { has } = usePermissions();
  const isClient = useIsClient();
  const isReadOnly = useIsReadOnly();
  const codes = MODULE_PERMISSIONS[moduleKey];
  return useMemo(
    () => ({
      // Client and Shipper users are read-only: never expose operational actions,
      // whatever the backend permission list says.
      canAdd: !isReadOnly && has(codes.add),
      canChange: !isReadOnly && has(codes.change),
      canDelete: !isReadOnly && has(codes.delete),
      canView:
        has(codes.view) &&
        (!isClient || CLIENT_VISIBLE_MODULES.includes(moduleKey)),
      has,
    }),
    [has, codes, isClient, isReadOnly, moduleKey],
  );
};

export const usePermission = (permission: string): boolean => {
  const { has } = usePermissions();
  return has(permission);
};
