"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FallbackLoading from "@/components/FallbackLoading";
import { getSession } from "@/lib/drum-tracer/session-client";
import type { ChildrenType } from "@/types/component-props.type";

export default function AppGroupLayout({ children }: ChildrenType) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(true);
  }, [router]);

  if (!checked) {
    return <FallbackLoading />;
  }

  return <AppShell>{children}</AppShell>;
}
