"use client";
import type { ReactNode } from "react";
import { useModulePermissions, type ModuleKey } from "@/utils/permissions";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";

interface RequireModuleViewProps {
  module: ModuleKey;
  children: ReactNode;
}

export const RequireModuleView = ({
  module,
  children,
}: RequireModuleViewProps) => {
  const { canView } = useModulePermissions(module);

  if (!canView) {
    return (
      <EmptyState
        icon="ri:shield-cross-line"
        title="You don't have access to this page"
        description="Your account doesn't have permission to view this section. Contact an administrator if you think this is a mistake."
      />
    );
  }

  return <>{children}</>;
};

export default RequireModuleView;
