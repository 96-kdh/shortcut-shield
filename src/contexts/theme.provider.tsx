import { createContext, useEffect, useState } from "react";
import browser from "webextension-polyfill";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
   children: React.ReactNode;
   defaultTheme?: Theme;
   storageKey?: string;
};

type ThemeProviderState = {
   theme: Theme;
   setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
   theme: "system",
   setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
   children,
   defaultTheme = "system",
   storageKey = "vite-ui-theme",
   ...props
}: ThemeProviderProps) {
   const [theme, _setTheme] = useState<Theme>(defaultTheme);

   // 마운트 시: chrome.storage에서 불러오기
   useEffect(() => {
      (async () => {
         const res = await browser.storage.local.get(storageKey);
         const saved = res[storageKey] as Theme | undefined;
         _setTheme(saved ?? defaultTheme);
      })();
   }, [defaultTheme, storageKey]);

   useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
         const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
         root.classList.add(systemTheme);
         return;
      }

      root.classList.add(theme);
   }, [theme]);

   const value = {
      theme,
      setTheme: (theme: Theme) => {
         browser.storage.local.set({ [storageKey]: theme }).catch(console.error);
         _setTheme(theme);
      },
   };

   return (
      <ThemeProviderContext.Provider {...props} value={value}>
         {children}
      </ThemeProviderContext.Provider>
   );
}
