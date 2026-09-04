import type { Metadata } from "next";
import Image from "next/image";
import NextTopLoader from "nextjs-toploader";

import type { ChildrenType } from "@/types/component-props.type";
import AppProvidersWrapper from "@/components/wrappers/AppProvidersWrapper";
import logoSm from "@/assets/images/logo-dark.png";

import "@/assets/scss/app.scss";
import "@/assets/scss/icons.scss";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const beVietnamPro = { className: "app-font-fallback" };

export const metadata: Metadata = {
  title: {
    template: "%s | Drum Tracer",
    default: "Drum Tracer | Midal Cables",
  },
  description: "Drum Tracer — shipment tracking for Midal Cables",
};

const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: all 15s linear;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.7s forwards;
  z-index: 0;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
`;

export default async function RootLayout({ children }: ChildrenType) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <style suppressHydrationWarning>{splashScreenStyles}</style>
      </head>
      <body
        className={beVietnamPro.className}
        data-sidebar-size="collapsed"
        suppressHydrationWarning
      >
        <div id="splash-screen">
          <Image
            alt="logo-square"
            width={140}
            height={140}
            src={logoSm}
            priority
          />
        </div>
        <NextTopLoader color="#203975" showSpinner={false} />
        <div id="__next_splash">
          <NextIntlClientProvider messages={messages}>
            <AppProvidersWrapper>{children}</AppProvidersWrapper>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
