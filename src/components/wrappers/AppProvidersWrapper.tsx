"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { NotificationProvider } from "@/context/useNotificationContext";
import type { ChildrenType } from "@/types/component-props.type";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DeleteConfirmationProvider } from "@/components/wrappers/DeleteConfirmationProvider";
import { ThemeProvider } from "react-bootstrap";
import { LanguageProvider } from "@/context/LanguageContext";

const LayoutProvider = dynamic(
  () => import("@/context/useLayoutContext").then((mod) => mod.LayoutProvider),
  { ssr: false },
);

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  // const queryClient = new QueryClient();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const splashScreen = document.querySelector("#splash-screen");
    const splashContainer = document.querySelector("#__next_splash");

    const removeSplash = () => {
      splashScreen?.classList.add("remove");
    };

    if (splashContainer?.hasChildNodes()) {
      removeSplash();
    }

    const observer = new MutationObserver(() => {
      removeSplash();
    });

    if (splashContainer) {
      observer.observe(splashContainer, { childList: true });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <DeleteConfirmationProvider>
            <LayoutProvider>
              <NotificationProvider>
                {children}
                <Toaster
                  richColors
                  closeButton
                  duration={6000}
                  position="top-right"
                />
              </NotificationProvider>
            </LayoutProvider>
          </DeleteConfirmationProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};
export default AppProvidersWrapper;
