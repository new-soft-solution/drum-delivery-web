import AppShell from "@/components/layout/AppShell";
import type { ChildrenType } from "@/types/component-props.type";

// Auth is enforced server-side in src/middleware.ts before any request ever
// reaches this layout, so there's no client-side redirect/loading-gate
// needed here — if we're rendering, the session cookie already checked out.
export default function AppGroupLayout({ children }: ChildrenType) {
  return <AppShell>{children}</AppShell>;
}
