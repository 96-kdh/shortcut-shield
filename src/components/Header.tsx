import { ChevronRight, EllipsisVertical, Moon, MoveLeft, Sun } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import { useTheme } from "@/hooks/contexts/useTheme.ts";
import { SupportedLanguage } from "@/lib/i18n.ts";

const Header = () => {
   const { setTheme, theme } = useTheme();
   const { t, i18n } = useTranslation();
   const { currentView, setCurrentView } = usePopup();

   const selectRef = React.useRef<HTMLSelectElement>(null);

   const handleClick = useCallback(
      (e: React.MouseEvent<HTMLLabelElement>) => {
         e.preventDefault();
         // 직접 select에 포커스를 주고, mousedown 이벤트를 강제로 디스패치하여 네이티브 드롭다운이 열리도록 시도
         selectRef.current?.focus();
         const event = new MouseEvent("mousedown", {
            view: window,
            bubbles: true,
            cancelable: true,
         });
         selectRef.current?.dispatchEvent(event);
      },
      [selectRef.current],
   );

   const themes: { name: "system" | "light" | "dark"; el: string | JSX.Element }[] = useMemo(
      () => [
         {
            name: "system",
            el: t("system"),
         },
         {
            name: "light",
            el: <Sun className="h-4 w-4" />,
         },
         {
            name: "dark",
            el: <Moon className="h-4 w-4" />,
         },
      ],
      [],
   );

   return (
      <header className="flex items-center justify-between min-h-12 px-1">
         {currentView === PopupView.Index ? (
            <div className="p-1">
               <div className="w-5"></div>
            </div>
         ) : (
            <div
               className="text-accent-foreground p-1 rounded-md hover:bg-gray-200 dark:hover:bg-sidebar-accent cursor-pointer"
               onClick={() => setCurrentView(PopupView.Index)}
            >
               <MoveLeft className="w-5 h-5" />
            </div>
         )}
         <h1 className="text-lg font-semibold text-center font-mono">{"Shortcut Shield"}</h1>
         <Popover>
            <PopoverTrigger>
               {currentView === PopupView.Index ? (
                  <div className="text-accent-foreground p-1 rounded-md hover:bg-gray-200 dark:hover:bg-sidebar-accent cursor-pointer">
                     <EllipsisVertical className="w-5 h-5" />
                  </div>
               ) : (
                  <div className="p-1">
                     <div className="w-5"></div>
                  </div>
               )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-4">
               <div className="space-y-6">
                  {/* 테마 설정 영역 */}
                  <div>
                     <div className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t("theme")}</div>
                     <div className="flex items-center space-x-2">
                        {themes.map((v) => {
                           return (
                              <button
                                 key={v.name}
                                 onClick={() => setTheme(v.name)}
                                 className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-full border text-sm font-medium cursor-pointer ${
                                    theme === v.name
                                       ? "bg-gray-200 dark:bg-sidebar-accent"
                                       : "border-transparent hover:bg-gray-100 dark:hover:bg-sidebar-accent"
                                 } `}
                              >
                                 {v.el}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  {/* 언어 설정 영역 */}
                  <label
                     onClick={handleClick}
                     className="relative flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 hover:bg-gray-100 dark:hover:bg-sidebar-accent"
                  >
                     <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("lang")}</span>
                     <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t(i18n.language)}</span>
                        <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                     </div>
                     <select
                        ref={selectRef}
                        id="language"
                        defaultValue={i18n.language}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                     >
                        {Object.values(SupportedLanguage).map((language) => {
                           return (
                              <option key={language} value={language}>
                                 {t(language)}
                              </option>
                           );
                        })}
                     </select>
                  </label>
               </div>
            </PopoverContent>
         </Popover>
      </header>
   );
};

export default Header;
