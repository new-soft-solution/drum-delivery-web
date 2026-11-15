import type { HTMLAttributeAnchorTarget } from "react";

export type MenuItemType = {
  key: string;
  label: string;
  label_nl: string;
  isTitle?: boolean;
  icon?: string;
  url?: string;
  badge?: {
    variant: string;
    text: string;
  };
  parentKey?: string;
  target?: HTMLAttributeAnchorTarget;
  isDisabled?: boolean;
  children?: MenuItemType[];
  permission?: string;
  /** Hide this item for the read-only Client role. */
  hideForClient?: boolean;
};

export type SubMenus = {
  item: MenuItemType;
  linkClassName?: string;
  subMenuClassName?: string;
  activeMenuItems?: Array<string>;
  toggleMenu?: (item: MenuItemType, status: boolean) => void;
  className?: string;
};
