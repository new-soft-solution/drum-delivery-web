"use client";
import { Suspense } from "react";
import type { ChildrenType } from "@/types/component-props.type";
import FallbackLoading from "@/components/FallbackLoading";
import Footer from "../Footer";

export const BaseLayout = ({ children }: ChildrenType) => {
  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="container-xxl">
          <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
        </div>
        <Footer />
      </div>
    </div>
  );
};
