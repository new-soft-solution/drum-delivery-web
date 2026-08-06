"use client";

import { createContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import { Locale } from "@/types/localization.type";
import { useRouter } from "next/navigation";

interface LanguageContextType {
  lang: Locale;
  setLang: (locale: Locale) => void;
}
const initialValue: LanguageContextType = {
  lang: "nl",
  setLang: () => {},
};
const LanguageContext = createContext(initialValue);

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Locale>("nl");
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedLocale = getCookie("lang") as Locale;
    if (storedLocale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(storedLocale);
    } else {
      const browserLocale = navigator.language.slice(0, 2) as Locale;
      setLangState(browserLocale);
      setCookie("lang", browserLocale, { maxAge: 60 * 60 * 24 * 365 });
      router.refresh();
    }
    setIsHydrated(true);
  }, [router]);

  const setLang = (locale: Locale) => {
    setLangState(locale);
    setCookie("lang", locale, { maxAge: 60 * 60 * 24 * 365 });
    router.refresh();
  };

  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext, LanguageProvider };
