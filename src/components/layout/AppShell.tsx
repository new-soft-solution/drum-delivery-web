"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import TopNavigationBar from "@/components/layout/TopNavigationBar";
import { BaseLayout } from "@/components/layout/BaseLayout/BaseLayout";
import FallbackLoading from "@/components/FallbackLoading";
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";
import type { ChildrenType } from "@/types/component-props.type";
import useRefreshSessionOnMount from "@/hooks/useRefreshSessionOnMount";

const SideNav = dynamic(
  () => import("@/components/layout/VerticalNavigationBar"),
  {
    loading: () => <FallbackLoading />,
    ssr: false,
  },
);

export default function AppShell({ children }: ChildrenType) {
  useRefreshSessionOnMount();
  return (
    <>
      <Suspense>
        <TopNavigationBar />
      </Suspense>
      <Suspense fallback={<FallbackLoading />}>
        <SideNav />
      </Suspense>
      <BaseLayout>
        <Breadcrumbs />
        {children}
      </BaseLayout>
    </>
  );
}
