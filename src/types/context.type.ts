import type { BaseSyntheticEvent, ReactNode } from "react";
import type { Control } from "react-hook-form";

import type { BootstrapVariantType } from "./component-props.type";
import { ToastPosition } from "react-bootstrap/esm/ToastContainer";

export type DialogControlType = {
  open: boolean;
  toggle: () => void;
};

export type ThemeType = "light" | "dark";

export type MenuType = {
  theme: ThemeType;
  size: "default" | "collapsed";
};

export type LayoutState = {
  theme: ThemeType;
  menu: MenuType;
};

export type LayoutType = LayoutState & {
  themeMode: ThemeType;
  changeTheme: (theme: ThemeType) => void;
  changeMenu: {
    theme: (theme: MenuType["theme"]) => void;
    size: (size: MenuType["size"]) => void;
  };
};

export type KanbanDialogType = {
  showNewTaskModal: boolean;
  showSectionModal: boolean;
};

export type FormControlSubmitType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  newRecord: (values: BaseSyntheticEvent) => void;
  editRecord: (values: BaseSyntheticEvent) => void;
  deleteRecord: (id: string) => void;
};

export type ShowNotificationType = {
  title?: string;
  message: string | ReactNode;
  variant?: BootstrapVariantType;
  delay?: number;
  position?: ToastPosition;
};

export type ToastrProps = {
  show: boolean;
  onClose?: () => void;
  position?: ToastPosition;
} & ShowNotificationType;

export type NotificationContextType = {
  showNotification: ({ title, message, variant }: ShowNotificationType) => void;
};
